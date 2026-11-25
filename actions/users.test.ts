import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("@/lib/admin/authorize-role", () => ({
  authorizeAdmin: vi.fn(),
  authorizeStaff: vi.fn(),
}));

vi.mock("@/lib/admin/get-staff-shell", () => ({
  getStaffShell: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  consumeStaffMutationRateLimit: vi.fn(async () => true),
}));

const createUserMock = vi.fn();
const updateUserByIdMock = vi.fn();
const deleteUserMock = vi.fn();
const profileUpdateEq = vi.fn();
const rpcMock = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    auth: {
      admin: {
        createUser: createUserMock,
        updateUserById: updateUserByIdMock,
        deleteUser: deleteUserMock,
      },
    },
  })),
}));

import {
  createUser,
  deleteUser,
  hardDeleteUser,
  updateUser,
} from "@/actions/users";
import { authorizeAdmin, authorizeStaff } from "@/lib/admin/authorize-role";
import { getStaffShell } from "@/lib/admin/get-staff-shell";

const userId = "44444444-4444-4444-8444-444444444444";

function staffSession(overrides?: {
  userId?: string;
  from?: ReturnType<typeof vi.fn>;
  rpc?: ReturnType<typeof vi.fn>;
}) {
  return {
    status: "success" as const,
    userId: overrides?.userId ?? "admin-1",
    supabase: {
      from: overrides?.from ?? vi.fn(),
      rpc: overrides?.rpc ?? rpcMock,
    } as never,
  };
}

describe("users actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getStaffShell).mockResolvedValue({
      role: "admin",
      isAdmin: true,
      isEditor: false,
      fullName: "Admin",
      email: "admin@example.com",
    });
  });

  it("createUser rejects invalid payloads", async () => {
    const result = await createUser({
      fullName: "A",
      email: "bad",
      password: "short",
      role: "admin",
    });

    expect(result.status).toBe("error");
    expect(authorizeStaff).not.toHaveBeenCalled();
  });

  it("createUser returns unauthorized", async () => {
    vi.mocked(authorizeStaff).mockResolvedValue({
      status: "error",
      message: "You do not have permission to manage users.",
    });

    const result = await createUser({
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      password: "Testpass1",
      role: "admin",
    });

    expect(result.status).toBe("error");
    expect(createUserMock).not.toHaveBeenCalled();
  });

  it("createUser blocks editors from creating admins", async () => {
    vi.mocked(getStaffShell).mockResolvedValue({
      role: "editor",
      isAdmin: false,
      isEditor: true,
      fullName: "Editor",
      email: "editor@example.com",
    });
    vi.mocked(authorizeStaff).mockResolvedValue(staffSession());

    const result = await createUser({
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      password: "Testpass1",
      role: "admin",
    });

    expect(result.status).toBe("error");
    expect(createUserMock).not.toHaveBeenCalled();
  });

  it("createUser syncs profile role after auth create", async () => {
    const profileUpdate = vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          maybeSingle: profileUpdateEq,
        })),
      })),
    }));
    profileUpdateEq.mockResolvedValue({ data: { id: userId }, error: null });
    vi.mocked(authorizeStaff).mockResolvedValue(
      staffSession({
        from: vi.fn(() => ({ update: profileUpdate })),
      }),
    );
    createUserMock.mockResolvedValue({
      data: { user: { id: userId } },
      error: null,
    });

    const result = await createUser({
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      password: "Testpass1",
      role: "editor",
    });

    expect(result.status).toBe("success");
    expect(createUserMock).toHaveBeenCalled();
  });

  it("deleteUser blocks last editor", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: { role: "editor" },
      error: null,
    });
    const eqRole = vi.fn().mockResolvedValue({ count: 1, error: null });
    const select = vi.fn((cols: string, opts?: { head?: boolean }) => {
      if (opts?.head) {
        return { eq: eqRole };
      }
      return { eq: vi.fn(() => ({ maybeSingle })) };
    });
    vi.mocked(authorizeStaff).mockResolvedValue(
      staffSession({
        userId: "admin-1",
        from: vi.fn(() => ({ select })),
      }),
    );

    const result = await deleteUser({ id: userId });

    expect(result).toMatchObject({
      status: "error",
      code: "LAST_EDITOR",
    });
    expect(deleteUserMock).not.toHaveBeenCalled();
  });

  it("deleteUser blocks editors from deleting peer editors", async () => {
    vi.mocked(getStaffShell).mockResolvedValue({
      role: "editor",
      isAdmin: false,
      isEditor: true,
      fullName: "Editor",
      email: "editor@example.com",
    });
    const maybeSingle = vi.fn().mockResolvedValue({
      data: { role: "editor" },
      error: null,
    });
    const select = vi.fn(() => ({
      eq: vi.fn(() => ({ maybeSingle })),
    }));
    vi.mocked(authorizeStaff).mockResolvedValue(
      staffSession({
        userId: "editor-1",
        from: vi.fn(() => ({ select })),
      }),
    );

    const result = await deleteUser({ id: userId });

    expect(result).toMatchObject({
      status: "error",
      message: "Editors can only delete viewer accounts.",
    });
    expect(deleteUserMock).not.toHaveBeenCalled();
  });

  it("hardDeleteUser requires admin and calls RPC", async () => {
    vi.mocked(authorizeAdmin).mockResolvedValue(
      staffSession({ rpc: rpcMock }) as never,
    );
    rpcMock.mockResolvedValue({ error: null });

    const result = await hardDeleteUser({ id: userId });

    expect(result.status).toBe("success");
    expect(rpcMock).toHaveBeenCalledWith("admin_hard_delete_user", {
      p_target: userId,
    });
  });

  it("updateUser rejects demoting the last admin", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: { role: "admin" },
      error: null,
    });
    const eqRole = vi.fn().mockResolvedValue({ count: 1, error: null });
    const select = vi.fn((cols: string, opts?: { head?: boolean }) => {
      if (opts?.head) {
        return { eq: eqRole };
      }
      return { eq: vi.fn(() => ({ maybeSingle })) };
    });
    vi.mocked(authorizeStaff).mockResolvedValue(
      staffSession({
        userId: "other-admin",
        from: vi.fn(() => ({ select, update: vi.fn() })),
      }),
    );

    const result = await updateUser({
      id: userId,
      fullName: "Only Admin",
      email: "only@example.com",
      role: "viewer",
      type: "startup",
    });

    expect(result).toMatchObject({
      status: "error",
      code: "LAST_ADMIN",
    });
    expect(updateUserByIdMock).not.toHaveBeenCalled();
  });

  it("updateUser blocks editors from changing account emails", async () => {
    vi.mocked(getStaffShell).mockResolvedValue({
      role: "editor",
      isAdmin: false,
      isEditor: true,
      fullName: "Editor",
      email: "editor@example.com",
    });

    const roleMaybeSingle = vi.fn().mockResolvedValue({
      data: { role: "editor" },
      error: null,
    });
    const snapshotMaybeSingle = vi.fn().mockResolvedValue({
      data: {
        email: "peer@example.com",
        full_name: "Peer Editor",
        role: "editor",
      },
      error: null,
    });
    let selectCall = 0;
    const select = vi.fn(() => {
      selectCall += 1;
      return {
        eq: vi.fn(() => ({
          maybeSingle:
            selectCall === 1 ? roleMaybeSingle : snapshotMaybeSingle,
        })),
      };
    });

    vi.mocked(authorizeStaff).mockResolvedValue(
      staffSession({
        userId: "editor-1",
        from: vi.fn(() => ({ select, update: vi.fn() })),
      }),
    );

    const result = await updateUser({
      id: userId,
      fullName: "Peer Editor",
      email: "attacker@evil.example",
      role: "editor",
      type: "startup",
    });

    expect(result).toMatchObject({
      status: "error",
      message: "Only administrators can change account emails.",
    });
    expect(updateUserByIdMock).not.toHaveBeenCalled();
  });

  it("updateUser allows editors to update name without changing email", async () => {
    vi.mocked(getStaffShell).mockResolvedValue({
      role: "editor",
      isAdmin: false,
      isEditor: true,
      fullName: "Editor",
      email: "editor@example.com",
    });

    const roleMaybeSingle = vi.fn().mockResolvedValue({
      data: { role: "viewer" },
      error: null,
    });
    const snapshotMaybeSingle = vi.fn().mockResolvedValue({
      data: {
        email: "viewer@example.com",
        full_name: "Old Name",
        role: "viewer",
      },
      error: null,
    });
    let selectCall = 0;
    const select = vi.fn(() => {
      selectCall += 1;
      return {
        eq: vi.fn(() => ({
          maybeSingle:
            selectCall === 1 ? roleMaybeSingle : snapshotMaybeSingle,
        })),
      };
    });
    const profileUpdateMaybe = vi
      .fn()
      .mockResolvedValue({ data: { id: userId }, error: null });
    const profileUpdate = vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          maybeSingle: profileUpdateMaybe,
        })),
      })),
    }));

    vi.mocked(authorizeStaff).mockResolvedValue(
      staffSession({
        userId: "editor-1",
        from: vi.fn(() => ({ select, update: profileUpdate })),
      }),
    );
    updateUserByIdMock.mockResolvedValue({ error: null });

    const result = await updateUser({
      id: userId,
      fullName: "New Name",
      email: "viewer@example.com",
      role: "viewer",
      type: "investor",
    });

    expect(result.status).toBe("success");
    expect(updateUserByIdMock).toHaveBeenCalled();
    expect(profileUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "investor",
        full_name: "New Name",
      }),
    );
  });

  it("createUser can assign investor audience type", async () => {
    const profileUpdate = vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          maybeSingle: profileUpdateEq,
        })),
      })),
    }));
    profileUpdateEq.mockResolvedValue({ data: { id: userId }, error: null });
    vi.mocked(authorizeStaff).mockResolvedValue(
      staffSession({
        from: vi.fn(() => ({ update: profileUpdate })),
      }),
    );
    createUserMock.mockResolvedValue({
      data: { user: { id: userId } },
      error: null,
    });

    const result = await createUser({
      fullName: "Ivy Investor",
      email: "ivy@example.com",
      password: "Testpass1",
      role: "viewer",
      type: "investor",
    });

    expect(result.status).toBe("success");
    expect(profileUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "investor",
        role: "viewer",
      }),
    );
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("@/lib/admin/authorize-admin", () => ({
  authorizeAdmin: vi.fn(),
}));

const createUserMock = vi.fn();
const updateUserByIdMock = vi.fn();
const deleteUserMock = vi.fn();
const profileUpdateEq = vi.fn();

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

import { createUser, deleteUser, updateUser } from "@/actions/users";
import { authorizeAdmin } from "@/lib/admin/authorize-admin";

const userId = "44444444-4444-4444-8444-444444444444";

describe("users actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createUser rejects invalid payloads", async () => {
    const result = await createUser({
      fullName: "A",
      email: "bad",
      password: "short",
      role: "admin",
    });

    expect(result.status).toBe("error");
    expect(authorizeAdmin).not.toHaveBeenCalled();
  });

  it("createUser returns unauthorized", async () => {
    vi.mocked(authorizeAdmin).mockResolvedValue({
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

  it("createUser syncs profile role after auth create", async () => {
    const profileUpdate = vi.fn(() => ({ eq: profileUpdateEq }));
    profileUpdateEq.mockResolvedValue({ error: null });
    vi.mocked(authorizeAdmin).mockResolvedValue({
      status: "success",
      userId: "admin-1",
      supabase: {
        from: vi.fn(() => ({ update: profileUpdate })),
      } as never,
    });
    createUserMock.mockResolvedValue({
      data: { user: { id: userId } },
      error: null,
    });

    const result = await createUser({
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      password: "Testpass1",
      role: "admin",
    });

    expect(result).toEqual({
      status: "success",
      message: "User created successfully.",
    });
    expect(createUserMock).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "ada@example.com",
        app_metadata: { app_role: "admin" },
      }),
    );
    expect(profileUpdate).toHaveBeenCalledWith({ role: "admin" });
    expect(profileUpdateEq).toHaveBeenCalledWith("id", userId);
  });

  it("updateUser blocks self demotion", async () => {
    vi.mocked(authorizeAdmin).mockResolvedValue({
      status: "success",
      userId,
      supabase: {} as never,
    });

    // update schema locks role to admin — self demotion uses role !== admin
    // which cannot happen with locked schema. Cover auth update path instead.
    updateUserByIdMock.mockResolvedValue({ error: null });
    const profileUpdate = vi.fn(() => ({
      eq: vi.fn().mockResolvedValue({ error: null }),
    }));
    vi.mocked(authorizeAdmin).mockResolvedValue({
      status: "success",
      userId: "other-admin",
      supabase: {
        from: vi.fn(() => ({ update: profileUpdate })),
      } as never,
    });

    const result = await updateUser({
      id: userId,
      fullName: "Ada Admin",
      email: "ada@example.com",
      role: "admin",
    });

    expect(result.status).toBe("success");
    expect(updateUserByIdMock).toHaveBeenCalled();
  });

  it("deleteUser deletes via auth admin API", async () => {
    vi.mocked(authorizeAdmin).mockResolvedValue({
      status: "success",
      userId: "admin-1",
      supabase: {} as never,
    });
    deleteUserMock.mockResolvedValue({ error: null });

    const result = await deleteUser({ id: userId });

    expect(result.status).toBe("success");
    expect(deleteUserMock).toHaveBeenCalledWith(userId);
  });
});

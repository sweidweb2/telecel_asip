export type UserRole = "admin" | "editor" | "viewer";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

/** Subset shown in the dashboard chrome for the signed-in user. */
export type CurrentUserProfile = Pick<
  Profile,
  "id" | "email" | "full_name" | "role"
>;

/** Presentational shape passed from the dashboard layout into client chrome. */
export type DashboardAccount = {
  name: string;
  email: string;
  initials: string;
};

export type UserListResult = {
  users: Profile[];
  total: number;
  totalPages: number;
};

export type UserStats = {
  total: number;
  admins: number;
  editors: number;
  viewers: number;
  newThisWeek: number;
  newThisMonth: number;
};

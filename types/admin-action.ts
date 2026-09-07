export type AdminActionResult =
  | { status: "success"; message: string; id?: string }
  | { status: "error"; message: string };

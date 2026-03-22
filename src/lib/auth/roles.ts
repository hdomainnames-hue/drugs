export type Role = "admin" | "editor" | "viewer";

export function canManageUsers(role: Role) {
  return role === "admin";
}

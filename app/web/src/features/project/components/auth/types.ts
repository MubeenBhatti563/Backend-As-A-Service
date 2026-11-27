export type UserRole = "Admin" | "User";
export type UserStatus = "Active" | "Inactive";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  verified: boolean;
  lastLogin: string;
  status: UserStatus;
}

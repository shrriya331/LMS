// src/types/dto.ts
export interface RegistrationRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: "STUDENT" | "LIBRARIAN";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserSummary {
  id: number;
  email: string;
  name?: string;
  role?: string;
  firstLogin?: boolean;
  status?: string;
}

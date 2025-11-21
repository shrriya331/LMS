// src/api/authApi.ts
import client from "./axiosClient";
import type { LoginRequest, RegistrationRequest } from "../types/dto";

export const register = (payload: RegistrationRequest) =>
  client.post("/auth/register", payload);

export const login = (payload: LoginRequest) =>
  client.post("/auth/login", payload);

import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().min(3).email().max(200),
  password: z.string().min(1).max(200),
});
export type LoginInput = z.infer<typeof loginSchema>;

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN';
  lastLoginAt: string | null;
}
export interface LoginResponse {
  user: SessionUser;
}

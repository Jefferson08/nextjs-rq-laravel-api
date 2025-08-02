// Tipos de autenticação
export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginData {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  user: User;
  message?: string;
}

export interface EmailVerificationResponse {
  message: string;
}

// Tipos para os hooks de autenticação
export interface UseAuthOptions {
  middleware?: "auth" | "guest";
  redirectIfAuthenticated?: string;
}

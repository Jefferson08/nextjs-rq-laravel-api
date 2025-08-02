import { apiClient, csrfClient } from "./client";
import type {
  AuthResponse,
  EmailVerificationResponse,
  ForgotPasswordData,
  LoginData,
  RegisterData,
  ResetPasswordData,
  User,
} from "./auth-types";

export const authService = {
  // 🛡️ Inicializar CSRF cookie
  async csrf(): Promise<void> {
    await csrfClient.get("/sanctum/csrf-cookie");
  },

  // 🔐 Login do usuário
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/login", data);
    return response.data;
  },

  // 📝 Registro de novo usuário
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/register", data);
    return response.data;
  },

  // 🚪 Logout do usuário
  async logout(): Promise<void> {
    await apiClient.post("/logout");
  },

  // 👤 Buscar dados do usuário autenticado
  async user(): Promise<User> {
    const response = await apiClient.get<User>("/user");
    return response.data;
  },

  // 📧 Solicitar reset de senha
  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      "/forgot-password",
      data,
    );
    return response.data;
  },

  // 🔑 Reset de senha
  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      "/reset-password",
      data,
    );
    return response.data;
  },

  // ✉️ Reenviar email de verificação
  async resendEmailVerification(): Promise<EmailVerificationResponse> {
    const response = await apiClient.post<EmailVerificationResponse>(
      "/email/verification-notification",
    );
    return response.data;
  },

  // ✅ Verificar email
  async verifyEmail(
    id: string,
    hash: string,
    expires: string,
    signature: string,
  ): Promise<void> {
    await apiClient.get(`/verify-email/${id}/${hash}`, {
      params: { expires, signature },
    });
  },
};

// Exportar funções individuais para compatibilidade
export const login = authService.login;
export const register = authService.register;
export const logout = authService.logout;
export const getUser = authService.user;
export const forgotPassword = authService.forgotPassword;
export const resetPassword = authService.resetPassword;
export const resendEmailVerification = authService.resendEmailVerification;
export const verifyEmail = authService.verifyEmail;

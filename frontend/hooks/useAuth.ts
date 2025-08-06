"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useSWR from "swr";

import { authService } from "@/lib/api/auth";
import type {
  ForgotPasswordData,
  LoginData,
  RegisterData,
  ResetPasswordData,
  UseAuthOptions,
  User,
} from "@/lib/api/auth-types";

export const useAuth = ({
  middleware,
  redirectIfAuthenticated,
}: UseAuthOptions = {}) => {
  const router = useRouter();

  // Função silenciosa para buscar usuário (evita logs de erro desnecessários)
  const fetchUserSilently = async (): Promise<User | undefined> => {
    try {
      return await authService.user();
    } catch (error: unknown) {
      // Se for 401 (não autenticado), retornar undefined silenciosamente
      if (
        error &&
        typeof error === "object" &&
        "status" in error &&
        error.status === 401
      ) {
        return undefined;
      }
      // Para outros erros, ainda jogar o erro
      throw error;
    }
  };

  const {
    data: user,
    error,
    isLoading,
    mutate: mutateUser,
  } = useSWR<User | undefined>("/api/user", fetchUserSilently, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
    dedupingInterval: 5 * 60 * 1000, // 5 minutos
    errorRetryCount: 0, // Não tentar novamente em caso de erro
    onError: (error) => {
      // Apenas logar erros que não sejam 401
      if (error?.status !== 401) {
        console.error("Error fetching user:", error);
      }
    },
  });

  const csrf = async () => {
    // Similar ao Laravel Breeze, garantir que o CSRF seja configurado
    try {
      await authService.csrf?.();
    } catch {
      // Falha silenciosa se não implementado
    }
  };

  const login = async (data: LoginData) => {
    await csrf();

    try {
      const response = await authService.login(data);
      // Revalidar o usuário após login bem-sucedido
      await mutateUser();
      router.push("/posts");
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    await csrf();

    try {
      const response = await authService.register(data);
      await mutateUser();
      router.push("/posts");
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    if (!error) {
      try {
        await authService.logout();
      } catch {
        // Falha silenciosa no logout
      }
    }

    await mutateUser(undefined, false);
    window.location.pathname = "/login";
  };

  const forgotPassword = async (data: ForgotPasswordData) => {
    await csrf();

    try {
      return await authService.forgotPassword(data);
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (data: ResetPasswordData) => {
    await csrf();

    try {
      const response = await authService.resetPassword(data);
      await mutateUser();
      return response;
    } catch (error) {
      throw error;
    }
  };

  const resendEmailVerification = async () => {
    try {
      return await authService.resendEmailVerification();
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    if (middleware === "guest" && redirectIfAuthenticated && user) {
      router.push(redirectIfAuthenticated);
    }
    if (middleware === "auth" && error && error?.status !== 401) {
      // Apenas fazer logout para erros que não sejam 401 (não autenticado)
      // 401 é tratado naturalmente pelo SWR retornando user = undefined
      console.error("Auth error (non-401):", error);
    }
  }, [user, error, middleware, redirectIfAuthenticated, router]);

  return {
    user,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    resendEmailVerification,
    isLoading,
    isAuthenticated: !!user && !error,
  };
};

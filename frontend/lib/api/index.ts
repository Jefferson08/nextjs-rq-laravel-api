// Exportar o cliente axios configurado
export { apiClient, default as client } from "./client";

// Exportar todos os tipos
export type * from "./types";
export type * from "./auth-types";

// Exportar serviços
export { postsService } from "./posts";
export { authService } from "./auth";

// Exportar funções individuais para compatibilidade
export {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  bulkDeletePosts,
} from "./posts";

export {
  login,
  register,
  logout,
  getUser,
  forgotPassword,
  resetPassword,
  resendEmailVerification,
  verifyEmail,
} from "./auth";

// Exportar outros serviços futuros aqui
// export { usersService } from './users';

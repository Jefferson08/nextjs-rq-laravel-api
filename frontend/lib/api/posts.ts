import { format } from "date-fns";
import { apiClient } from "./client";
import type {
  CreatePostData,
  GetPostsParams,
  PaginatedResponse,
  Post,
  PostResource,
  PostsResponse,
  UpdatePostData,
} from "./types";

// Função helper para converter Date para string no formato que o Laravel espera
const formatDateForAPI = (date: Date): string => {
  return format(date, "yyyy-MM-dd HH:mm:ss");
};

// Função helper para preparar os dados para envio
const preparePostData = (data: CreatePostData | UpdatePostData) => {
  const prepared = { ...data };

  // Converter published_at para string se existir
  if (prepared.published_at instanceof Date) {
    (prepared as { published_at: string | Date }).published_at =
      formatDateForAPI(prepared.published_at);
  }

  return prepared;
};

export const postsService = {
  // 📖 Listar posts com paginação e filtros
  async getPosts(params: GetPostsParams = {}): Promise<PostsResponse> {
    const response = await apiClient.get<PaginatedResponse<Post>>("/posts", {
      params,
    });

    // Transformar a resposta do Laravel para o formato esperado pelo frontend
    return {
      posts: response.data.data,
      total: response.data.meta.total,
      currentPage: response.data.meta.current_page,
      lastPage: response.data.meta.last_page,
      perPage: response.data.meta.per_page,
    };
  },

  // 🔍 Buscar um post específico por ID
  async getPost(id: number): Promise<Post> {
    const response = await apiClient.get<PostResource>(`/posts/${id}`);
    return response.data.data;
  },

  // ➕ Criar um novo post
  async createPost(data: CreatePostData): Promise<Post> {
    const preparedData = preparePostData(data);
    const response = await apiClient.post<PostResource>("/posts", preparedData);
    return response.data.data;
  },

  // ✏️ Atualizar um post existente
  async updatePost(id: number, data: UpdatePostData): Promise<Post> {
    const preparedData = preparePostData(data);
    const response = await apiClient.put<PostResource>(
      `/posts/${id}`,
      preparedData,
    );
    return response.data.data;
  },

  // 🗑️ Deletar um post
  async deletePost(id: number): Promise<void> {
    await apiClient.delete(`/posts/${id}`);
  },

  // 📊 Estatísticas de posts (se você quiser implementar no futuro)
  async getPostsStats(): Promise<{
    total: number;
    draft: number;
    published: number;
    archived: number;
  }> {
    // Implementação futura - endpoint que retorna estatísticas
    const response = await apiClient.get("/posts/stats");
    return response.data;
  },
};

// Exportar funções individuais para compatibilidade com o código existente
export const getPosts = postsService.getPosts;
export const getPost = postsService.getPost;
export const createPost = postsService.createPost;
export const updatePost = postsService.updatePost;
export const deletePost = postsService.deletePost;

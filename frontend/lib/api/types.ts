// Tipos para Post
export interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  created_at: string;
  updated_at: string;
  // Propriedade opcional para indicar posts em estado de pending (optimistic updates)
  _isPending?: boolean;
}

// Tipos para criação/edição de Post
export interface CreatePostData {
  title: string;
  content: string;
  author: string;
  status: "draft" | "published" | "archived";
  published_at?: Date;
}

export type UpdatePostData = Partial<CreatePostData>;

// Tipos para consulta de Posts
export interface GetPostsParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
  search?: string;
  status?: string;
}

// Tipos para resposta paginada do Laravel
export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

// Tipo para resposta de posts
export interface PostsResponse {
  posts: Post[];
  total: number;
  currentPage: number;
  lastPage: number;
  perPage: number;
}

// Tipos para erros da API
export interface ApiError {
  status: number;
  message: string;
  errors: Record<string, string[]> | null;
}

// Tipo para resposta de resource único
export interface PostResource {
  data: Post;
}

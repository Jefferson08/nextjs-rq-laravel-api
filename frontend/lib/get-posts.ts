type GetPostsParams = {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
  search?: string;
  status?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function getPosts(params: GetPostsParams = {}) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, String(value));
    }
  }

  const res = await fetch(`${API_URL}/api/posts?${query.toString()}`, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store", // evita cache no Next.js
  });

  if (!res.ok) {
    throw new Error("Failed to fetch posts");
  }

  const json = await res.json();

  return {
    posts: json.data,
    total: json.meta.total,
    currentPage: json.meta.current_page,
    lastPage: json.meta.last_page,
    perPage: json.meta.per_page,
  };
}

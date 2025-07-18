import { z } from "zod"

export const postsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  per_page: z.coerce.number().min(1).max(100).default(10),
  sort_by: z.string().default("published_at"),
  sort_dir: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().default(""), 
  status: z.string().default(""),
})

export const postsQueryDefault = postsQuerySchema.parse({})

export type PostsQueryParams = z.infer<typeof postsQuerySchema>

import { getQueryClient } from "@/app/get-query-client";
import { getPosts } from "@/lib/get-posts";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { PostsTable } from "./components/data-table";
import { postsQuerySchema } from "./posts-query-schema";

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function PostsPage({ searchParams }: PageProps) {
  const queryClient = getQueryClient();

  const params = await searchParams;

  const queryParams = postsQuerySchema.parse(params);

  await queryClient.prefetchQuery({
    queryKey: ["posts", queryParams],
    queryFn: () => getPosts(queryParams),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PostsTable />
    </HydrationBoundary>
  );
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconLayoutColumns,
  IconPlus,
  IconAlertTriangle,
} from "@tabler/icons-react";

import { Skeleton } from "@/components/ui/skeleton";
import type { CreatePostData, UpdatePostData } from "@/lib/api";
import { createPost, deletePost, getPosts, updatePost } from "@/lib/api";
import { postsQueryDefault, postsQuerySchema } from "../posts-query-schema";
import { createColumns } from "./columns";
import type { Post } from "@/lib/api/types";
import { UpsertPost } from "./upsert-post";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function PostsTable() {
  const queryClient = useQueryClient();
  
  // 🎯 Estado local para seleção de linhas
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // 🎯 Estado do modal de upsert
  const [isUpsertModalOpen, setIsUpsertModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  
  // 🗑️ Estado do dialog de confirmação de exclusão
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);

  // 🌱 URL Params (nuqs)
  const [pageRaw, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(postsQueryDefault.page),
  );
  const [perPageRaw, setPerPage] = useQueryState(
    "per_page",
    parseAsInteger.withDefault(postsQueryDefault.per_page),
  );
  const [sortBy] = useQueryState(
    "sort_by",
    parseAsString.withDefault(postsQueryDefault.sort_by),
  );
  const [sortDir] = useQueryState(
    "sort_dir",
    parseAsString.withDefault(postsQueryDefault.sort_dir),
  );
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(postsQueryDefault.search),
  );
  const [status, setStatus] = useQueryState(
    "status",
    parseAsString.withDefault(postsQueryDefault.status),
  );

  // 📝 Parse URL params com defaults
  const queryParams = postsQuerySchema.parse({
    page: pageRaw,
    per_page: perPageRaw,
    sort_by: sortBy,
    sort_dir: sortDir,
    search,
    status,
  });

  // 🗂 Fetch data
  const { data, isLoading } = useQuery({
    queryKey: ["posts", queryParams],
    queryFn: () => getPosts(queryParams),
  });

  // 🔄 Limpar seleções quando os dados mudarem (trocar de página, filtros, etc)
  useEffect(() => {
    setRowSelection({});
  }, [
    queryParams.page,
    queryParams.search,
    queryParams.status,
    queryParams.sort_by,
    queryParams.sort_dir,
  ]);

  // 🚀 Mutations com Optimistic Updates
  
  // Mutation para criar post
  const createPostMutation = useMutation({
    mutationFn: createPost,
    onMutate: async (newPost) => {
      // Cancelar queries existentes para evitar conflitos
      await queryClient.cancelQueries({ queryKey: ["posts", queryParams] });
      
      // Pegar snapshot dos dados anteriores
      const previousPosts = queryClient.getQueryData(["posts", queryParams]);
      
      // Criar post temporário com ID negativo (indicativo de pending)
      const tempPost: Post = {
        id: -Date.now(), // ID temporário negativo
        title: newPost.title,
        content: newPost.content,
        author: newPost.author,
        status: newPost.status,
        published_at: newPost.published_at ? new Date(newPost.published_at).toISOString() : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Marcar como pending para aplicar estilo diferente
        _isPending: true
      };
      
      // Optimistically update cache
      queryClient.setQueryData(["posts", queryParams], (old: any) => {
        if (!old) return { posts: [tempPost], total: 1, currentPage: 1, lastPage: 1, perPage: queryParams.per_page };
        return {
          ...old,
          posts: [tempPost, ...old.posts],
          total: old.total + 1
        };
      });
      
      return { previousPosts };
    },
    onError: (err, newPost, context) => {
      // Reverter para estado anterior em caso de erro
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts", queryParams], context.previousPosts);
      }
      toast.error("❌ Erro ao criar post", {
        description: "Não foi possível criar o post. Tente novamente."
      });
    },
    onSuccess: (data) => {
      toast.success("✅ Post criado com sucesso!", {
        description: `O post "${data.title}" foi criado.`
      });
    },
    onSettled: () => {
      // Sempre invalidar queries no final
      queryClient.invalidateQueries({ queryKey: ["posts", queryParams] });
    }
  });
  
  // Mutation para atualizar post
  const updatePostMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: UpdatePostData }) => updatePost(id, data),
    onMutate: async ({ id, data }) => {
      // Cancelar queries existentes para evitar conflitos
      await queryClient.cancelQueries({ queryKey: ["posts", queryParams] });
      
      // Pegar snapshot dos dados anteriores
      const previousPosts = queryClient.getQueryData(["posts", queryParams]);
      
      // Optimistically update cache
      queryClient.setQueryData(["posts", queryParams], (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          posts: old.posts.map((post: Post) => {
            if (post.id === id) {
              return {
                ...post,
                ...data,
                // Converter published_at para string se for Date
                published_at: data.published_at 
                  ? (data.published_at instanceof Date 
                      ? data.published_at.toISOString() 
                      : data.published_at)
                  : post.published_at,
                updated_at: new Date().toISOString(),
                _isPending: true // Marcar como pendente
              };
            }
            return post;
          })
        };
      });
      
      return { previousPosts };
    },
    onError: (err, variables, context) => {
      // Reverter para estado anterior em caso de erro
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts", queryParams], context.previousPosts);
      }
      toast.error("❌ Erro ao atualizar post", {
        description: "Não foi possível atualizar o post. Tente novamente."
      });
    },
    onSuccess: (data) => {
      toast.success("✅ Post atualizado com sucesso!", {
        description: `O post "${data.title}" foi atualizado.`
      });
    },
    onSettled: () => {
      // Sempre invalidar queries no final
      queryClient.invalidateQueries({ queryKey: ["posts", queryParams] });
    }
  });
  
  // Mutation para deletar post
  const deletePostMutation = useMutation({
    mutationFn: deletePost,
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["posts", queryParams] });
      const previousPosts = queryClient.getQueryData(["posts", queryParams]);
      
      // Optimistically remove from cache
      queryClient.setQueryData(["posts", queryParams], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          posts: old.posts.filter((post: Post) => post.id !== postId),
          total: old.total - 1
        };
      });
      
      return { previousPosts };
    },
    onError: (err, postId, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts", queryParams], context.previousPosts);
      }
      toast.error("❌ Erro ao deletar post", {
        description: "Não foi possível deletar o post. Tente novamente."
      });
    },
    onSuccess: () => {
      toast.success("✅ Post deletado com sucesso!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", queryParams] });
    }
  });

  // 🎯 Handlers do modal
  const handleOpenCreateModal = () => {
    setEditingPost(null);
    setIsUpsertModalOpen(true);
  };

  const handleOpenEditModal = (post: Post) => {
    // Bloquear edição de posts pendentes
    if (post._isPending) {
      toast.warning("⏳ Post está sendo processado", {
        description: "Aguarde a conclusão da operação atual antes de editar."
      });
      return;
    }
    
    setEditingPost(post);
    setIsUpsertModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsUpsertModalOpen(false);
    setEditingPost(null);
  };

  const handleSubmitPost = async (data: CreatePostData) => {
    if (editingPost) {
      // Editar post existente
      updatePostMutation.mutate({ id: editingPost.id, data: data as UpdatePostData });
    } else {
      // Criar novo post
      createPostMutation.mutate(data);
    }
  };

  const handleDeletePost = async (post: Post) => {
    // Bloquear posts pendentes (criação ou edição)
    if (post._isPending) {
      const action = post.id < 0 ? "sendo criado" : "sendo editado";
      toast.warning(`⏳ Post está ${action}`, {
        description: "Aguarde a conclusão da operação antes de deletar."
      });
      return;
    }
    
    // Abrir dialog de confirmação
    setPostToDelete(post);
    setIsDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (postToDelete) {
      deletePostMutation.mutate(postToDelete.id);
      setPostToDelete(null);
    }
  };

  // Criar colunas com callbacks
  const columns = createColumns({
    onEdit: handleOpenEditModal,
    onDelete: handleDeletePost,
  });

  // 📊 React Table
  const table = useReactTable<Post>({
    data: data?.posts ?? [],
    columns,
    pageCount: data?.lastPage ?? 0,
    manualPagination: true,
    manualSorting: true,
    enableRowSelection: true,
    getRowId: (row) => String(row.id), // Usar o ID real do post como identificador único
    state: {
      pagination: {
        pageIndex: queryParams.page - 1,
        pageSize: queryParams.per_page,
      },
      sorting: [
        {
          id: queryParams.sort_by,
          desc: queryParams.sort_dir === "desc",
        },
      ],
      rowSelection,
    },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater(table.getState().pagination)
          : updater;
      setPage(next.pageIndex + 1);
      setPerPage(next.pageSize);
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="w-full space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
        {/* 🔍 Left side: Search + Status Filter */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <Input
            placeholder="Search posts..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-80"
          />

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Label
              htmlFor="status-filter"
              className="text-sm font-medium whitespace-nowrap"
            >
              Filter status:
            </Label>
            <Select
              value={status || "all"}
              onValueChange={(value) => {
                setStatus(value === "all" ? "" : value);
                setPage(1);
              }}
            >
              <SelectTrigger id="status-filter" className="w-[140px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 🏷 Right side: Columns + Add Post */}
        <div className="flex items-center gap-2">
          {/* Columns Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="ml-2">Columns</span>
                <IconChevronDown className="ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                    className="capitalize"
                  >
                    {column.id.replace(/_/g, " ")}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add Post Button */}
          <Button variant="outline" size="sm" onClick={handleOpenCreateModal}>
            Add Post
            <IconPlus className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {isLoading && header.column.id !== "actions" ? (
                      <Skeleton className="h-4 w-24 rounded" />
                    ) : header.isPlaceholder ? null : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(queryParams.per_page)].map((_, rowIndex) => (
                <TableRow key={`loading-${rowIndex}`}>
                  {table.getVisibleLeafColumns().map((col) => (
                    <TableCell key={col.id}>
                      <Skeleton
                        className={`w-full rounded ${
                          col.id === "actions" ? "h-9 w-9" : "h-4"
                        }`}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => {
                const post = row.original;
                return (
                  <TableRow 
                    key={row.id}
                    className={post._isPending ? "bg-muted/30 animate-pulse" : ""}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4">
        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={`${queryParams.per_page}`}
              onValueChange={(value) => {
                setPerPage(Number(value));
                setPage(1);
              }}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue placeholder={queryParams.per_page} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {queryParams.page} of {data?.lastPage ?? 1}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <IconChevronsLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <IconChevronLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <IconChevronRight />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <IconChevronsRight />
            </Button>
          </div>
        </div>
      </div>

      {/* 🎯 Modal de Upsert Post */}
      <UpsertPost
        open={isUpsertModalOpen}
        onOpenChange={handleCloseModal}
        post={editingPost}
        onSubmit={handleSubmitPost}
        isLoading={createPostMutation.isPending || updatePostMutation.isPending}
      />

      {/* 🗑️ Dialog de Confirmação de Exclusão com AlertDialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <IconAlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <AlertDialogTitle>Excluir Post</AlertDialogTitle>
                <AlertDialogDescription className="text-left mt-1">
                  Tem certeza de que deseja excluir este post? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          
          {postToDelete && (
            <div className="mt-4">
              <div className="rounded-md bg-muted p-3">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Post a ser excluído:
                </p>
                <p className="text-sm font-semibold truncate">{postToDelete.title}</p>
              </div>
            </div>
          )}
          
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel disabled={deletePostMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmDelete}
              disabled={deletePostMutation.isPending}
            >
              {deletePostMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

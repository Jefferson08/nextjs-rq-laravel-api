"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IconArrowDown,
  IconArrowsSort,
  IconArrowUp,
  IconDotsVertical,
} from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import { z } from "zod";

import { parseAsString, useQueryState } from "nuqs";

// 📦 Schema para validar os posts
export const schema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  author: z.string(),
  status: z.string(),
  published_at: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Post = z.infer<typeof schema>;

// 🔥 Componente Header com ordenação pela api
import { cn } from "@/lib/utils";
import { postsQueryDefault } from "../posts-query-schema";

function ServerSortHeader(accessor: string, label: string) {
  return function HeaderComponent() {
    const [sortBy, setSortBy] = useQueryState(
      "sort_by",
      parseAsString.withDefault(postsQueryDefault.sort_by),
    );
    const [sortDirRaw, setSortDir] = useQueryState("sort_dir", parseAsString);
    const effectiveSortDir = sortDirRaw ?? postsQueryDefault.sort_dir;

    const isActive = sortBy === accessor;

    const toggleSort = () => {
      if (!isActive) {
        setSortBy(accessor);
        setSortDir("asc");
      } else {
        // Alterna sempre quando ativo
        setSortDir(effectiveSortDir === "asc" ? "desc" : "asc");
      }
    };

    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleSort}
        className={cn("p-0 text-left", isActive && "text-primary bg-accent")}
      >
        {label}
        {isActive ? (
          effectiveSortDir === "asc" ? (
            <IconArrowUp className="ml-1 h-4 w-4" />
          ) : (
            <IconArrowDown className="ml-1 h-4 w-4" />
          )
        ) : (
          <IconArrowsSort className="ml-1 h-4 w-4 opacity-50" />
        )}
      </Button>
    );
  };
}

export const columns: ColumnDef<Post>[] = [
  // ✅ Seleção de linhas
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  // ✅ ID (não sortable)
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <span>{row.original.id}</span>,
    enableHiding: false,
  },

  // ✅ Title (sortable)
  {
    accessorKey: "title",
    header: ServerSortHeader("title", "Title"),
    cell: ({ row }) => (
      <div className="truncate max-w-[250px]">{row.original.title}</div>
    ),
  },

  // ✅ Author (sortable)
  {
    accessorKey: "author",
    header: ServerSortHeader("author", "Author"),
    cell: ({ row }) => <span>{row.original.author}</span>,
  },

  // ✅ Status (não sortable)
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={row.original.status === "published" ? "default" : "secondary"}
      >
        {row.original.status}
      </Badge>
    ),
  },

  // ✅ Published At (sortable)
  {
    accessorKey: "published_at",
    header: ServerSortHeader("published_at", "Published At"),
    cell: ({ row }) => {
      const date = new Date(row.original.published_at);
      return (
        <span>{isNaN(date.getTime()) ? "—" : date.toLocaleDateString()}</span>
      );
    },
  },

  // ✅ Ações
  {
    id: "actions",
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <IconDotsVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableHiding: false,
  },
];

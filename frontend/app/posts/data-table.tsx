"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useQuery } from "@tanstack/react-query";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconLayoutColumns,
} from "@tabler/icons-react";

import { Skeleton } from "@/components/ui/skeleton";
import { columns } from "./columns";
import { getPosts } from "@/lib/get-posts";
import { postsQuerySchema, postsQueryDefault } from "./posts-query-schema";

export function DataTable() {
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

  // 📊 React Table
  const table = useReactTable({
    data: data?.posts ?? [],
    columns,
    pageCount: data?.lastPage ?? 0,
    manualPagination: true,
    manualSorting: true,
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
    },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater(table.getState().pagination)
          : updater;
      setPage(next.pageIndex + 1);
      setPerPage(next.pageSize);
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="w-full space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
        {/* 🔍 Search */}
        <Input
          placeholder="Search posts..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />

        {/* 🏷 Status + Columns */}
        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <Select
            value={status || "all"}
            onValueChange={(value) => {
              setStatus(value === "all" ? "" : value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

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
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
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
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Page {queryParams.page} of {data?.lastPage ?? 1}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <IconChevronsLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <IconChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <IconChevronRight />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <IconChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

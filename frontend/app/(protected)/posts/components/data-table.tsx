"use client";

import { useQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  RowSelectionState,
} from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useState, useEffect } from "react";

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
} from "@tabler/icons-react";

import { Skeleton } from "@/components/ui/skeleton";
import { getPosts } from "@/lib/get-posts";
import { postsQueryDefault, postsQuerySchema } from "../posts-query-schema";
import { columns } from "./columns";

export function PostsTable() {
  // 🎯 Estado local para seleção de linhas
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

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

  // 📊 React Table
  const table = useReactTable({
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
    </div>
  );
}

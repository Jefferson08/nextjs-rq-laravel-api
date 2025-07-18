"use client"

import * as React from "react"
import {
  QueryClient,
  QueryClientProvider,
  isServer,
} from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

// Cria um novo QueryClient com opções padrão
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // evita refetch imediato no cliente
        refetchOnWindowFocus: false,
      },
    },
  })
}

// Mantém o QueryClient no navegador entre renderizações
let browserQueryClient: QueryClient | undefined

function getQueryClient() {
  if (isServer) {
    // No servidor: sempre cria um novo
    return makeQueryClient()
  } else {
    // No cliente: cria se ainda não existir
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

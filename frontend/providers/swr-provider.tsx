"use client";

import { SWRConfig } from "swr";

interface SWRProviderProps {
  children: React.ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        fetcher: (url: string) => fetch(url).then((res) => res.json()),
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        dedupingInterval: 5 * 60 * 1000, // 5 minutos
      }}
    >
      {children}
    </SWRConfig>
  );
}

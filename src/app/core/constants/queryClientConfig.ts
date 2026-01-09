import type { DefaultOptions } from "@tanstack/react-query";

export const QUERY_CLIENT_DEFAULT_OPTIONS: DefaultOptions = {
  queries: {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: false,
    retry: 1,
    retryDelay: 1000,
  },
  mutations: {
    retry: 0,
  },
};

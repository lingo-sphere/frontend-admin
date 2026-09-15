// Cấu hình trung tâm cho TanStack Query Client trong frontend-admin.
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnMount: 'always',
    },
  },
})

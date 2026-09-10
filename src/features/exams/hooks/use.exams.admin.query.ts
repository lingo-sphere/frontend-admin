// Custom hook quản lý truy vấn và đột biến ngân hàng đề thi Admin với Optimistic Update bằng TanStack Query.
import { useQuery, useMutation, useQueryClient, keepPreviousData, type QueryClient } from '@tanstack/react-query'
import { examAdminService, type ToeicExamItem, type CreateExamDto } from '@/features/exams/services/exam.service'
import { examAdminKeys } from '@/features/exams/keys/exam.admin.keys'

export function useAdminExamsQuery(params?: Record<string, unknown>, enabled = true) {
  return useQuery<ToeicExamItem[]>({
    queryKey: examAdminKeys.list(params),
    queryFn: () => examAdminService.getExams(params),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  })
}

export function prefetchAdminExams(queryClient: QueryClient, params?: Record<string, unknown>) {
  return queryClient.prefetchQuery({
    queryKey: examAdminKeys.list(params),
    queryFn: () => examAdminService.getExams(params),
    staleTime: 60 * 1000,
  })
}

export function useCreateExamMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: CreateExamDto) => examAdminService.createExam(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examAdminKeys.all })
    },
  })
}

export function useUpdateExamMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateExamDto> }) =>
      examAdminService.updateExam(id, dto),
    onMutate: async ({ id, dto }) => {
      await queryClient.cancelQueries({ queryKey: examAdminKeys.all })
      const queryCache = queryClient.getQueryCache()
      const examQueries = queryCache.findAll({ queryKey: ['exams', 'admin'] })
      const previousDataMap: Array<{ queryKey: unknown; data: ToeicExamItem[] | undefined }> = []

      examQueries.forEach((q) => {
        const prev = q.state.data as ToeicExamItem[] | undefined
        if (Array.isArray(prev)) {
          previousDataMap.push({ queryKey: q.queryKey, data: prev })
          queryClient.setQueryData<ToeicExamItem[]>(
            q.queryKey,
            prev.map((e) => ((e._id || e.id) === id ? { ...e, ...dto } : e))
          )
        }
      })

      return { previousDataMap }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousDataMap) {
        context.previousDataMap.forEach(({ queryKey, data }) => {
          queryClient.setQueryData(queryKey as string[], data)
        })
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: examAdminKeys.all })
    },
  })
}

export function useDeleteExamMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => examAdminService.deleteExam(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: examAdminKeys.all })
      const queryCache = queryClient.getQueryCache()
      const examQueries = queryCache.findAll({ queryKey: ['exams', 'admin'] })
      const previousDataMap: Array<{ queryKey: unknown; data: ToeicExamItem[] | undefined }> = []

      examQueries.forEach((q) => {
        const prev = q.state.data as ToeicExamItem[] | undefined
        if (Array.isArray(prev)) {
          previousDataMap.push({ queryKey: q.queryKey, data: prev })
          queryClient.setQueryData<ToeicExamItem[]>(
            q.queryKey,
            prev.filter((e) => (e._id || e.id) !== id)
          )
        }
      })

      return { previousDataMap }
    },
    onError: (_err, _id, context) => {
      if (context?.previousDataMap) {
        context.previousDataMap.forEach(({ queryKey, data }) => {
          queryClient.setQueryData(queryKey as string[], data)
        })
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: examAdminKeys.all })
    },
  })
}

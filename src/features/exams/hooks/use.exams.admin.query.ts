// Custom hook quản lý truy vấn và đột biến ngân hàng đề thi Admin với Optimistic Update bằng TanStack Query.
import { useQuery, useMutation, useQueryClient, keepPreviousData, queryOptions, type QueryClient } from '@tanstack/react-query'
import { examAdminService, type ToeicExamItem, type CreateExamDto } from '@/features/exams/services/exam.service'
import { examAdminKeys } from '@/features/exams/keys/exam.admin.keys'
import { optimisticUpdateCollection, rollbackCollection, type CollectionRollbackContext } from '@/lib/query.optimistic'

export const adminExamQueries = {
  list: (params?: Record<string, unknown>, enabled = true) =>
    queryOptions({
      queryKey: examAdminKeys.list(params),
      queryFn: () => examAdminService.getExams(params),
      enabled,
      placeholderData: keepPreviousData,
      staleTime: 60 * 1000,
    }),
}

export function useAdminExamsQuery(params?: Record<string, unknown>, enabled = true) {
  return useQuery(adminExamQueries.list(params, enabled))
}

export function prefetchAdminExams(queryClient: QueryClient, params?: Record<string, unknown>) {
  return queryClient.prefetchQuery(adminExamQueries.list(params))
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

  return useMutation<unknown, Error, { id: string; dto: Partial<CreateExamDto> }, CollectionRollbackContext<ToeicExamItem>>({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateExamDto> }) =>
      examAdminService.updateExam(id, dto),
    onMutate: ({ id, dto }) =>
      optimisticUpdateCollection<ToeicExamItem>(queryClient, examAdminKeys.all, (exams) =>
        exams.map((e) => ((e._id || e.id) === id ? { ...e, ...dto } : e))
      ),
    onError: (_err, _vars, context) => rollbackCollection<ToeicExamItem>(queryClient, context),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: examAdminKeys.all })
    },
  })
}

export function useDeleteExamMutation() {
  const queryClient = useQueryClient()

  return useMutation<unknown, Error, string, CollectionRollbackContext<ToeicExamItem>>({
    mutationFn: (id: string) => examAdminService.deleteExam(id),
    onMutate: (id: string) =>
      optimisticUpdateCollection<ToeicExamItem>(queryClient, examAdminKeys.all, (exams) =>
        exams.filter((e) => (e._id || e.id) !== id)
      ),
    onError: (_err, _id, context) => rollbackCollection<ToeicExamItem>(queryClient, context),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: examAdminKeys.all })
    },
  })
}

// Hook quản lý Server State cho danh sách bộ bài tập luyện thi trong quản trị
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { practiceService } from '@/features/practice/services/practice.service'
import { practiceAdminKeys } from '@/features/practice/keys/practice.admin.keys'
import type { PracticeSet } from '@/types/api.types'

export function usePracticeSetsQuery() {
  return useQuery<PracticeSet[]>({
    queryKey: practiceAdminKeys.sets(),
    queryFn: async () => {
      const data = await practiceService.getAllPracticeSets()
      return Array.isArray(data) ? data : []
    },
    staleTime: 0,
  })
}

export function useCreatePracticeSetMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Partial<PracticeSet>) => practiceService.createPracticeSet(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: practiceAdminKeys.sets() })
    },
  })
}

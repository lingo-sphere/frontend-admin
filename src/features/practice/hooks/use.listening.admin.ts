// Hook quản lý truy vấn và thao tác dữ liệu bài tập nghe Listening cho Quản trị viên.
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listeningAdminService } from '@/features/practice/services/listening-admin.service'
import type { IpaAdminQuery } from '@/features/practice/types/ipa-admin.types'
import type { ListeningPayload, ListeningType } from '@/features/practice/types/listening-admin.types'
export const listeningAdminKeys = ['listening-admin'] as const
export function useListeningAdmin(type: ListeningType, query: IpaAdminQuery) {
  return useQuery({ queryKey: [...listeningAdminKeys, type, query], queryFn: () => listeningAdminService.list(type, query), placeholderData: keepPreviousData })
}
export function useListeningMutations(type: ListeningType) {
  const client = useQueryClient()
  const refresh = () => client.invalidateQueries({ queryKey: listeningAdminKeys })
  return {
    save: useMutation({ mutationFn: ({ id, payload }: { id: string | null; payload: ListeningPayload }) => listeningAdminService.save(type, id, payload), onSuccess: refresh }),
    remove: useMutation({ mutationFn: ({ id, revision }: { id: string; revision: number }) => listeningAdminService.remove(type, id, revision), onSuccess: refresh }),
    restore: useMutation({ mutationFn: ({ id, revision }: { id: string; revision: number }) => listeningAdminService.restore(type, id, revision), onSuccess: refresh }),
  }
}

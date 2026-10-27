// Hook quản lý truy vấn và thao tác dữ liệu bài tập nói Speaking cho Quản trị viên.
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { speakingAdminService } from '@/features/practice/services/speaking-admin.service'
import type { IpaAdminQuery } from '@/features/practice/types/ipa-admin.types'
import type { SpeakingPayload } from '@/features/practice/types/speaking-admin.types'
export const speakingAdminKeys = ['speaking-admin'] as const
export function useSpeakingAdmin(query: IpaAdminQuery) { return useQuery({ queryKey: [...speakingAdminKeys, query], queryFn: () => speakingAdminService.list(query), placeholderData: keepPreviousData }) }
export function useSpeakingMutations() {
  const client = useQueryClient()
  const refresh = () => client.invalidateQueries({ queryKey: speakingAdminKeys })
  return {
    save: useMutation({ mutationFn: ({ id, payload }: { id: string | null; payload: SpeakingPayload }) => speakingAdminService.save(id, payload), onSuccess: refresh }),
    remove: useMutation({ mutationFn: ({ id, revision }: { id: string; revision: number }) => speakingAdminService.remove(id, revision), onSuccess: refresh }),
    restore: useMutation({ mutationFn: ({ id, revision }: { id: string; revision: number }) => speakingAdminService.restore(id, revision), onSuccess: refresh }),
  }
}

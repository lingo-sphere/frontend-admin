import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { speakingAdminService } from '../services/speaking-admin.service'
import type { IpaAdminQuery } from '../types/ipa-admin.types'
import type { SpeakingPayload } from '../types/speaking-admin.types'
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

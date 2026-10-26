import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { writingAdminService } from '../services/writing-admin.service'
import type { IpaAdminQuery } from '../types/ipa-admin.types'
import type { WritingPayload } from '../types/writing-admin.types'
export const writingAdminKeys = ['writing-admin'] as const
export function useWritingAdmin(query: IpaAdminQuery) { return useQuery({ queryKey: [...writingAdminKeys, query], queryFn: () => writingAdminService.list(query), placeholderData: keepPreviousData }) }
export function useWritingMutations() {
  const client = useQueryClient()
  const refresh = () => client.invalidateQueries({ queryKey: writingAdminKeys })
  return {
    save: useMutation({ mutationFn: ({ id, payload }: { id: string | null; payload: WritingPayload }) => writingAdminService.save(id, payload), onSuccess: refresh }),
    remove: useMutation({ mutationFn: ({ id, revision }: { id: string; revision: number }) => writingAdminService.remove(id, revision), onSuccess: refresh }),
    restore: useMutation({ mutationFn: ({ id, revision }: { id: string; revision: number }) => writingAdminService.restore(id, revision), onSuccess: refresh }),
  }
}

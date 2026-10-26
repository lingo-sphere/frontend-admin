import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { readingAdminService } from '../services/reading-admin.service'
import type { IpaAdminQuery } from '../types/ipa-admin.types'
import type { ReadingPayload } from '../types/reading-admin.types'
export const readingAdminKeys = ['reading-admin'] as const
export function useReadingAdmin(query: IpaAdminQuery) { return useQuery({ queryKey: [...readingAdminKeys, query], queryFn: () => readingAdminService.list(query), placeholderData: keepPreviousData }) }
export function useReadingMutations() {
  const client = useQueryClient()
  const refresh = () => client.invalidateQueries({ queryKey: readingAdminKeys })
  return {
    save: useMutation({ mutationFn: ({ id, payload }: { id: string | null; payload: ReadingPayload }) => readingAdminService.save(id, payload), onSuccess: refresh }),
    remove: useMutation({ mutationFn: ({ id, revision }: { id: string; revision: number }) => readingAdminService.remove(id, revision), onSuccess: refresh }),
    restore: useMutation({ mutationFn: ({ id, revision }: { id: string; revision: number }) => readingAdminService.restore(id, revision), onSuccess: refresh }),
  }
}

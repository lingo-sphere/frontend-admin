import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { ipaAdminService } from '../services/ipa-admin.service'
import type { IpaAdminQuery, SaveIpaExercise, SaveIpaSymbol } from '../types/ipa-admin.types'

export const ipaAdminKeys = { all: ['ipa-admin'] as const }
export function useIpaSymbols(query: IpaAdminQuery) {
  return useQuery({ queryKey: [...ipaAdminKeys.all, 'symbols', query], queryFn: () => ipaAdminService.symbols(query), placeholderData: keepPreviousData })
}
export function useIpaExercises(query: IpaAdminQuery) {
  return useQuery({ queryKey: [...ipaAdminKeys.all, 'exercises', query], queryFn: () => ipaAdminService.exercises(query), placeholderData: keepPreviousData })
}
export function useIpaMutations() {
  const client = useQueryClient()
  const refresh = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: ipaAdminKeys.all }),
      client.invalidateQueries({ queryKey: ['vocabulary-admin'] }),
    ])
  }
  return {
    updateSymbol: useMutation({ mutationFn: ({ id, payload }: { id: string; payload: SaveIpaSymbol }) => ipaAdminService.updateSymbol(id, payload), onSuccess: refresh }),
    saveExercise: useMutation({ mutationFn: ({ id, payload }: { id: string | null; payload: SaveIpaExercise }) => ipaAdminService.saveExercise(id, payload), onSuccess: refresh }),
    deleteExercise: useMutation({ mutationFn: ({ id, revision }: { id: string; revision: number }) => ipaAdminService.deleteExercise(id, revision), onSuccess: refresh }),
    restoreExercise: useMutation({ mutationFn: ({ id, revision }: { id: string; revision: number }) => ipaAdminService.restoreExercise(id, revision), onSuccess: refresh }),
  }
}

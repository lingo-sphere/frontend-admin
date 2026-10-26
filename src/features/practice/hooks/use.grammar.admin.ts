import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { grammarAdminService } from '../services/grammar-admin.service'
import type { IpaAdminQuery } from '../types/ipa-admin.types'
import type { GrammarKind, GrammarQuestionPayload, GrammarTopicPayload } from '../types/grammar-admin.types'
export const grammarAdminKeys = ['grammar-admin'] as const
export function useGrammarTree() { return useQuery({ queryKey: [...grammarAdminKeys, 'tree'], queryFn: grammarAdminService.tree }) }
export function useGrammarTopics(query: IpaAdminQuery) { return useQuery({ queryKey: [...grammarAdminKeys, 'topics', query], queryFn: () => grammarAdminService.topics(query), placeholderData: keepPreviousData }) }
export function useGrammarQuestions(query: IpaAdminQuery) { return useQuery({ queryKey: [...grammarAdminKeys, 'questions', query], queryFn: () => grammarAdminService.questions(query), placeholderData: keepPreviousData }) }
export function useGrammarMutations() {
  const client = useQueryClient()
  const refresh = () => Promise.all([client.invalidateQueries({ queryKey: grammarAdminKeys }), client.invalidateQueries({ queryKey: ['writing-admin'] }), client.invalidateQueries({ queryKey: ['reading-admin'] })])
  return {
    saveTopic: useMutation({ mutationFn: ({ id, payload }: { id: string | null; payload: GrammarTopicPayload }) => grammarAdminService.saveTopic(id, payload), onSuccess: refresh }),
    saveQuestion: useMutation({ mutationFn: ({ id, payload }: { id: string | null; payload: GrammarQuestionPayload }) => grammarAdminService.saveQuestion(id, payload), onSuccess: refresh }),
    remove: useMutation({ mutationFn: ({ kind, id, revision }: { kind: GrammarKind; id: string; revision: number }) => grammarAdminService.remove(kind, id, revision), onSuccess: refresh }),
    restore: useMutation({ mutationFn: ({ kind, id, revision }: { kind: GrammarKind; id: string; revision: number }) => grammarAdminService.restore(kind, id, revision), onSuccess: refresh }),
  }
}

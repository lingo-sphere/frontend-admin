import { api } from '@/services/api.client'
import type { IpaAdminQuery, IpaPage } from '../types/ipa-admin.types'
import type { GrammarKind, GrammarQuestion, GrammarQuestionPayload, GrammarTopic, GrammarTopicPayload, GrammarTreeNode } from '../types/grammar-admin.types'
const base = '/practice/admin/grammar'
export const grammarAdminService = {
  tree: () => api.get<GrammarTreeNode[]>(`${base}/tree`),
  topics: (query: IpaAdminQuery) => api.get<IpaPage<GrammarTopic>>(`${base}/topics`, { ...query }),
  questions: (query: IpaAdminQuery) => api.get<IpaPage<GrammarQuestion>>(`${base}/questions`, { ...query }),
  topic: (id: string, trash = false) => api.get<GrammarTopic>(`${base}/topics/${id}`, { trash: String(trash) }),
  question: (id: string, trash = false) => api.get<GrammarQuestion>(`${base}/questions/${id}`, { trash: String(trash) }),
  saveTopic: (id: string | null, payload: GrammarTopicPayload) => id ? api.put<GrammarTopic>(`${base}/topics/${id}`, payload) : api.post<GrammarTopic>(`${base}/topics`, payload),
  saveQuestion: (id: string | null, payload: GrammarQuestionPayload) => id ? api.put<GrammarQuestion>(`${base}/questions/${id}`, payload) : api.post<GrammarQuestion>(`${base}/questions`, payload),
  remove: (kind: GrammarKind, id: string, revision: number) => api.delete(`${base}/${kind}/${id}?revision=${revision}`),
  restore: (kind: GrammarKind, id: string, revision: number) => api.post(`${base}/${kind}/${id}/restore`, { expected_revision: revision }),
}

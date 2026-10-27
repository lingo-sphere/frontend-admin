// Dịch vụ API quản trị bài tập viết Writing.
import { api } from '@/services/api.client'
import type { IpaAdminQuery, IpaPage } from '@/features/practice/types/ipa-admin.types'
import type { WritingPayload, WritingRecord, WritingGrammarOption } from '@/features/practice/types/writing-admin.types'
const base = '/practice/admin/writing'
export const writingAdminService = {
  grammarOptions: () => api.get<WritingGrammarOption[]>(`${base}/grammar-options`),
  list: (query: IpaAdminQuery) => api.get<IpaPage<WritingRecord>>(base, { ...query }),
  detail: (id: string, trash = false) => api.get<WritingRecord>(`${base}/${id}`, { trash: String(trash) }),
  save: (id: string | null, payload: WritingPayload) => id ? api.put<WritingRecord>(`${base}/${id}`, payload) : api.post<WritingRecord>(base, payload),
  remove: (id: string, revision: number) => api.delete(`${base}/${id}?revision=${revision}`),
  restore: (id: string, revision: number) => api.post(`${base}/${id}/restore`, { expected_revision: revision }),
}

// Dịch vụ API quản trị bài tập đọc Reading.
import { api } from '@/services/api.client'
import type { IpaAdminQuery, IpaPage } from '@/features/practice/types/ipa-admin.types'
import type { ReadingPayload, ReadingRecord, ReadingGrammarOption } from '@/features/practice/types/reading-admin.types'
const base = '/practice/admin/reading'
export const readingAdminService = {
  grammarOptions: () => api.get<ReadingGrammarOption[]>(`${base}/grammar-options`),
  list: (query: IpaAdminQuery) => api.get<IpaPage<ReadingRecord>>(base, { ...query }),
  detail: (id: string, trash = false) => api.get<ReadingRecord>(`${base}/${id}`, { trash: String(trash) }),
  save: (id: string | null, payload: ReadingPayload) => id ? api.put<ReadingRecord>(`${base}/${id}`, payload) : api.post<ReadingRecord>(base, payload),
  remove: (id: string, revision: number) => api.delete(`${base}/${id}?revision=${revision}`),
  restore: (id: string, revision: number) => api.post(`${base}/${id}/restore`, { expected_revision: revision }),
}

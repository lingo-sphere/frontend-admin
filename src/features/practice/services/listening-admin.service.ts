import { api } from '@/services/api.client'
import type { IpaAdminQuery, IpaPage } from '../types/ipa-admin.types'
import type { ListeningPayload, ListeningRecord, ListeningType } from '../types/listening-admin.types'
const base = (type: ListeningType) => `/practice/admin/listening/${type}`
export const listeningAdminService = {
  list: (type: ListeningType, query: IpaAdminQuery) => api.get<IpaPage<ListeningRecord>>(base(type), { ...query }),
  detail: (type: ListeningType, id: string, trash = false) => api.get<ListeningRecord>(`${base(type)}/${id}`, { trash: String(trash) }),
  save: (type: ListeningType, id: string | null, body: ListeningPayload) => id ? api.put<ListeningRecord>(`${base(type)}/${id}`, body) : api.post<ListeningRecord>(base(type), body),
  remove: (type: ListeningType, id: string, revision: number) => api.delete(`${base(type)}/${id}?revision=${revision}`),
  restore: (type: ListeningType, id: string, revision: number) => api.post(`${base(type)}/${id}/restore`, { expected_revision: revision }),
}

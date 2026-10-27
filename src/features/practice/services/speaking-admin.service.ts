// Dịch vụ API quản trị bài tập nói Speaking.
import { api } from '@/services/api.client'
import type { IpaAdminQuery, IpaPage } from '@/features/practice/types/ipa-admin.types'
import type { SpeakingPayload, SpeakingRecord, SpeakingTtsResult } from '@/features/practice/types/speaking-admin.types'
const base = '/practice/admin/speaking'
export type SpeakingTargetKind = 'lexical' | 'phonetics' | 'grammar'
export interface SpeakingTargetOption { value: string; label_en?: string; label_vi?: string; unavailable: boolean }
export const speakingAdminService = {
  targets: (kind: SpeakingTargetKind, search: string, ids: string[]) => api.get<{ items: SpeakingTargetOption[] }>(`${base}/target-options/${kind}`, { search: search || undefined, ids: ids.join(',') || undefined }),
  list: (query: IpaAdminQuery) => api.get<IpaPage<SpeakingRecord>>(base, { ...query }),
  detail: (id: string, trash = false) => api.get<SpeakingRecord>(`${base}/${id}`, { trash: String(trash) }),
  save: (id: string | null, payload: SpeakingPayload) => id ? api.put<SpeakingRecord>(`${base}/${id}`, payload) : api.post<SpeakingRecord>(base, payload),
  remove: (id: string, revision: number) => api.delete(`${base}/${id}?revision=${revision}`),
  restore: (id: string, revision: number) => api.post(`${base}/${id}/restore`, { expected_revision: revision }),
  tts: (text: string, voice: string) => api.post<SpeakingTtsResult>(`${base}/tts`, { text, voice }, undefined, { timeout: 90000 }),
}

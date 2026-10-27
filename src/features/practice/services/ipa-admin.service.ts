// Dịch vụ API quản trị bảng âm và bài tập ngữ âm IPA.
import { api } from '@/services/api.client'
import type { IpaAdminQuery, IpaExerciseRecord, IpaPage, IpaSymbolRecord, SaveIpaExercise, SaveIpaSymbol } from '@/features/practice/types/ipa-admin.types'

const symbols = '/vocabulary/admin/ipa-symbols'
const exercises = '/practice/admin/ipa-exercises'
export const ipaAdminService = {
  symbols: (query: IpaAdminQuery) => api.get<IpaPage<IpaSymbolRecord>>(symbols, { ...query }),
  symbol: (id: string) => api.get<IpaSymbolRecord>(`${symbols}/${id}`),
  updateSymbol: (id: string, payload: SaveIpaSymbol) => api.put<IpaSymbolRecord>(`${symbols}/${id}`, payload),
  exercises: (query: IpaAdminQuery) => api.get<IpaPage<IpaExerciseRecord>>(exercises, { ...query }),
  exercise: (id: string, trash = false) => api.get<IpaExerciseRecord>(`${exercises}/${id}`, { trash: String(trash) }),
  saveExercise: (id: string | null, payload: SaveIpaExercise) => id ? api.put<IpaExerciseRecord>(`${exercises}/${id}`, payload) : api.post<IpaExerciseRecord>(exercises, payload),
  deleteExercise: (id: string, revision: number) => api.delete(`${exercises}/${id}?revision=${revision}`),
  restoreExercise: (id: string, revision: number) => api.post(`${exercises}/${id}/restore`, { expected_revision: revision }),
}

/**
 * @file grammar-handbook-admin.service.ts
 * @description API Client Service gọi các tuyến quản trị Sổ tay Ngữ pháp & Mẹo TOEIC
 */

import { api } from '@/services/api.client'
import type {
  GrammarHandbookItem,
  GrammarHandbookPayload,
  GrammarHandbookQuery,
  GrammarHandbookPageResponse,
  ToeicTipItem,
  ToeicTipPayload,
  ToeicTipQuery,
  ToeicTipPageResponse,
} from '../types/grammar-handbook-admin.types'

const GRAMMAR_BASE = '/vocabulary/admin/grammar-points'
const TIPS_BASE = '/vocabulary/admin/toeic-tips'

export const grammarHandbookAdminService = {
  list: (query: GrammarHandbookQuery) =>
    api.get<GrammarHandbookPageResponse>(GRAMMAR_BASE, { ...query }),

  detail: (id: string) =>
    api.get<GrammarHandbookItem>(`${GRAMMAR_BASE}/${id}`),

  create: (payload: GrammarHandbookPayload) =>
    api.post<GrammarHandbookItem>(GRAMMAR_BASE, payload),

  update: (id: string, payload: GrammarHandbookPayload) =>
    api.put<GrammarHandbookItem>(`${GRAMMAR_BASE}/${id}`, payload),

  togglePublish: (id: string, is_published: boolean) =>
    api.patch<GrammarHandbookItem>(`${GRAMMAR_BASE}/${id}/publish`, { is_published }),

  delete: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`${GRAMMAR_BASE}/${id}`),

  uploadImage: (id: string, file: File) =>
    api.upload<{ success: boolean; image_url: string }>(`${GRAMMAR_BASE}/${id}/upload-image`, file),
}

export const toeicTipsAdminService = {
  list: (query: ToeicTipQuery) =>
    api.get<ToeicTipPageResponse>(TIPS_BASE, { ...query }),

  detail: (id: string) =>
    api.get<ToeicTipItem>(`${TIPS_BASE}/${id}`),

  create: (payload: ToeicTipPayload) =>
    api.post<ToeicTipItem>(TIPS_BASE, payload),

  update: (id: string, payload: ToeicTipPayload) =>
    api.put<ToeicTipItem>(`${TIPS_BASE}/${id}`, payload),

  togglePublish: (id: string, is_published: boolean) =>
    api.patch<ToeicTipItem>(`${TIPS_BASE}/${id}/publish`, { is_published }),

  delete: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`${TIPS_BASE}/${id}`),

  uploadImage: (id: string, file: File) =>
    api.upload<{ success: boolean; image_url: string }>(`${TIPS_BASE}/${id}/upload-image`, file),
}


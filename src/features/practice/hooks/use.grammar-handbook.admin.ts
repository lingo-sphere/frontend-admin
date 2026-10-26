/**
 * @file use.grammar-handbook.admin.ts
 * @description React Query hooks cho phân hệ Quản trị Sổ tay Ngữ pháp & Tips TOEIC
 */

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import {
  grammarHandbookAdminService,
  toeicTipsAdminService,
} from '../services/grammar-handbook-admin.service'
import type {
  GrammarHandbookQuery,
  GrammarHandbookPayload,
  ToeicTipQuery,
  ToeicTipPayload,
} from '../types/grammar-handbook-admin.types'

export const grammarHandbookKeys = {
  all: ['admin', 'grammar-handbook'] as const,
  lists: () => [...grammarHandbookKeys.all, 'list'] as const,
  list: (query: GrammarHandbookQuery) => [...grammarHandbookKeys.lists(), query] as const,
  details: () => [...grammarHandbookKeys.all, 'detail'] as const,
  detail: (id: string) => [...grammarHandbookKeys.details(), id] as const,
}

export const toeicTipsKeys = {
  all: ['admin', 'toeic-tips'] as const,
  lists: () => [...toeicTipsKeys.all, 'list'] as const,
  list: (query: ToeicTipQuery) => [...toeicTipsKeys.lists(), query] as const,
  details: () => [...toeicTipsKeys.all, 'detail'] as const,
  detail: (id: string) => [...toeicTipsKeys.details(), id] as const,
}

export function useGrammarHandbookListQuery(query: GrammarHandbookQuery) {
  return useQuery({
    queryKey: grammarHandbookKeys.list(query),
    queryFn: () => grammarHandbookAdminService.list(query),
    placeholderData: keepPreviousData,
  })
}

export function useGrammarHandbookMutations() {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: grammarHandbookKeys.all })
  }

  const save = useMutation({
    mutationFn: ({ id, payload }: { id: string | null; payload: GrammarHandbookPayload }) =>
      id ? grammarHandbookAdminService.update(id, payload) : grammarHandbookAdminService.create(payload),
    onSuccess: invalidate,
  })

  const togglePublish = useMutation({
    mutationFn: ({ id, is_published }: { id: string; is_published: boolean }) =>
      grammarHandbookAdminService.togglePublish(id, is_published),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id: string) => grammarHandbookAdminService.delete(id),
    onSuccess: invalidate,
  })

  const uploadImage = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      grammarHandbookAdminService.uploadImage(id, file),
    onSuccess: invalidate,
  })

  return { save, togglePublish, remove, uploadImage }
}

export function useToeicTipsListQuery(query: ToeicTipQuery) {
  return useQuery({
    queryKey: toeicTipsKeys.list(query),
    queryFn: () => toeicTipsAdminService.list(query),
    placeholderData: keepPreviousData,
  })
}

export function useToeicTipsMutations() {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: toeicTipsKeys.all })
  }

  const save = useMutation({
    mutationFn: ({ id, payload }: { id: string | null; payload: ToeicTipPayload }) =>
      id ? toeicTipsAdminService.update(id, payload) : toeicTipsAdminService.create(payload),
    onSuccess: invalidate,
  })

  const togglePublish = useMutation({
    mutationFn: ({ id, is_published }: { id: string; is_published: boolean }) =>
      toeicTipsAdminService.togglePublish(id, is_published),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id: string) => toeicTipsAdminService.delete(id),
    onSuccess: invalidate,
  })

  const uploadImage = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      toeicTipsAdminService.uploadImage(id, file),
    onSuccess: invalidate,
  })

  return { save, togglePublish, remove, uploadImage }
}


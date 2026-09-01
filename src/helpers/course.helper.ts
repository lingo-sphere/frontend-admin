/**
 * @file course.helper.ts
 * @description Mã nguồn thành phần course.helper.ts
 */

export type FilterCategory = 'ALL' | 'TOEIC_2_SKILLS' | 'TOEIC_4_SKILLS'
export type FilterLevel = 'ALL' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
export type FilterStatus = 'ALL' | 'PUBLISHED' | 'DRAFT'

export const getCategoryBadgeClass = (category: string): string => {
  switch (category) {
    case 'TOEIC_2_SKILLS':
      return 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/60'
    case 'TOEIC_4_SKILLS':
      return 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/60'
    default:
      return 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/60'
  }
}

export const getLevelBadgeClass = (level: string): string => {
  switch (level) {
    case 'BEGINNER':
      return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/50'
    case 'INTERMEDIATE':
      return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/50'
    case 'ADVANCED':
      return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/50'
    default:
      return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
  }
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim()
}

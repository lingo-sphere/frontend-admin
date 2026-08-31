export type FilterStatus = 'ALL' | 'ACTIVE' | 'INACTIVE' | 'BANNED'
export type FilterPlan = 'ALL' | 'free' | 'premium'

export interface LearnerStats {
  total: number
  active: number
  premium: number
  banned: number
}

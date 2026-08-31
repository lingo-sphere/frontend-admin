export interface AdminProfileData {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'TEACHER'
  avatar?: string
  phone?: string
  bio?: string
  is_active: boolean
  last_active: string
  created_at: string
}

export interface PasswordStrengthResult {
  score: number
  label: string
  color: string
  checks: {
    length: boolean
    mixedCase: boolean
    number: boolean
    special: boolean
  }
}

export function evaluatePasswordStrength(pwd: string): PasswordStrengthResult {
  if (!pwd) {
    return {
      score: 0,
      label: '',
      color: '',
      checks: { length: false, mixedCase: false, number: false, special: false },
    }
  }

  const checks = {
    length: pwd.length >= 8,
    mixedCase: /[a-z]/.test(pwd) && /[A-Z]/.test(pwd),
    number: /\d/.test(pwd),
    special: /[^a-zA-Z0-9]/.test(pwd),
  }

  let passedCount = 0
  if (checks.length) passedCount++
  if (checks.mixedCase) passedCount++
  if (checks.number) passedCount++
  if (checks.special) passedCount++

  if (passedCount <= 1 || pwd.length < 6) {
    return { score: 1, label: 'Yếu', color: 'rose', checks }
  }
  if (passedCount <= 3) {
    return { score: 2, label: 'Trung bình', color: 'amber', checks }
  }
  return { score: 3, label: 'Mạnh', color: 'emerald', checks }
}

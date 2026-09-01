/**
 * @file settings.helper.ts
 * @description Mã nguồn thành phần settings.helper.ts
 */

export type SettingsTabType = 'plans' | 'ai' | 'roles' | 'system'

export function formatPrice(price: number): string {
  if (price === 0) return 'Miễn phí'
  return new Intl.NumberFormat('vi-VN').format(price) + ' đ'
}

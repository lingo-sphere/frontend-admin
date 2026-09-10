/**
 * @file settings.helper.ts
 * @description Các hàm tiện ích hỗ trợ định dạng dữ liệu cho khu vực cài đặt
 */

export type SettingsTabType = 'plans' | 'ai' | 'system'

export function formatPrice(price: number): string {
  if (price === 0) return 'Miễn phí'
  return new Intl.NumberFormat('vi-VN').format(price) + ' đ'
}

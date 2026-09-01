/**
 * @file media.helper.ts
 * @description Mã nguồn thành phần media.helper.ts
 */

export function formatMb(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1)
}

export function formatGb(bytes: number): string {
  return (bytes / (1024 * 1024 * 1024)).toFixed(2)
}

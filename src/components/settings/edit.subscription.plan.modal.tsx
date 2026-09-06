// Modal chinh sua goi dich vu thanh vien.

import { useState, useEffect } from 'react'
import { X, Crown, AlertCircle, Save, Tag } from 'lucide-react'
import { NumberInput } from '@/components/common/number.input'
import type { SubscriptionPlan } from '@/types/api.types'

interface EditSubscriptionPlanModalProps {
  isOpen: boolean
  plan: SubscriptionPlan | null
  isVietnamese: boolean
  onClose: () => void
  onSave: (updatedPlan: SubscriptionPlan) => Promise<void>
}

export function EditSubscriptionPlanModal({
  isOpen,
  plan,
  isVietnamese,
  onClose,
  onSave,
}: EditSubscriptionPlanModalProps) {
  const [nameVi, setNameVi] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [price, setPrice] = useState<number>(0)
  const [originalPrice, setOriginalPrice] = useState<number>(0)
  const [durationDays, setDurationDays] = useState<number>(30)
  const [isPopular, setIsPopular] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (plan) {
      setNameVi(plan.name_vi || plan.name || '')
      setNameEn(plan.name_en || '')
      setPrice(plan.price || 0)
      setOriginalPrice(plan.original_price || 0)
      setDurationDays(plan.duration_days || 30)
      setIsPopular(Boolean(plan.is_popular))
      setIsActive(plan.is_active !== undefined ? plan.is_active : true)
      setErrorMsg(null)
    }
  }, [plan])

  if (!isOpen || !plan) return null

  const calculatedDiscount =
    originalPrice > price && originalPrice > 0
      ? `-${Math.round(((originalPrice - price) / originalPrice) * 100)}%`
      : ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (price < 0) {
      setErrorMsg(isVietnamese ? 'Giá gói không được âm.' : 'Price cannot be negative.')
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      const updatedData: SubscriptionPlan = {
        ...plan,
        name: nameVi,
        name_vi: nameVi,
        name_en: nameEn,
        price: Number(price),
        original_price: Number(originalPrice),
        discount: calculatedDiscount,
        duration_days: Number(durationDays),
        is_popular: isPopular,
        is_active: isActive,
        features: plan.features || [],
      }
      await onSave(updatedData)
      onClose()
    } catch (err: any) {
      setErrorMsg(err?.message || (isVietnamese ? 'Cập nhật thất bại. Vui lòng thử lại!' : 'Update failed. Please retry!'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 dark:bg-black/35 backdrop-blur-[2px] animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {isVietnamese ? 'Chỉnh sửa gói dịch vụ' : 'Edit Subscription Plan'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {plan.slug} • TIER {plan.tier}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-center gap-2.5 text-xs text-rose-600 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {isVietnamese ? 'Tên gói (Tiếng Việt) *' : 'Plan Name (VI) *'}
              </label>
              <input
                type="text"
                value={nameVi}
                onChange={(e) => setNameVi(e.target.value)}
                required
                className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="VD: Gói VIP 1 Năm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {isVietnamese ? 'Tên gói (Tiếng Anh)' : 'Plan Name (EN)'}
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="e.g. VIP 1 Year"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>{isVietnamese ? 'Giá bán (VNĐ) *' : 'Selling Price (VND) *'}</span>
              </label>
              <div className="relative">
                <NumberInput
                  min={0}
                  step={1000}
                  fallbackValue={0}
                  value={price}
                  onChange={setPrice}
                  required
                  className="w-full h-10 px-3.5 pr-8 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-indigo-300 dark:border-indigo-500/40 text-xs font-bold text-amber-600 dark:text-amber-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                  đ
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                {new Intl.NumberFormat('vi-VN').format(price)} VNĐ
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {isVietnamese ? 'Giá gốc niêm yết (VNĐ)' : 'Original Price (VND)'}
              </label>
              <div className="relative">
                <NumberInput
                  min={0}
                  step={1000}
                  fallbackValue={0}
                  value={originalPrice}
                  onChange={setOriginalPrice}
                  className="w-full h-10 px-3.5 pr-8 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 dark:text-slate-500">
                  đ
                </span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                {originalPrice > 0 ? `${new Intl.NumberFormat('vi-VN').format(originalPrice)} VNĐ` : 'Không giảm giá'}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>{isVietnamese ? 'Ưu đãi hiển thị' : 'Discount'}</span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-normal">
                  {isVietnamese ? 'Tự tính' : 'Auto'}
                </span>
              </label>
              <div className="h-10 px-3.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                {calculatedDiscount ? (
                  <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold">
                    {calculatedDiscount}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {isVietnamese ? 'Không có' : 'None'}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                {calculatedDiscount ? `Tiết kiệm ${calculatedDiscount.replace('-', '')}` : 'Giá bán = Giá gốc'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {isVietnamese ? 'Thời hạn sử dụng (Số ngày)' : 'Duration (Days)'}
              </label>
              <NumberInput
                min={1}
                fallbackValue={30}
                value={durationDays}
                onChange={setDurationDays}
                className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-slate-500">
                {durationDays >= 36500 ? 'Vĩnh viễn (Trọn đời)' : `${durationDays} ngày`}
              </span>
            </div>

            <div className="flex items-center gap-6 pt-5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPopular}
                  onChange={(e) => setIsPopular(e.target.checked)}
                  className="h-4 w-4 rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {isVietnamese ? 'Gói phổ biến (Popular)' : 'Popular Plan'}
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {isVietnamese ? 'Kích hoạt bán' : 'Active'}
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10 px-4 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isVietnamese ? 'Hủy' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? isVietnamese ? 'Đang lưu...' : 'Saving...'
                  : isVietnamese ? 'Lưu thay đổi' : 'Save Changes'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

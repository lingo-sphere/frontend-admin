/**
 * @file EditSubscriptionPlanModal.tsx
 * @description Modal chỉnh sửa thông tin, giá bán và quyền lợi của gói dịch vụ thành viên
 */

import { useState, useEffect } from 'react'
import { X, Crown, Plus, Trash2, CheckCircle2, AlertCircle, Save } from 'lucide-react'
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
  const [discount, setDiscount] = useState('')
  const [durationDays, setDurationDays] = useState<number>(30)
  const [isPopular, setIsPopular] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [features, setFeatures] = useState<string[]>([])
  const [newFeatureText, setNewFeatureText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (plan) {
      setNameVi(plan.name_vi || plan.name || '')
      setNameEn(plan.name_en || '')
      setPrice(plan.price || 0)
      setOriginalPrice(plan.original_price || 0)
      setDiscount(plan.discount || '')
      setDurationDays(plan.duration_days || 30)
      setIsPopular(Boolean(plan.is_popular))
      setIsActive(plan.is_active !== undefined ? plan.is_active : true)
      setFeatures(Array.isArray(plan.features) ? [...plan.features] : [])
      setErrorMsg(null)
    }
  }, [plan])

  if (!isOpen || !plan) return null

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return
    setFeatures((prev) => [...prev, newFeatureText.trim()])
    setNewFeatureText('')
  }

  const handleRemoveFeature = (index: number) => {
    setFeatures((prev) => prev.filter((_, idx) => idx !== index))
  }

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
        discount: discount.trim(),
        duration_days: Number(durationDays),
        is_popular: isPopular,
        is_active: isActive,
        features: features,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {isVietnamese ? 'Chỉnh sửa gói dịch vụ' : 'Edit Subscription Plan'}
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {plan.slug} • TIER {plan.tier}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {isVietnamese ? 'Tên gói (Tiếng Việt) *' : 'Plan Name (VI) *'}
              </label>
              <input
                type="text"
                value={nameVi}
                onChange={(e) => setNameVi(e.target.value)}
                required
                className="w-full h-10 px-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="VD: Gói VIP 1 Năm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {isVietnamese ? 'Tên gói (Tiếng Anh)' : 'Plan Name (EN)'}
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="e.g. VIP 1 Year"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>{isVietnamese ? 'Giá bán (VNĐ) *' : 'Selling Price (VND) *'}</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  required
                  className="w-full h-10 px-3.5 pr-10 rounded-xl bg-slate-800/80 border border-indigo-500/40 text-xs font-bold text-amber-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                  đ
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                {new Intl.NumberFormat('vi-VN').format(price)} VNĐ
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {isVietnamese ? 'Giá gốc niêm yết (VNĐ)' : 'Original Price (VND)'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(Number(e.target.value))}
                  className="w-full h-10 px-3.5 pr-10 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-500">
                  đ
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">
                {originalPrice > 0 ? `${new Intl.NumberFormat('vi-VN').format(originalPrice)} VNĐ` : 'Không có'}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {isVietnamese ? 'Ưu đãi hiển thị' : 'Discount Badge'}
              </label>
              <input
                type="text"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="VD: -47%"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {isVietnamese ? 'Thời hạn sử dụng (Số ngày)' : 'Duration (Days)'}
              </label>
              <input
                type="number"
                min="1"
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full h-10 px-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                  className="h-4 w-4 rounded-md border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-medium text-slate-300">
                  {isVietnamese ? 'Gói phổ biến (Popular)' : 'Popular Plan'}
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded-md border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-medium text-slate-300">
                  {isVietnamese ? 'Kích hoạt bán' : 'Active'}
                </span>
              </label>
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-slate-800">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>{isVietnamese ? 'Danh sách quyền lợi & tính năng' : 'Plan Features'}</span>
              <span className="text-[10px] text-slate-500">{features.length} quyền lợi</span>
            </label>

            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {features.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-200"
                >
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span className="truncate">{feat}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(idx)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newFeatureText}
                onChange={(e) => setNewFeatureText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddFeature()
                  }
                }}
                placeholder={isVietnamese ? 'Thêm quyền lợi mới (ấn Enter)...' : 'Add new benefit...'}
                className="flex-1 h-9 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="h-9 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isVietnamese ? 'Thêm' : 'Add'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
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

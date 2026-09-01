/**
 * @file AdminProfileInfoForm.tsx
 * @description Component giao diện AdminProfileInfoForm phục vụ khu vực Quản trị Admin
 */

import { User, Mail, Phone, FileText } from 'lucide-react'

interface AdminProfileInfoFormProps {
  name: string
  email: string
  phone: string
  bio: string
  onNameChange: (val: string) => void
  onPhoneChange: (val: string) => void
  onBioChange: (val: string) => void
  roleName?: string
}

export function AdminProfileInfoForm({
  name,
  email,
  phone,
  bio,
  onNameChange,
  onPhoneChange,
  onBioChange,
  roleName,
}: AdminProfileInfoFormProps) {
  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-500" />
            <span>Thông Tin Cá Nhân</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cập nhật họ tên hiển thị, email liên hệ và số điện thoại quản lý
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Họ và tên hiển thị <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                placeholder="Nhập họ và tên..."
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Địa chỉ Email <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                disabled
                className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed"
                title="Email định danh không thể chỉnh sửa"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Số điện thoại
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => onPhoneChange(e.target.value)}
                placeholder="0912 345 678"
                className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Vai trò tài khoản
            </label>
            <input
              type="text"
              disabled
              value={roleName || 'Quản Trị Viên (Admin)'}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed font-semibold"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Giới thiệu bản thân (Bio)
          </label>
          <div className="relative">
            <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => onBioChange(e.target.value)}
              placeholder="Thêm mô tả chuyên môn, kinh nghiệm giảng dạy hoặc phương châm quản trị..."
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

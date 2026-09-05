/**
 * @file roadmaps.page.tsx
 * @description Trang quản trị Lộ trình học tập (Learning Roadmaps) trong hệ thống Admin LingoSphere
 */

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Compass,
  Plus,
  RotateCcw,
  BookOpen,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import { DataTable } from '@/components/common/data.table'
import { RoadmapFormModal } from '@/components/roadmaps/roadmap.form.modal'
import type { LearningRoadmap } from '@/types/api.types'
import { useRoadmapsData } from '@/pages/roadmaps/use.roadmaps.data'
import { createRoadmapColumns } from '@/pages/roadmaps/roadmaps.table.columns'
import { RoadmapsFilterBar } from '@/pages/roadmaps/roadmaps.filter.bar'

export function RoadmapsPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const {
    courses,
    exams,
    isLoading,
    searchQuery,
    setSearchQuery,
    skillsFilter,
    setSkillsFilter,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    sortKey,
    setSortKey,
    sortOrder,
    setSortOrder,
    showModal,
    setShowModal,
    editingRoadmap,
    loadData,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleDeleteRoadmap,
    handleTogglePublish,
    filteredRoadmaps,
    stats,
  } = useRoadmapsData()

  const columns = useMemo(
    () =>
      createRoadmapColumns({
        isVi,
        onTogglePublish: handleTogglePublish,
        onEdit: handleOpenEditModal,
        onDelete: handleDeleteRoadmap,
      }),
    [isVi, handleTogglePublish, handleOpenEditModal, handleDeleteRoadmap]
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-indigo-200 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hệ Thống Lộ Trình Học Tập Cá Nhân Hóa (Adaptive Roadmaps)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Quản Lý Lộ Trình Đào Tạo TOEIC Theo Mục Tiêu
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
              Tạo và ghép các khóa học thành lộ trình thông minh. Hệ thống tự động gợi ý lộ trình phù hợp sau khi học viên làm bài thi phân lớp (Placement Test).
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={loadData}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white backdrop-blur-md border border-white/10 transition-all flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Làm Mới</span>
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Lộ Trình Mới</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{stats.total}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tổng số Lộ trình</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{stats.twoSkills}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Lộ trình 2 Kỹ Năng</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{stats.fourSkills}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Lộ trình 4 Kỹ Năng</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{stats.published}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Đang Hoạt Động</div>
          </div>
        </div>
      </div>

      <RoadmapsFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        skillsFilter={skillsFilter}
        onSkillsFilterChange={setSkillsFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <DataTable<LearningRoadmap>
          columns={columns}
          data={filteredRoadmaps}
          isLoading={isLoading}
          rowKey={(item: LearningRoadmap) => item._id}
          sortKey={sortKey}
          sortOrder={sortOrder}
          onSortChange={(key: string, order: 'asc' | 'desc' | null) => {
            setSortKey(key)
            setSortOrder(order)
            setCurrentPage(1)
          }}
          pagination={{
            currentPage,
            pageSize,
            totalItems: filteredRoadmaps.length,
            onPageChange: setCurrentPage,
            onPageSizeChange: (size: number) => {
              setPageSize(size)
              setCurrentPage(1)
            },
          }}
          emptyText="Chưa có lộ trình học tập nào. Hãy tạo lộ trình mới để kích hoạt tính năng gợi ý."
        />
      </div>

      <RoadmapFormModal
        isOpen={showModal}
        editingRoadmap={editingRoadmap}
        courses={courses}
        exams={exams}
        onClose={() => setShowModal(false)}
        onSuccess={loadData}
      />
    </div>
  )
}

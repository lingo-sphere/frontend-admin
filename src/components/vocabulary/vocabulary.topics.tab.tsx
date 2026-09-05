/**
 * @file vocabulary.topics.tab.tsx
 * @description Component giao diện VocabularyTopicsTab phục vụ khu vực Quản trị Admin
 */

import { useState, useMemo } from 'react'
import { Folder, Edit2, Plus } from 'lucide-react'
import type { Topic } from '@/data/vocabulary.data'
import { toast } from '@/store/toast.store'
import { Pagination } from '@/components/common/pagination'

interface VocabularyTopicsTabProps {
  topics: Topic[]
  onEditTopic?: (topicId: string) => void
  onCreateTopic?: () => void
}

export function VocabularyTopicsTab({
  topics,
  onEditTopic = () => toast.info('Đang mở form chỉnh sửa chủ đề...'),
  onCreateTopic = () => toast.info('Đang mở form tạo chủ đề mới...'),
}: VocabularyTopicsTabProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)

  const totalPages = Math.ceil(topics.length / pageSize) || 1

  const paginatedTopics = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return topics.slice(start, start + pageSize)
  }, [topics, currentPage, pageSize])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Danh Sách Chủ Đề Từ Vựng (Topics)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Phân loại từ vựng theo ngữ cảnh TOEIC (Business, Office, Travel, Shopping, Banking)
          </p>
        </div>
        <button
          onClick={onCreateTopic}
          className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Chủ Đề</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedTopics.map((topic) => (
          <div
            key={topic.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-500/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/50 dark:border-indigo-800/50 font-bold">
                  {topic.icon ? (
                    <span className="text-lg">{topic.icon}</span>
                  ) : (
                    <Folder className="w-5 h-5" />
                  )}
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  {topic.cefr_level || 'B1-B2'}
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {topic.name_vi || topic.name_en}
              </h4>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{topic.name_en}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2">
                {topic.description || 'Chủ đề từ vựng trọng tâm trong đề thi TOEIC.'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-400">
                {topic.lexical_count || 0} từ vựng
              </span>
              <button
                onClick={() => onEditTopic(topic.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Chỉnh sửa chủ đề"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {topics.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          pageSizeOptions={[6, 9, 12, 18]}
          totalItems={topics.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setCurrentPage(1)
          }}
        />
      )}
    </div>
  )
}

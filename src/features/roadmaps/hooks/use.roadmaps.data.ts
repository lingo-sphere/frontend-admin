// Custom hook quản lý tải dữ liệu lộ trình học tập, danh sách khóa học và đề thi bằng TanStack Query.
import { useState, useMemo, useCallback } from 'react'
import {
  useAdminRoadmapsQuery,
  useUpdateRoadmapMutation,
  useDeleteRoadmapMutation,
} from '@/features/roadmaps/hooks/use.roadmaps.admin.query'
import { useAdminApiCoursesQuery } from '@/features/courses/hooks/use.courses.admin.query'
import { useAdminExamsQuery } from '@/features/exams/hooks/use.exams.admin.query'
import { toast } from '@/store/toast.store'
import type { LearningRoadmap } from '@/types/api.types'

export function useRoadmapsData() {
  const {
    data: roadmaps = [],
    isLoading: isLoadingRoadmaps,
    refetch: refetchRoadmaps,
  } = useAdminRoadmapsQuery()

  const {
    data: courses = [],
    isLoading: isLoadingCourses,
  } = useAdminApiCoursesQuery({ pageSize: 100 })

  const {
    data: exams = [],
    isLoading: isLoadingExams,
  } = useAdminExamsQuery()

  const { mutateAsync: updateRoadmap } = useUpdateRoadmapMutation()
  const { mutateAsync: deleteRoadmap } = useDeleteRoadmapMutation()

  const [searchQuery, setSearchQuery] = useState<string>('')
  const [skillsFilter, setSkillsFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)

  const [showModal, setShowModal] = useState<boolean>(false)
  const [editingRoadmap, setEditingRoadmap] = useState<LearningRoadmap | null>(null)

  const handleOpenCreateModal = () => {
    setEditingRoadmap(null)
    setShowModal(true)
  }

  const handleOpenEditModal = (roadmap: LearningRoadmap) => {
    setEditingRoadmap(roadmap)
    setShowModal(true)
  }

  const handleDeleteRoadmap = async (roadmapId: string) => {
    try {
      await deleteRoadmap(roadmapId)
      toast.success('Đã xóa lộ trình thành công!')
    } catch {
      toast.error('Không thể xóa lộ trình này')
    }
  }

  const handleTogglePublish = async (roadmap: LearningRoadmap) => {
    try {
      await updateRoadmap({
        id: roadmap._id,
        payload: { is_published: !roadmap.is_published },
      })
      toast.success(
        roadmap.is_published
          ? 'Đã chuyển lộ trình về bản nháp!'
          : 'Đã xuất bản lộ trình công khai!'
      )
    } catch {
      toast.error('Không thể cập nhật trạng thái xuất bản')
    }
  }

  const filteredRoadmaps = useMemo(() => {
    return roadmaps.filter((rm) => {
      const matchSearch =
        !searchQuery.trim() ||
        rm.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rm.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rm.slug?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchSkills =
        skillsFilter === 'ALL' || rm.skills_focus === skillsFilter

      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'PUBLISHED' && rm.is_published) ||
        (statusFilter === 'DRAFT' && !rm.is_published)

      return matchSearch && matchSkills && matchStatus
    })
  }, [roadmaps, searchQuery, skillsFilter, statusFilter])

  const stats = useMemo(() => {
    const total = roadmaps.length
    const twoSkills = roadmaps.filter((r) => r.skills_focus === '2SKILLS').length
    const fourSkills = roadmaps.filter((r) => r.skills_focus === '4SKILLS').length
    const published = roadmaps.filter((r) => r.is_published).length

    return { total, twoSkills, fourSkills, published }
  }, [roadmaps])

  const loadData = useCallback(async () => {
    refetchRoadmaps()
  }, [refetchRoadmaps])

  const isLoading =
    (isLoadingRoadmaps && roadmaps.length === 0) ||
    (isLoadingCourses && courses.length === 0) ||
    (isLoadingExams && exams.length === 0)

  return {
    roadmaps,
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
  }
}

/**
 * @file use.roadmaps.data.ts
 * @description Custom hook quản lý tải dữ liệu lộ trình học tập, danh sách khóa học/đề thi, bộ lọc và các thao tác CRUD
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { courseService, roadmapService } from '@/services/course.service'
import { examAdminService, type ToeicExamItem } from '@/services/exam.service'
import { toast } from '@/store/toast.store'
import type { Course as ApiCourse, LearningRoadmap } from '@/types/api.types'

export function useRoadmapsData() {
  const [roadmaps, setRoadmaps] = useState<LearningRoadmap[]>([])
  const [courses, setCourses] = useState<ApiCourse[]>([])
  const [exams, setExams] = useState<ToeicExamItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [skillsFilter, setSkillsFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)

  const [showModal, setShowModal] = useState<boolean>(false)
  const [editingRoadmap, setEditingRoadmap] = useState<LearningRoadmap | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [roadmapsData, coursesRes, examsData] = await Promise.all([
        roadmapService.getAllRoadmaps(),
        courseService.getAllCourses({ pageSize: 100 }),
        examAdminService.getExams(),
      ])

      setRoadmaps(Array.isArray(roadmapsData) ? roadmapsData : [])
      const rawCourses = Array.isArray(coursesRes)
        ? coursesRes
        : (coursesRes as any)?.result || (coursesRes as any)?.data || []
      setCourses(rawCourses)
      setExams(Array.isArray(examsData) ? examsData : [])
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu lộ trình:', err)
      toast.error('Không thể tải danh sách lộ trình học tập')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

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
      await roadmapService.deleteRoadmap(roadmapId)
      toast.success('Đã xóa lộ trình thành công!')
      loadData()
    } catch (err) {
      console.error('Lỗi khi xóa lộ trình:', err)
      toast.error('Không thể xóa lộ trình này')
    }
  }

  const handleTogglePublish = async (roadmap: LearningRoadmap) => {
    try {
      await roadmapService.updateRoadmap(roadmap._id, {
        is_published: !roadmap.is_published,
      })
      toast.success(
        roadmap.is_published
          ? 'Đã chuyển lộ trình về bản nháp!'
          : 'Đã xuất bản lộ trình công khai!'
      )
      loadData()
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái:', err)
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

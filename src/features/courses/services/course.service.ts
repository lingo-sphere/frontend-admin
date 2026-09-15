// Service xử lý các yêu cầu API quản lý khóa học, chương trình học và lộ trình học tập cho quản trị viên.

import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'
import type { PaginatedResult, LessonQuestion, LearningRoadmapStage } from '@/types/api.types'
import {
  type Course,
  type CourseModule,
  type Lesson,
  type LearningRoadmap,
  CourseSchema,
  CourseListSchema,
  PaginatedCoursesSchema,
  CourseModuleSchema,
  LessonSchema,
  LearningRoadmapSchema,
  RoadmapListSchema,
} from '@/features/courses/schemas/course.schema'
import { z } from 'zod'

export type { Course, CourseModule, Lesson, LearningRoadmap, LearningRoadmapStage, LessonQuestion }

export interface CourseFilterParams {
  category?: string
  targetScore?: number
  approvalStatus?: string
  search?: string
}

export const courseService = {

  async getAllCourses(params?: CourseFilterParams & { current?: number; pageSize?: number; limit?: number; page?: number }): Promise<PaginatedResult<Course>> {
    return api.get<PaginatedResult<Course>>(
      API_CONFIG.ENDPOINTS.COURSES.LIST,
      params as Record<string, unknown>,
      PaginatedCoursesSchema as unknown as z.ZodType<PaginatedResult<Course>>
    )
  },

  async getTeacherCourses(): Promise<Course[]> {
    return api.get<Course[]>(API_CONFIG.ENDPOINTS.COURSES.TEACHER_COURSES, undefined, CourseListSchema)
  },

  async getCourseById(id: string): Promise<Course> {
    return api.get<Course>(`${API_CONFIG.ENDPOINTS.COURSES.BY_ID(id)}?sanitize=false`, undefined, CourseSchema)
  },

  async getCourseCurriculum(id: string): Promise<Course> {
    return api.get<Course>(`${API_CONFIG.ENDPOINTS.COURSES.CURRICULUM(id)}?sanitize=false`, undefined, CourseSchema)
  },

  async createCourse(payload: Partial<Course>): Promise<Course> {
    return api.post<Course>(API_CONFIG.ENDPOINTS.COURSES.LIST, payload, CourseSchema)
  },

  async updateCourse(id: string, payload: Partial<Course>): Promise<Course> {
    return api.put<Course>(API_CONFIG.ENDPOINTS.COURSES.BY_ID(id), payload, CourseSchema)
  },

  async deleteCourse(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(API_CONFIG.ENDPOINTS.COURSES.BY_ID(id))
  },

  async updateApprovalStatus(id: string, approvalStatus: string, rejectionReason?: string): Promise<{ message: string; course: Course }> {
    return api.patch<{ message: string; course: Course }>(API_CONFIG.ENDPOINTS.COURSES.APPROVAL_STATUS(id), {
      approval_status: approvalStatus,
      rejection_reason: rejectionReason,
    })
  },

  async getModules(courseId: string): Promise<CourseModule[]> {
    return api.get<CourseModule[]>(
      API_CONFIG.ENDPOINTS.COURSES.MODULES(courseId),
      undefined,
      z.array(CourseModuleSchema)
    )
  },

  async createModule(courseId: string, payload: { title: string; order_index?: number; module_order?: number; description?: string; is_free_preview?: boolean }): Promise<CourseModule> {
    return api.post<CourseModule>(API_CONFIG.ENDPOINTS.COURSES.MODULES(courseId), payload, CourseModuleSchema)
  },

  async deleteModule(moduleId: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(API_CONFIG.ENDPOINTS.COURSES.DELETE_MODULE(moduleId))
  },

  async updateModule(moduleId: string, payload: Partial<CourseModule> & Record<string, unknown>): Promise<CourseModule> {
    return api.put<CourseModule>(`/courses/modules/${moduleId}`, payload, CourseModuleSchema)
  },

  async getLessons(courseId: string, moduleId: string): Promise<Lesson[]> {
    return api.get<Lesson[]>(
      API_CONFIG.ENDPOINTS.COURSES.LESSONS(courseId, moduleId),
      undefined,
      z.array(LessonSchema)
    )
  },

  async getLessonById(lessonId: string): Promise<Lesson> {
    return api.get<Lesson>(API_CONFIG.ENDPOINTS.COURSES.LESSON_BY_ID(lessonId), undefined, LessonSchema)
  },

  async createLesson(courseId: string, moduleId: string, payload: Partial<Lesson>): Promise<Lesson> {
    return api.post<Lesson>(API_CONFIG.ENDPOINTS.COURSES.LESSONS(courseId, moduleId), payload, LessonSchema)
  },

  async updateLesson(lessonId: string, payload: Partial<Lesson>): Promise<Lesson> {
    return api.put<Lesson>(API_CONFIG.ENDPOINTS.COURSES.LESSON_BY_ID(lessonId), payload, LessonSchema)
  },

  async deleteLesson(lessonId: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(API_CONFIG.ENDPOINTS.COURSES.LESSON_BY_ID(lessonId))
  },

  async getLessonQuestions(lessonId: string): Promise<LessonQuestion[]> {
    return api.get<LessonQuestion[]>(API_CONFIG.ENDPOINTS.COURSES.LESSON_QUESTIONS(lessonId))
  },

  async createLessonQuestion(lessonId: string, payload: LessonQuestion): Promise<LessonQuestion> {
    return api.post<LessonQuestion>(API_CONFIG.ENDPOINTS.COURSES.LESSON_QUESTIONS(lessonId), payload)
  },

  async updateLessonQuestion(questionId: string, payload: Partial<LessonQuestion>): Promise<LessonQuestion> {
    return api.put<LessonQuestion>(API_CONFIG.ENDPOINTS.COURSES.QUESTION_BY_ID(questionId), payload)
  },

  async deleteLessonQuestion(questionId: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(API_CONFIG.ENDPOINTS.COURSES.QUESTION_BY_ID(questionId))
  },
}

export const roadmapService = {
  async getAllRoadmaps(params?: { skills_focus?: string; is_published?: boolean }): Promise<LearningRoadmap[]> {
    return api.get<LearningRoadmap[]>(
      API_CONFIG.ENDPOINTS.ROADMAPS.LIST,
      params as Record<string, unknown>,
      RoadmapListSchema
    )
  },

  async getRoadmapById(id: string): Promise<LearningRoadmap> {
    return api.get<LearningRoadmap>(API_CONFIG.ENDPOINTS.ROADMAPS.BY_ID(id), undefined, LearningRoadmapSchema)
  },

  async createRoadmap(payload: Partial<LearningRoadmap>): Promise<LearningRoadmap> {
    return api.post<LearningRoadmap>(API_CONFIG.ENDPOINTS.ROADMAPS.LIST, payload, LearningRoadmapSchema)
  },

  async updateRoadmap(id: string, payload: Partial<LearningRoadmap>): Promise<LearningRoadmap> {
    return api.put<LearningRoadmap>(API_CONFIG.ENDPOINTS.ROADMAPS.BY_ID(id), payload, LearningRoadmapSchema)
  },

  async deleteRoadmap(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(API_CONFIG.ENDPOINTS.ROADMAPS.BY_ID(id))
  },

  async getRecommendation(query: {
    total_score?: number
    listening_score?: number
    reading_score?: number
    speaking_score?: number
    writing_score?: number
    skills_type?: string
  }): Promise<{ recommended_roadmap: LearningRoadmap & { stages: LearningRoadmapStage[] }; individual_courses: Course[]; note?: string }> {
    return api.get(API_CONFIG.ENDPOINTS.ROADMAPS.RECOMMENDATION, query as Record<string, unknown>)
  },
}

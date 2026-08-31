import { api } from '@/services/api-client'
import { API_CONFIG } from '@/config/api.config'
import type { Course, CourseModule, Lesson, LessonQuestion, PaginatedResult } from '@/types/api.types'

export interface CourseFilterParams {
  category?: string
  targetScore?: number
  approvalStatus?: string
  search?: string
}

export const courseService = {

  async getAllCourses(params?: CourseFilterParams & { current?: number; pageSize?: number; limit?: number; page?: number }): Promise<PaginatedResult<Course>> {
    return api.get<PaginatedResult<Course>>(API_CONFIG.ENDPOINTS.COURSES.LIST, params as Record<string, unknown>)
  },

  async getCourseById(id: string): Promise<Course> {
    return api.get<Course>(API_CONFIG.ENDPOINTS.COURSES.BY_ID(id))
  },

  async getCourseCurriculum(id: string): Promise<Course> {
    return api.get<Course>(API_CONFIG.ENDPOINTS.COURSES.CURRICULUM(id))
  },

  async createCourse(payload: Partial<Course>): Promise<Course> {
    return api.post<Course>(API_CONFIG.ENDPOINTS.COURSES.LIST, payload)
  },

  async updateCourse(id: string, payload: Partial<Course>): Promise<Course> {
    return api.put<Course>(API_CONFIG.ENDPOINTS.COURSES.BY_ID(id), payload)
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
    return api.get<CourseModule[]>(API_CONFIG.ENDPOINTS.COURSES.MODULES(courseId))
  },

  async createModule(courseId: string, payload: { title: string; module_order?: number; description?: string }): Promise<CourseModule> {
    return api.post<CourseModule>(API_CONFIG.ENDPOINTS.COURSES.MODULES(courseId), payload)
  },

  async deleteModule(moduleId: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(API_CONFIG.ENDPOINTS.COURSES.DELETE_MODULE(moduleId))
  },

  async getLessons(courseId: string, moduleId: string): Promise<Lesson[]> {
    return api.get<Lesson[]>(API_CONFIG.ENDPOINTS.COURSES.LESSONS(courseId, moduleId))
  },

  async getLessonById(lessonId: string): Promise<Lesson> {
    return api.get<Lesson>(API_CONFIG.ENDPOINTS.COURSES.LESSON_BY_ID(lessonId))
  },

  async createLesson(courseId: string, moduleId: string, payload: Partial<Lesson>): Promise<Lesson> {
    return api.post<Lesson>(API_CONFIG.ENDPOINTS.COURSES.LESSONS(courseId, moduleId), payload)
  },

  async updateLesson(lessonId: string, payload: Partial<Lesson>): Promise<Lesson> {
    return api.put<Lesson>(API_CONFIG.ENDPOINTS.COURSES.LESSON_BY_ID(lessonId), payload)
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

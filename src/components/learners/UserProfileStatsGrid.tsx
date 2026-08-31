import { Flame, Star, Target, Clock, Award, BookOpen } from 'lucide-react'
import type { UserProfileData } from './UserProfileHeader'

interface UserProfileStatsGridProps {
  profileData: UserProfileData
}

export function UserProfileStatsGrid({ profileData }: UserProfileStatsGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Star className="w-3.5 h-3.5 text-amber-500" />
          <span>Tổng XP</span>
        </div>
        <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {(profileData.total_xp || 1450).toLocaleString()}
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Flame className="w-3.5 h-3.5 text-rose-500" />
          <span>Streak Học</span>
        </div>
        <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {profileData.current_streak || 7} ngày
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Target className="w-3.5 h-3.5 text-teal-500" />
          <span>Target TOEIC</span>
        </div>
        <p className="text-lg font-bold text-teal-600 dark:text-teal-400">
          {profileData.toeic_score || 750}+
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Award className="w-3.5 h-3.5 text-indigo-500" />
          <span>Level</span>
        </div>
        <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
          Level {profileData.level || 5}
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <BookOpen className="w-3.5 h-3.5 text-sky-500" />
          <span>Từ đã học</span>
        </div>
        <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {(profileData.total_words_learned || 240).toLocaleString()}
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5 text-purple-500" />
          <span>Bài học xong</span>
        </div>
        <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {profileData.total_lessons_completed || 18} bài
        </p>
      </div>
    </div>
  )
}

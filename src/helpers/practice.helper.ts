/**
 * @file practice.helper.ts
 * @description Mã nguồn thành phần practice.helper.ts
 */

import type {
  PracticeSet,
  ListeningExercise,
  SpeakingExercise,
  WritingExercise,
} from '@/types/api.types'

export const INITIAL_PRACTICE_SETS: PracticeSet[] = [
  {
    _id: 'pset_01',
    title: 'Bộ Luyện Ngữ Pháp TOEIC Essential 500+',
    description:
      'Tổng hợp 50 câu hỏi ngữ pháp trọng điểm về Thì, Câu điều kiện & Mệnh đề quan hệ.',
    difficulty: 'INTERMEDIATE',
    category: 'GRAMMAR',
    total_questions: 50,
    duration_minutes: 45,
    is_active: true,
  },
  {
    _id: 'pset_02',
    title: 'Từ Vựng Business & Office Communication',
    description:
      'Luyện tập các cụm từ collocations và từ vựng văn phòng thường xuất hiện trong TOEIC Part 5 & 6.',
    difficulty: 'BEGINNER',
    category: 'VOCABULARY',
    total_questions: 30,
    duration_minutes: 25,
    is_active: true,
  },
  {
    _id: 'pset_03',
    title: 'Chiến Thuật Bẫy Câu Hỏi TOEIC Part 5 Advanced',
    description:
      'Chuyên đề phân biệt từ loại nâng cao, đảo ngữ và thể giả định.',
    difficulty: 'ADVANCED',
    category: 'TOEIC_READING',
    total_questions: 40,
    duration_minutes: 35,
    is_active: true,
  },
]

export const INITIAL_LISTENING_EXERCISES: ListeningExercise[] = [
  {
    _id: 'list_01',
    title: 'Part 1 - Mô Tả Tranh Văn Phòng & Công Sở',
    exercise_type: 'DICTATION',
    difficulty: 'BEGINNER',
    duration_seconds: 45,
    audio_url: 'https://r2.../part1_audio.mp3',
    transcript: 'A man is sitting at a desk and typing on a laptop...',
  },
  {
    _id: 'list_02',
    title: 'Part 2 - Hỏi Đáp Nhanh Với Từ Để Hỏi (Wh-Questions)',
    exercise_type: 'MULTIPLE_CHOICE',
    difficulty: 'INTERMEDIATE',
    duration_seconds: 60,
    audio_url: 'https://r2.../part2_audio.mp3',
    transcript: 'Where is the monthly financial meeting held?',
  },
]

export const INITIAL_SPEAKING_EXERCISES: SpeakingExercise[] = [
  {
    _id: 'spk_01',
    title: 'Phát Âm & Ngữ Điệu Giới Thiệu Bản Thân Trong Phỏng Vấn',
    difficulty: 'BEGINNER',
    prompt_text:
      'Good morning. Thank you for giving me the opportunity to introduce myself.',
    phonetic_guide: '/ɡʊd ˈmɔː.nɪŋ ˈθæŋk juː fɔːr ˈɡɪv.ɪŋ miː.../',
  },
]

export const INITIAL_WRITING_EXERCISES: WritingExercise[] = [
  {
    _id: 'wrt_01',
    title: 'Viết Email Phản Hồi Khiếu Nại Khách Hàng (Customer Inquiry)',
    topic: 'Customer Service',
    difficulty: 'INTERMEDIATE',
    prompt:
      'You received an email regarding a delayed shipment. Respond in 50-80 words expressing apology and providing a tracking solution.',
    min_words: 50,
  },
]

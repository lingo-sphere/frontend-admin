import type { GenerateQuizItem } from '@/services/ai.service'

export const DEFAULT_AI_SAMPLE_QUESTIONS: GenerateQuizItem[] = [
  {
    question_text: 'What is the most professional way to open a formal business email?',
    options: [
      'Hey there, how are you?',
      'Dear Mr. / Ms. [Last Name],',
      'Yo, check this out!',
      "What's up team,",
    ],
    correct_index: 1,
    explanation_vi:
      'Trong giao tiếp email công sở trang trọng, sử dụng "Dear Mr./Ms. + Họ" là quy chuẩn lịch sự và chuẩn mực nhất.',
  },
  {
    question_text:
      'Which phrase indicates that you are attaching a file in a business correspondence?',
    options: [
      'Please find attached the quarterly report.',
      'Look at this file now.',
      'I put the document here.',
      'See the things below.',
    ],
    correct_index: 0,
    explanation_vi:
      '"Please find attached..." là thành ngữ chuẩn trong văn phong thương mại khi đính kèm tài liệu.',
  },
]

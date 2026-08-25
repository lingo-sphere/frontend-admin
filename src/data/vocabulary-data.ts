export interface LexicalItem {
  id: string
  word: string
  word_type: string
  cefr_level: string
  pronunciation_us?: string
  pronunciation_uk?: string
  audio_url_us?: string
  meanings_count: number
  examples_count: number
  status: 'ACTIVE' | 'INACTIVE'
  is_verified: boolean
  created_at: string
}

export interface Topic {
  id: string
  name_en: string
  name_vi: string
  slug: string
  description?: string
  cefr_level: string
  lexical_count: number
  is_featured: boolean
  status: 'ACTIVE' | 'INACTIVE'
  created_at: string
}

export interface FlashcardDeck {
  id: string
  name_en: string
  name_vi: string
  description?: string
  creator_name: string
  topic_name?: string
  cefr_level?: string
  card_count: number
  total_studied: number
  total_users: number
  avg_mastery_percent: number
  rating_average: number
  rating_count: number
  visibility: 'PUBLIC' | 'PRIVATE'
  is_featured: boolean
  is_premium: boolean
  created_at: string
}

export interface VocabularyStats {
  totalWords: number
  activeWords: number
  totalTopics: number
  featuredTopics: number
  totalDecks: number
  publicDecks: number
  avgMastery: number
}

export const wordTypeLabels: Record<string, { vi: string; en: string }> = {
  NOUN: { vi: 'Danh từ', en: 'Noun' },
  VERB: { vi: 'Động từ', en: 'Verb' },
  ADJECTIVE: { vi: 'Tính từ', en: 'Adjective' },
  ADVERB: { vi: 'Trạng từ', en: 'Adverb' },
  PREPOSITION: { vi: 'Giới từ', en: 'Preposition' },
  CONJUNCTION: { vi: 'Liên từ', en: 'Conjunction' },
  PRONOUN: { vi: 'Đại từ', en: 'Pronoun' },
  PHRASE: { vi: 'Cụm từ', en: 'Phrase' },
}

export const cefrLevelLabels: Record<string, { vi: string; en: string }> = {
  A1: { vi: 'A1 - Sơ cấp', en: 'A1 - Beginner' },
  A2: { vi: 'A2 - Tiền trung cấp', en: 'A2 - Elementary' },
  B1: { vi: 'B1 - Trung cấp', en: 'B1 - Intermediate' },
  B2: { vi: 'B2 - Tiền nâng cao', en: 'B2 - Upper Intermediate' },
  C1: { vi: 'C1 - Nâng cao', en: 'C1 - Advanced' },
  C2: { vi: 'C2 - Thành thạo', en: 'C2 - Proficient' },
}

export const cefrLevelColors: Record<string, { bg: string; text: string }> = {
  A1: { bg: 'var(--success-soft)', text: 'var(--success)' },
  A2: { bg: 'var(--success-soft)', text: 'var(--success)' },
  B1: { bg: 'var(--warning-soft)', text: 'var(--warning)' },
  B2: { bg: 'var(--warning-soft)', text: 'var(--warning)' },
  C1: { bg: 'rgba(201, 92, 89, 0.1)', text: 'var(--error)' },
  C2: { bg: 'rgba(201, 92, 89, 0.1)', text: 'var(--error)' },
}

export const mockLexicalItems: LexicalItem[] = [
  {
    id: 'lex-001',
    word: 'accomplish',
    word_type: 'VERB',
    cefr_level: 'B1',
    pronunciation_us: '/əˈkʌm.plɪʃ/',
    audio_url_us: 'https://example.com/audio/accomplish.mp3',
    meanings_count: 2,
    examples_count: 5,
    status: 'ACTIVE',
    is_verified: true,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'lex-002',
    word: 'advocate',
    word_type: 'VERB',
    cefr_level: 'C1',
    pronunciation_us: '/ˈæd.və.keɪt/',
    meanings_count: 3,
    examples_count: 8,
    status: 'ACTIVE',
    is_verified: true,
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'lex-003',
    word: 'benefit',
    word_type: 'NOUN',
    cefr_level: 'B1',
    pronunciation_us: '/ˈben.ə.fɪt/',
    meanings_count: 2,
    examples_count: 6,
    status: 'ACTIVE',
    is_verified: true,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'lex-004',
    word: 'comprehensive',
    word_type: 'ADJECTIVE',
    cefr_level: 'C1',
    pronunciation_us: '/ˌkɒm.prɪˈhen.sɪv/',
    meanings_count: 2,
    examples_count: 4,
    status: 'ACTIVE',
    is_verified: false,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'lex-005',
    word: 'diligent',
    word_type: 'ADJECTIVE',
    cefr_level: 'B2',
    pronunciation_us: '/ˈdɪl.ɪ.dʒənt/',
    meanings_count: 1,
    examples_count: 3,
    status: 'ACTIVE',
    is_verified: true,
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'lex-006',
    word: 'enhance',
    word_type: 'VERB',
    cefr_level: 'B2',
    pronunciation_us: '/ɪnˈhɑːns/',
    meanings_count: 2,
    examples_count: 7,
    status: 'ACTIVE',
    is_verified: true,
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'lex-007',
    word: 'feasible',
    word_type: 'ADJECTIVE',
    cefr_level: 'C1',
    pronunciation_us: '/ˈfiː.zə.bəl/',
    meanings_count: 1,
    examples_count: 4,
    status: 'INACTIVE',
    is_verified: false,
    created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'lex-008',
    word: 'implement',
    word_type: 'VERB',
    cefr_level: 'B2',
    pronunciation_us: '/ˈɪm.plɪ.ment/',
    meanings_count: 2,
    examples_count: 6,
    status: 'ACTIVE',
    is_verified: true,
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'lex-009',
    word: 'objective',
    word_type: 'NOUN',
    cefr_level: 'B2',
    pronunciation_us: '/əbˈdʒek.tɪv/',
    meanings_count: 3,
    examples_count: 9,
    status: 'ACTIVE',
    is_verified: true,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'lex-010',
    word: 'significant',
    word_type: 'ADJECTIVE',
    cefr_level: 'B2',
    pronunciation_us: '/sɪɡˈnɪf.ɪ.kənt/',
    meanings_count: 2,
    examples_count: 8,
    status: 'ACTIVE',
    is_verified: true,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const mockTopics: Topic[] = [
  {
    id: 'topic-001',
    name_en: 'Business & Management',
    name_vi: 'Kinh doanh & Quản lý',
    slug: 'business-management',
    description: 'Từ vựng liên quan đến kinh doanh, quản lý và công việc',
    cefr_level: 'B1',
    lexical_count: 245,
    is_featured: true,
    status: 'ACTIVE',
    created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'topic-002',
    name_en: 'Technology',
    name_vi: 'Công nghệ',
    slug: 'technology',
    description: 'Từ vựng về công nghệ và kỹ thuật',
    cefr_level: 'B2',
    lexical_count: 189,
    is_featured: true,
    status: 'ACTIVE',
    created_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'topic-003',
    name_en: 'Health & Medicine',
    name_vi: 'Sức khỏe & Y tế',
    slug: 'health-medicine',
    description: 'Từ vựng y khoa và sức khỏe',
    cefr_level: 'C1',
    lexical_count: 156,
    is_featured: false,
    status: 'ACTIVE',
    created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'topic-004',
    name_en: 'Education',
    name_vi: 'Giáo dục',
    slug: 'education',
    description: 'Từ vựng liên quan đến giáo dục và học tập',
    cefr_level: 'B1',
    lexical_count: 128,
    is_featured: true,
    status: 'ACTIVE',
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'topic-005',
    name_en: 'Finance & Banking',
    name_vi: 'Tài chính & Ngân hàng',
    slug: 'finance-banking',
    description: 'Từ vựng tài chính và ngân hàng',
    cefr_level: 'C1',
    lexical_count: 178,
    is_featured: false,
    status: 'ACTIVE',
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'topic-006',
    name_en: 'Travel & Tourism',
    name_vi: 'Du lịch',
    slug: 'travel-tourism',
    description: 'Từ vựng du lịch và tham quan',
    cefr_level: 'A2',
    lexical_count: 95,
    is_featured: true,
    status: 'ACTIVE',
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'topic-007',
    name_en: 'Environment',
    name_vi: 'Môi trường',
    slug: 'environment',
    description: 'Từ vựng về môi trường và khí hậu',
    cefr_level: 'B2',
    lexical_count: 112,
    is_featured: false,
    status: 'INACTIVE',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const mockFlashcardDecks: FlashcardDeck[] = [
  {
    id: 'deck-001',
    name_en: 'TOEIC 450 Essential Words',
    name_vi: 'Từ vựng TOEIC 450 thiết yếu',
    description: '450 từ vựng TOEIC phổ biến nhất',
    creator_name: 'Lan Chi',
    topic_name: 'Business & Management',
    cefr_level: 'B1',
    card_count: 450,
    total_studied: 12500,
    total_users: 2340,
    avg_mastery_percent: 72,
    rating_average: 4.5,
    rating_count: 156,
    visibility: 'PUBLIC',
    is_featured: true,
    is_premium: false,
    created_at: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'deck-002',
    name_en: 'Business English Premium',
    name_vi: 'Anh ngữ kinh doanh nâng cao',
    description: 'Từ vựng kinh doanh chuyên sâu',
    creator_name: 'Đức Minh',
    topic_name: 'Business & Management',
    cefr_level: 'C1',
    card_count: 200,
    total_studied: 5600,
    total_users: 890,
    avg_mastery_percent: 68,
    rating_average: 4.7,
    rating_count: 89,
    visibility: 'PUBLIC',
    is_featured: true,
    is_premium: true,
    created_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'deck-003',
    name_en: 'IELTS Academic Vocabulary',
    name_vi: 'Từ vựng IELTS Academic',
    description: 'Từ vựng học thuật cho IELTS',
    creator_name: 'Lan Chi',
    cefr_level: 'C1',
    card_count: 350,
    total_studied: 8900,
    total_users: 1560,
    avg_mastery_percent: 65,
    rating_average: 4.6,
    rating_count: 123,
    visibility: 'PUBLIC',
    is_featured: true,
    is_premium: true,
    created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'deck-004',
    name_en: 'Tech Industry Terms',
    name_vi: 'Thuật ngữ công nghệ',
    description: 'Từ vựng ngành công nghệ thông tin',
    creator_name: 'Admin',
    topic_name: 'Technology',
    cefr_level: 'B2',
    card_count: 150,
    total_studied: 3200,
    total_users: 567,
    avg_mastery_percent: 58,
    rating_average: 4.3,
    rating_count: 45,
    visibility: 'PUBLIC',
    is_featured: false,
    is_premium: false,
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'deck-005',
    name_en: 'Medical Vocabulary',
    name_vi: 'Từ vựng y khoa',
    description: 'Từ vựng chuyên ngành y',
    creator_name: 'Đức Minh',
    topic_name: 'Health & Medicine',
    cefr_level: 'C1',
    card_count: 180,
    total_studied: 2100,
    total_users: 345,
    avg_mastery_percent: 55,
    rating_average: 4.4,
    rating_count: 67,
    visibility: 'PUBLIC',
    is_featured: false,
    is_premium: true,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export function getVocabularyStats(): VocabularyStats {
  return {
    totalWords: mockLexicalItems.length,
    activeWords: mockLexicalItems.filter(w => w.status === 'ACTIVE').length,
    totalTopics: mockTopics.length,
    featuredTopics: mockTopics.filter(t => t.is_featured).length,
    totalDecks: mockFlashcardDecks.length,
    publicDecks: mockFlashcardDecks.filter(d => d.visibility === 'PUBLIC').length,
    avgMastery: Math.round(mockFlashcardDecks.reduce((sum, d) => sum + d.avg_mastery_percent, 0) / mockFlashcardDecks.length),
  }
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

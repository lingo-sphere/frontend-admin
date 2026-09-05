/**
 * @file excel.quiz.parser.ts
 * @description Hàm tiện ích đọc, chuẩn hóa tiêu đề và trích xuất danh sách câu hỏi trắc nghiệm từ file Excel
 */

import * as XLSX from 'xlsx'
import type { QuizQuestionItem } from '@/services/ai.service'

export interface ColumnValidationResult {
  isValid: boolean
  missingColumns: string[]
  foundHeaders: string[]
  totalRows: number
}

export function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

export function generateQuizExcelTemplate(): void {
  const templateData = [
    {
      'STT': 1,
      'Câu hỏi': 'Where is the conversation most likely taking place?',
      'Lựa chọn A': 'At a train station',
      'Lựa chọn B': 'In an airport terminal',
      'Lựa chọn C': 'Inside a hotel lobby',
      'Lựa chọn D': 'At a grocery store',
      'Đáp án đúng': 'B',
      'Giải thích': 'Người phụ nữ nhắc đến chuyến bay số 402 và cửa khởi hành, cho thấy địa điểm là sân bay.',
      'File Nghe (URL)': '',
    },
    {
      'STT': 2,
      'Câu hỏi': 'Ms. Henderson will be responsible for _______ the new training program for interns.',
      'Lựa chọn A': 'organize',
      'Lựa chọn B': 'organizing',
      'Lựa chọn C': 'organized',
      'Lựa chọn D': 'organization',
      'Đáp án đúng': 'B',
      'Giải thích': 'Sau giới từ for cần một danh động từ (V-ing), chọn organizing.',
      'File Nghe (URL)': '',
    },
    {
      'STT': 3,
      'Câu hỏi': 'All employees must submit their travel expense reports _______ Friday afternoon.',
      'Lựa chọn A': 'by',
      'Lựa chọn B': 'until',
      'Lựa chọn C': 'in',
      'Lựa chọn D': 'at',
      'Đáp án đúng': 'A',
      'Giải thích': 'By dùng để chỉ hạn chót (trước hoặc muộn nhất vào thời điểm nào).',
      'File Nghe (URL)': '',
    },
  ]

  const ws = XLSX.utils.json_to_sheet(templateData)
  ws['!cols'] = [
    { wch: 6 },
    { wch: 50 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 },
    { wch: 14 },
    { wch: 50 },
    { wch: 30 },
  ]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'QuizTemplate')
  XLSX.writeFile(wb, 'LingoSphere_Quiz_Template.xlsx')
}

export function parseQuizExcelBinary(binaryString: string): {
  questions: QuizQuestionItem[]
  validation: ColumnValidationResult
  errorMessage?: string
} {
  const wb = XLSX.read(binaryString, { type: 'binary' })
  const wsName = wb.SheetNames[0]
  const ws = wb.Sheets[wsName]

  const rawRows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 })
  if (!rawRows || rawRows.length < 2) {
    return {
      questions: [],
      validation: { isValid: false, missingColumns: [], foundHeaders: [], totalRows: 0 },
      errorMessage: 'File Excel không có dữ liệu câu hỏi hoặc chỉ có dòng tiêu đề.',
    }
  }

  const rawHeaders = (rawRows[0] || []).map((h) => String(h || '').trim())
  const cleanHeaderMap: Record<string, string> = {}

  rawHeaders.forEach((origHeader) => {
    const norm = normalizeKey(origHeader)
    if (norm) cleanHeaderMap[norm] = origHeader
  })

  const findHeader = (candidates: string[]): string | null => {
    for (const cand of candidates) {
      const normCand = normalizeKey(cand)
      if (cleanHeaderMap[normCand]) {
        return cleanHeaderMap[normCand]
      }
    }
    return null
  }

  const questionCol = findHeader(['Câu hỏi', 'cau hoi', 'question', 'question_text', 'nội dung', 'noi dung'])
  const optACol = findHeader(['Lựa chọn A', 'lua chon a', 'đáp án a', 'dap an a', 'option a', 'opt a', 'a'])
  const optBCol = findHeader(['Lựa chọn B', 'lua chon b', 'đáp án b', 'dap an b', 'option b', 'opt b', 'b'])
  const optCCol = findHeader(['Lựa chọn C', 'lua chon c', 'đáp án c', 'dap an c', 'option c', 'opt c', 'c'])
  const optDCol = findHeader(['Lựa chọn D', 'lua chon d', 'đáp án d', 'dap an d', 'option d', 'opt d', 'd'])
  const answerCol = findHeader(['Đáp án đúng', 'dap an dung', 'đáp án', 'dap an', 'correct', 'correct answer', 'correct_answer', 'key', 'kết quả', 'ket qua'])
  const explanationCol = findHeader(['Giải thích', 'giai thich', 'explanation', 'ghi chú', 'ghi chu', 'lý do', 'ly do'])
  const audioCol = findHeader(['File Nghe (URL)', 'File Nghe', 'file nghe', 'audio', 'audio_url', 'media_url', 'nghe', 'sound'])

  const missingCols: string[] = []
  if (!questionCol) missingCols.push('Câu hỏi')
  if (!optACol) missingCols.push('Lựa chọn A')
  if (!optBCol) missingCols.push('Lựa chọn B')
  if (!optCCol) missingCols.push('Lựa chọn C')
  if (!optDCol) missingCols.push('Lựa chọn D')
  if (!answerCol) missingCols.push('Đáp án đúng')

  if (missingCols.length > 0) {
    return {
      questions: [],
      validation: {
        isValid: false,
        missingColumns: missingCols,
        foundHeaders: rawHeaders.filter(Boolean),
        totalRows: rawRows.length - 1,
      },
      errorMessage: `File Excel thiếu ${missingCols.length} cột bắt buộc: ${missingCols.join(', ')}. Vui lòng kiểm tra lại cấu trúc theo file mẫu.`,
    }
  }

  const dataObjects = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws)
  const validQuestions: QuizQuestionItem[] = []

  dataObjects.forEach((row) => {
    const questionText = String(questionCol ? row[questionCol] || '' : '').trim()
    const optA = String(optACol ? row[optACol] || '' : '').trim()
    const optB = String(optBCol ? row[optBCol] || '' : '').trim()
    const optC = String(optCCol ? row[optCCol] || '' : '').trim()
    const optD = String(optDCol ? row[optDCol] || '' : '').trim()

    const correctAnswerRaw = String(answerCol ? row[answerCol] || '' : 'A')
      .trim()
      .toUpperCase()
      .replace(/[^ABCD]/g, '')

    const explanation = String(explanationCol ? row[explanationCol] || '' : '').trim()
    const rowMediaUrl = String(audioCol ? row[audioCol] || '' : '').trim()

    if (questionText && optA && optB) {
      validQuestions.push({
        question_text: questionText,
        options: [optA, optB, optC || 'N/A', optD || 'N/A'],
        correct_answer: ['A', 'B', 'C', 'D'].includes(correctAnswerRaw) ? correctAnswerRaw : 'A',
        explanation,
        media_url: rowMediaUrl || undefined,
      })
    }
  })

  if (validQuestions.length === 0) {
    return {
      questions: [],
      validation: {
        isValid: false,
        missingColumns: [],
        foundHeaders: rawHeaders.filter(Boolean),
        totalRows: dataObjects.length,
      },
      errorMessage: 'Không trích xuất được câu hỏi hợp lệ nào từ file. Đảm bảo các hàng đều có nội dung câu hỏi và các phương án lựa chọn.',
    }
  }

  return {
    questions: validQuestions,
    validation: {
      isValid: true,
      missingColumns: [],
      foundHeaders: rawHeaders.filter(Boolean),
      totalRows: dataObjects.length,
    },
  }
}

// Thành phần giao diện modal nhập và xử lý đề thi TOEIC tự động bằng trí tuệ nhân tạo.

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  X,
  Sparkles,
  Upload,
  FolderOpen,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileSpreadsheet,
  Music,
  Eye,
  Check,
} from 'lucide-react'
import { toast } from '@/store/toast.store'
import {
  toeicAiImportService,
  type AiExtractedQuestion,
} from '@/features/exams/services/toeic-ai-import.service'

interface ToeicAiImportModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ToeicAiImportModal({ isOpen, onClose, onSuccess }: ToeicAiImportModalProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const [mode, setMode] = useState<'LOCAL_BATCH' | 'MANUAL_UPLOAD'>('LOCAL_BATCH')
  const [folderPath, setFolderPath] = useState<string>('d:\\lingo-sphere\\BỘ ĐỀ THI 2025')
  const [selectedTests, setSelectedTests] = useState<string[]>([
    'TEST 1',
    'TEST 2',
    'TEST 3',
    'TEST 4',
    'TEST 5',
    'TEST 6',
    'TEST 7',
    'TEST 8',
    'TEST 9',
    'TEST 10',
  ])
  const [title, setTitle] = useState<string>('TOEIC Official 2025 - Test 01')
  const [examSeries, setExamSeries] = useState<string>('ETS 2025')
  const [releaseYear, setReleaseYear] = useState<number>(2025)
  const [durationMinutes, setDurationMinutes] = useState<number>(120)

  const [keyLcBase64, setKeyLcBase64] = useState<string>('')
  const [keyRcBase64, setKeyRcBase64] = useState<string>('')
  const [audioBase64, setAudioBase64] = useState<string>('')
  const [audioFilename, setAudioFilename] = useState<string>('')

  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [stepStatus, setStepStatus] = useState<string>('')
  const [progressPercent, setProgressPercent] = useState<number>(0)
  const [previewQuestions, setPreviewQuestions] = useState<AiExtractedQuestion[]>([])
  const [showPreviewDrawer, setShowPreviewDrawer] = useState<boolean>(false)
  const [extractedAnswers, setExtractedAnswers] = useState<Record<number, string>>({})

  if (!isOpen) return null

  const handleFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleKeyLcUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const b64 = await handleFileToBase64(file)
      setKeyLcBase64(b64)
      toast.success(isVi ? 'Đã tải lên ảnh KEY LC!' : 'Uploaded KEY LC image!')
    }
  }

  const handleKeyRcUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const b64 = await handleFileToBase64(file)
      setKeyRcBase64(b64)
      toast.success(isVi ? 'Đã tải lên ảnh KEY RC!' : 'Uploaded KEY RC image!')
    }
  }

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const b64 = await handleFileToBase64(file)
      setAudioBase64(b64)
      setAudioFilename(file.name)
      toast.success(isVi ? `Đã tải lên audio: ${file.name}` : `Uploaded audio: ${file.name}`)
    }
  }

  const handleToggleTest = (testName: string) => {
    setSelectedTests((prev) =>
      prev.includes(testName) ? prev.filter((t) => t !== testName) : [...prev, testName]
    )
  }

  const handleSelectAllTests = () => {
    const all = Array.from({ length: 10 }, (_, i) => `TEST ${i + 1}`)
    setSelectedTests(selectedTests.length === 10 ? [] : all)
  }

  const handleRunLocalBatch = async () => {
    if (!folderPath.trim()) {
      toast.error(isVi ? 'Vui lòng nhập đường dẫn thư mục!' : 'Please enter folder path!')
      return
    }

    if (selectedTests.length === 0) {
      toast.error(isVi ? 'Vui lòng chọn ít nhất 1 bài Test!' : 'Please select at least 1 test!')
      return
    }

    setIsProcessing(true)
    setProgressPercent(15)
    setStepStatus(
      isVi
        ? 'AI Vision đang quét bảng đáp án KEY LC & RC và bóc tách dữ liệu...'
        : 'AI Vision is scanning KEY LC & RC images and parsing questions...'
    )

    try {
      const results = await toeicAiImportService.importLocalBatch({
        folder_path: folderPath.trim(),
        exam_series: examSeries,
        release_year: releaseYear,
        test_names: selectedTests,
      })

      setProgressPercent(100)
      setStepStatus(
        isVi
          ? `Hoàn tất! Đã nhập và xuất bản thành công ${results.length} đề thi chuẩn TOEIC!`
          : `Completed! Successfully imported and published ${results.length} TOEIC exams!`
      )

      toast.success(
        isVi
          ? `Đã tạo thành công ${results.length} bộ đề thi mới vào Ngân hàng đề thi!`
          : `Successfully imported ${results.length} exams into the exam bank!`
      )

      setTimeout(() => {
        setIsProcessing(false)
        onSuccess()
        onClose()
      }, 1500)
    } catch (err: unknown) {
      setIsProcessing(false)
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(
        isVi
          ? `Lỗi khi nhập đề thi: ${msg}`
          : `Failed to import exams: ${msg}`
      )
    }
  }

  const handlePreviewManual = async () => {
    if (!keyLcBase64 || !keyRcBase64) {
      toast.error(
        isVi
          ? 'Vui lòng tải lên cả 2 file ảnh KEY LC (Listening) và KEY RC (Reading)!'
          : 'Please upload both KEY LC and KEY RC answer sheet images!'
      )
      return
    }

    setIsProcessing(true)
    setStepStatus(isVi ? 'Gemini Vision đang phân tích 200 đáp án từ ảnh...' : 'Gemini Vision is parsing 200 answers from images...')
    setProgressPercent(40)

    try {
      const keys = await toeicAiImportService.extractAnswerKeys({
        key_lc_base64: keyLcBase64,
        key_rc_base64: keyRcBase64,
      })
      setExtractedAnswers(keys)

      const previewRes = await toeicAiImportService.previewAiExam({
        title,
        exam_series: examSeries,
        release_year: releaseYear,
        duration_minutes: durationMinutes,
        key_lc_base64: keyLcBase64,
        key_rc_base64: keyRcBase64,
      })

      setPreviewQuestions(previewRes.questions || [])
      setShowPreviewDrawer(true)
      setProgressPercent(100)
      setIsProcessing(false)

      toast.success(
        isVi
          ? `Đã bóc tách thành công ${Object.keys(keys).length} câu hỏi chuẩn!`
          : `Successfully parsed ${Object.keys(keys).length} questions!`
      )
    } catch (err: unknown) {
      setIsProcessing(false)
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(isVi ? `Lỗi: ${msg}` : `Error: ${msg}`)
    }
  }

  const handleSaveManualExam = async () => {
    if (!title.trim()) {
      toast.error(isVi ? 'Vui lòng nhập tiêu đề đề thi!' : 'Please enter exam title!')
      return
    }

    setIsProcessing(true)
    setStepStatus(isVi ? 'Đang lưu đề thi và đồng bộ câu hỏi lên hệ thống...' : 'Saving exam and syncing questions...')
    setProgressPercent(70)

    try {
      await toeicAiImportService.importAiExam({
        title,
        exam_series: examSeries,
        release_year: releaseYear,
        duration_minutes: durationMinutes,
        audio_base64: audioBase64 || undefined,
        audio_filename: audioFilename || undefined,
        key_lc_base64: keyLcBase64,
        key_rc_base64: keyRcBase64,
        questions: previewQuestions.length > 0 ? previewQuestions : undefined,
        is_published: true,
      })

      setProgressPercent(100)
      toast.success(isVi ? 'Đã tạo và xuất bản đề thi thành công!' : 'Exam created and published successfully!')

      setTimeout(() => {
        setIsProcessing(false)
        onSuccess()
        onClose()
      }, 1000)
    } catch (err: unknown) {
      setIsProcessing(false)
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(isVi ? `Lỗi lưu đề thi: ${msg}` : `Failed to save exam: ${msg}`)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 dark:bg-black/35 backdrop-blur-[2px] animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>{isVi ? 'Nhập Đề Thi Thông Minh Bằng AI' : 'AI Smart Exam Importer'}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  Gemini Vision 2025
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isVi
                  ? 'Tự động quét ảnh bảng đáp án KEY LC & RC, nhận diện 200 câu hỏi và lưu trữ media lên R2'
                  : 'Auto-scan KEY LC & RC answer sheets, parse 200 questions, and upload media to R2'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 w-fit">
            <button
              type="button"
              onClick={() => setMode('LOCAL_BATCH')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'LOCAL_BATCH'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              <span>{isVi ? 'Nhập Từ Thư Mục Bộ Đề 2025' : 'Batch Import from Folder'}</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('MANUAL_UPLOAD')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'MANUAL_UPLOAD'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>{isVi ? 'Tải File Thủ Công (Ảnh KEY + Audio)' : 'Manual File Upload'}</span>
            </button>
          </div>

          {mode === 'LOCAL_BATCH' ? (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-800 dark:text-indigo-300 leading-relaxed">
                <span className="font-bold">{isVi ? 'Chế độ tự động thông minh:' : 'Smart batch mode:'}</span>{' '}
                {isVi
                  ? 'Hệ thống tự động phát hiện toàn bộ các đề thi (TEST 1 đến TEST 10), đọc bảng đáp án KEY LC và KEY RC bằng Gemini Vision, tải file Audio tương ứng lên R2 và tạo bài thi hoàn chỉnh 200 câu cho học viên.'
                  : 'The system scans all tests (TEST 1 to TEST 10), extracts answers using Gemini Vision, uploads audio to R2, and builds 200-question exams.'}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isVi ? 'Đường dẫn thư mục bộ đề (Local Path)' : 'Local folder path'}
                  </label>
                  <input
                    type="text"
                    value={folderPath}
                    onChange={(e) => setFolderPath(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="d:\lingo-sphere\BỘ ĐỀ THI 2025"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isVi ? 'Bộ đề thi (Exam Series)' : 'Exam series'}
                  </label>
                  <input
                    type="text"
                    value={examSeries}
                    onChange={(e) => setExamSeries(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isVi ? 'Chọn các đề thi cần tạo:' : 'Select tests to import:'}
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAllTests}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                  >
                    {selectedTests.length === 10
                      ? isVi
                        ? 'Bỏ chọn tất cả'
                        : 'Deselect all'
                      : isVi
                      ? 'Chọn tất cả 10 đề'
                      : 'Select all 10 tests'}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {Array.from({ length: 10 }, (_, i) => `TEST ${i + 1}`).map((testName) => {
                    const isSelected = selectedTests.includes(testName)
                    return (
                      <button
                        key={testName}
                        type="button"
                        onClick={() => handleToggleTest(testName)}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        <span>{testName}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {isProcessing && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                      <span>{stepStatus}</span>
                    </span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isProcessing}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {isVi ? 'Hủy' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleRunLocalBatch}
                  disabled={isProcessing || selectedTests.length === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isVi ? 'Đang phân tích AI...' : 'Processing AI...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{isVi ? `Bắt đầu AI Import (${selectedTests.length} Đề)` : `Start AI Import (${selectedTests.length} Tests)`}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isVi ? 'Tiêu đề đề thi' : 'Exam title'}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="TOEIC Official 2025 - Test 01"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isVi ? 'Thời gian (phút)' : 'Duration (min)'}
                  </label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-colors text-center space-y-2">
                  <FileSpreadsheet className="w-8 h-8 mx-auto text-indigo-500" />
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isVi ? 'Ảnh bảng đáp án KEY LC (Listening)' : 'KEY LC Image (Questions 1-100)'}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {keyLcBase64 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {isVi ? 'Đã chọn ảnh' : 'Selected'}
                      </span>
                    ) : (
                      isVi ? 'Kéo thả hoặc bấm để chọn ảnh .jpg/.png' : 'Upload .jpg/.png'
                    )}
                  </p>
                  <label className="inline-block px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold cursor-pointer hover:bg-indigo-100">
                    <span>{isVi ? 'Chọn file ảnh' : 'Choose file'}</span>
                    <input type="file" accept="image/*" onChange={handleKeyLcUpload} className="hidden" />
                  </label>
                </div>

                <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-colors text-center space-y-2">
                  <FileSpreadsheet className="w-8 h-8 mx-auto text-indigo-500" />
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isVi ? 'Ảnh bảng đáp án KEY RC (Reading)' : 'KEY RC Image (Questions 101-200)'}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {keyRcBase64 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {isVi ? 'Đã chọn ảnh' : 'Selected'}
                      </span>
                    ) : (
                      isVi ? 'Kéo thả hoặc bấm để chọn ảnh .jpg/.png' : 'Upload .jpg/.png'
                    )}
                  </p>
                  <label className="inline-block px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold cursor-pointer hover:bg-indigo-100">
                    <span>{isVi ? 'Chọn file ảnh' : 'Choose file'}</span>
                    <input type="file" accept="image/*" onChange={handleKeyRcUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-purple-400 transition-colors text-center space-y-2">
                <Music className="w-8 h-8 mx-auto text-purple-500" />
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isVi ? 'File Audio bài thi toàn bài (.mp3 / .wav)' : 'Full Exam Audio (.mp3 / .wav)'}
                </div>
                <p className="text-[11px] text-slate-500">
                  {audioFilename ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {audioFilename}
                    </span>
                  ) : (
                    isVi ? 'Chọn file Test 01.mp3 để gắn vào bài thi nghe' : 'Upload audio file'
                  )}
                </p>
                <label className="inline-block px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 text-xs font-bold cursor-pointer hover:bg-purple-100">
                  <span>{isVi ? 'Chọn file Audio' : 'Choose audio'}</span>
                  <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
                </label>
              </div>

              {Object.keys(extractedAnswers).length > 0 && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>
                      {isVi
                        ? `AI Vision đã đọc thành công ${Object.keys(extractedAnswers).length} đáp án chính xác!`
                        : `AI Vision parsed ${Object.keys(extractedAnswers).length} answers successfully!`}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                    {Object.entries(extractedAnswers).map(([qNum, ans]) => (
                      <span
                        key={qNum}
                        className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300"
                      >
                        Q{qNum}: <span className="text-indigo-600 dark:text-indigo-400">{ans}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                      <span>{stepStatus}</span>
                    </span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isProcessing}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {isVi ? 'Hủy' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handlePreviewManual}
                  disabled={isProcessing || !keyLcBase64 || !keyRcBase64}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  <Eye className="w-4 h-4" />
                  <span>{isVi ? 'Quét Đáp Án Bằng AI' : 'Scan Answers with AI'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveManualExam}
                  disabled={isProcessing || !keyLcBase64 || !keyRcBase64}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isVi ? 'Đang tạo đề...' : 'Creating...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{isVi ? 'Lưu & Xuất Bản Đề Thi' : 'Save & Publish Exam'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import {
  HardDrive,
  Volume2,
  UploadCloud,
  FileAudio,
  Play,
  CheckCircle,
  Database,
  Radio,
  Sparkles,
} from 'lucide-react'
import { mediaAdminService, type StorageQuota } from '@/services/media.service'
import { toast } from '@/store/toast-store'

export function MediaStoragePage() {
  const [quota, setQuota] = useState<StorageQuota | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const [ttsText, setTtsText] = useState<string>('Hello! Welcome to LingoSphere English Learning Ecosystem.')
  const [selectedVoice, setSelectedVoice] = useState<string>('alloy')
  const [isGeneratingTts, setIsGeneratingTts] = useState<boolean>(false)
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsage = async () => {
      setIsLoading(true)
      try {
        const data = await mediaAdminService.getStorageUsage()
        setQuota(data)
      } catch {
        toast.error('Không thể tải dung lượng lưu trữ R2')
      } finally {
        setIsLoading(false)
      }
    }
    fetchUsage()
  }, [])

  const handleGenerateTts = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ttsText.trim()) return
    setIsGeneratingTts(true)
    try {
      const res = await mediaAdminService.generateTts(ttsText, selectedVoice)
      setGeneratedAudioUrl(res.audio_url)
      toast.success('Sinh giọng đọc Text-to-Speech thành công!', 'TTS Sẵn sàng')
    } catch {
      toast.error('Có lỗi xảy ra khi sinh giọng đọc TTS')
    } finally {
      setIsGeneratingTts(false)
    }
  }

  const formatMb = (bytes: number) => (bytes / (1024 * 1024)).toFixed(1)
  const formatGb = (bytes: number) => (bytes / (1024 * 1024 * 1024)).toFixed(2)

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
          <HardDrive className="w-7 h-7 text-sky-400" />
          Kho Media & Máy Chủ Cloudflare R2 Storage
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Quản lý tệp đa phương tiện, phát âm Audio IPA, sinh giọng đọc Text-to-Speech và theo dõi hạn mức lưu trữ Cloud
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dung Lượng Đã Dùng</p>
                <h3 className="text-lg font-bold text-white">
                  {quota ? `${formatMb(quota.used_bytes)} MB` : 'Đang tải...'}
                </h3>
              </div>
            </div>
            <span className="text-xs font-bold text-sky-400 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20">
              {quota ? `${quota.used_percentage}%` : '0%'}
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all"
              style={{ width: `${quota?.used_percentage || 5}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 text-right">
            Tổng hạn mức miễn phí: {quota ? `${formatGb(quota.total_quota_bytes)} GB` : '10 GB'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <FileAudio className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng Tệp Audio & Media</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">{quota?.total_files_count || 142}</h3>
            <p className="text-xs text-emerald-400 mt-0.5 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              100% CDN Cloudflare siêu tốc
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hạ Tầng Media Microservice</p>
            <h3 className="text-base font-bold text-white mt-0.5">Port 3007 (TCP Internal)</h3>
            <p className="text-xs text-slate-400 mt-0.5">Hỗ trợ Presigned Upload & S3 SDK</p>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Studio Sinh Giọng Đọc Text-to-Speech (TTS)
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                AI Engine
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Nhập câu tiếng Anh bất kỳ để sinh tệp audio chuẩn bản xứ cho từ vựng và bài đọc TOEIC
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerateTts} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Văn bản Tiếng Anh cần đọc
            </label>
            <textarea
              rows={3}
              value={ttsText}
              onChange={(e) => setTtsText(e.target.value)}
              placeholder="Enter English text to generate pronunciation audio..."
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Giọng đọc (Voice):
              </label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="alloy">Alloy (Trung tính, rõ ràng)</option>
                <option value="echo">Echo (Trầm ấm, bài thuyết trình)</option>
                <option value="fable">Fable (Anh - Anh kể chuyện)</option>
                <option value="onyx">Onyx (Nam chuẩn, TOEIC Part 3-4)</option>
                <option value="nova">Nova (Nữ năng động, Hội thoại)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isGeneratingTts}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-semibold shadow-lg shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isGeneratingTts ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Đang sinh Audio...</span>
                </div>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Sinh Âm Thanh TTS
                </>
              )}
            </button>
          </div>
        </form>

        {generatedAudioUrl && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4 mt-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Play className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Audio TTS Đã Sẵn Sàng</p>
                <p className="text-[11px] text-slate-500 font-mono truncate max-w-md">{generatedAudioUrl}</p>
              </div>
            </div>
            <audio controls src={generatedAudioUrl} className="h-9" />
          </div>
        )}
      </div>
    </div>
  )
}

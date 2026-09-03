/**
 * @file MediaStoragePage.tsx
 * @description Trang quản trị MediaStoragePage trong giao diện Admin
 */

import { useState, useEffect } from 'react'
import { HardDrive } from 'lucide-react'
import { mediaAdminService, type StorageQuota } from '@/services/media.service'
import { toast } from '@/store/toast-store'
import { MediaStorageQuotaCards } from '@/components/media/MediaStorageQuotaCards'
import { MediaTtsGenerator } from '@/components/media/MediaTtsGenerator'

export function MediaStoragePage() {
  const [quota, setQuota] = useState<StorageQuota | null>(null)
  const [ttsText, setTtsText] = useState<string>('Hello! Welcome to LingoSphere English Learning Ecosystem.')
  const [selectedVoice, setSelectedVoice] = useState<string>('alloy')
  const [isGeneratingTts, setIsGeneratingTts] = useState<boolean>(false)
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const data = await mediaAdminService.getStorageUsage()
        setQuota(data)
      } catch {
        toast.error('Không thể tải thông tin dung lượng lưu trữ')
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <HardDrive className="w-7 h-7 text-sky-500" />
          Kho Media & Máy Chủ Lưu Trữ Đám Mây
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Quản lý tệp đa phương tiện, phát âm Audio IPA, sinh giọng đọc Text-to-Speech và theo dõi hạn mức lưu trữ Cloud
        </p>
      </div>

      <MediaStorageQuotaCards quota={quota} />

      <MediaTtsGenerator
        ttsText={ttsText}
        selectedVoice={selectedVoice}
        isGeneratingTts={isGeneratingTts}
        generatedAudioUrl={generatedAudioUrl}
        onTtsTextChange={setTtsText}
        onVoiceChange={setSelectedVoice}
        onSubmit={handleGenerateTts}
      />
    </div>
  )
}

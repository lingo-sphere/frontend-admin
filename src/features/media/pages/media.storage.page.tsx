// Trang quản trị kho media, tts generator và hạn mức lưu trữ với TanStack Query.
import { useState, useCallback } from 'react'
import { HardDrive } from 'lucide-react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { mediaAdminService, type StorageQuota } from '@/features/media/services/media.service'
import { toast } from '@/store/toast.store'
import { MediaStorageQuotaCards } from '@/features/media/components/media.storage.quota.cards'
import { MediaTtsGenerator } from '@/features/media/components/media.tts.generator'

export function MediaStoragePage() {
  const [ttsText, setTtsText] = useState<string>('Hello! Welcome to LingoSphere English Learning Ecosystem.')
  const [selectedVoice, setSelectedVoice] = useState<string>('alloy')
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null)

  const { data: quota = null } = useQuery<StorageQuota | null>({
    queryKey: ['media-storage-quota'],
    queryFn: async () => {
      try {
        return await mediaAdminService.getStorageUsage()
      } catch {
        toast.error('Không thể tải thông tin dung lượng lưu trữ')
        return null
      }
    },
    staleTime: 5 * 60 * 1000,
  })

  const ttsMutation = useMutation({
    mutationFn: async ({ text, voice }: { text: string; voice: string }) => {
      return mediaAdminService.generateTts(text, voice)
    },
    onSuccess: (res) => {
      setGeneratedAudioUrl(res.audio_url)
      toast.success('Sinh giọng đọc Text-to-Speech thành công!', 'TTS Sẵn sàng')
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi sinh giọng đọc TTS')
    },
  })

  const handleGenerateTts = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!ttsText.trim()) return
      await ttsMutation.mutateAsync({ text: ttsText, voice: selectedVoice })
    },
    [ttsText, selectedVoice, ttsMutation]
  )

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
        isGeneratingTts={ttsMutation.isPending}
        generatedAudioUrl={generatedAudioUrl}
        onTtsTextChange={setTtsText}
        onVoiceChange={setSelectedVoice}
        onSubmit={handleGenerateTts}
      />
    </div>
  )
}

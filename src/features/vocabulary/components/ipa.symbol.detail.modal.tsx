/**
 * @file ipa.symbol.detail.modal.tsx
 * @description Modal xem chi tiết một ký hiệu IPA kèm audio playback
 */

import { Volume2, X, Headphones, FileText, Tag, Hash } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { IpaSymbol } from '@/features/vocabulary/data/vocabulary.data'
import { ipaSymbolTypeLabels } from '@/features/vocabulary/data/vocabulary.data'
import { playIpaAudio } from '@/features/vocabulary/helpers/ipa.helper'

interface IpaSymbolDetailModalProps {
  isOpen: boolean
  onClose: () => void
  symbol: IpaSymbol | null
}

export function IpaSymbolDetailModal({ isOpen, onClose, symbol }: IpaSymbolDetailModalProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  if (!isOpen || !symbol) return null

  const typeLabel = symbol.symbol_type ? ipaSymbolTypeLabels[symbol.symbol_type] : undefined

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 dark:bg-black/40 backdrop-blur-[1px] animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative z-10 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Headphones className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {isVi ? 'Chi tiết ký hiệu IPA' : 'IPA Symbol Detail'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {symbol.symbol}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Symbol Display */}
          <div className="flex items-center justify-center py-6 rounded-xl bg-gradient-to-br from-indigo-50/60 to-violet-50/60 dark:from-indigo-950/30 dark:to-violet-950/30 border border-indigo-100 dark:border-indigo-900/40">
            <div className="text-6xl font-bold text-indigo-700 dark:text-indigo-300 font-serif">
              /{symbol.symbol}/
            </div>
          </div>

          {/* Type & Level */}
          <div className="flex flex-wrap items-center gap-2">
            {typeLabel && (
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${typeLabel.color}`}>
                {isVi ? typeLabel.vi : typeLabel.en}
              </span>
            )}
            {symbol.cefr_min_level && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {symbol.cefr_min_level}
              </span>
            )}
            {symbol.status && (
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                  symbol.status === 'ACTIVE'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                }`}
              >
                {symbol.status === 'ACTIVE' ? (isVi ? 'Hoạt động' : 'Active') : symbol.status}
              </span>
            )}
          </div>

          {/* Description */}
          {(symbol.description_en || symbol.description_vi) && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                <span>{isVi ? 'Mô tả' : 'Description'}</span>
              </div>
              <div className="space-y-1.5">
                {symbol.description_en && (
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">EN:</span>{' '}
                    {symbol.description_en}
                  </div>
                )}
                {symbol.description_vi && (
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">VI:</span>{' '}
                    {symbol.description_vi}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Example Word */}
          {symbol.example_word && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Tag className="w-3.5 h-3.5 text-emerald-500" />
                <span>{isVi ? 'Từ vựng mẫu' : 'Example Word'}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                    {symbol.example_word}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    {symbol.example_word_ipa}
                  </p>
                </div>
                {symbol.example_audio_url && (
                  <button
                    onClick={() => playIpaAudio(symbol.example_audio_url)}
                    className="ml-3 w-9 h-9 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-colors cursor-pointer shrink-0 border border-emerald-500/20"
                    title={isVi ? 'Nghe phát âm từ mẫu' : 'Play example audio'}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* IPA Audio */}
          {symbol.audio_url && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>{isVi ? 'Âm thanh IPA' : 'IPA Audio'}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-mono truncate flex-1">
                  {symbol.audio_url}
                </p>
                <button
                  onClick={() => playIpaAudio(symbol.audio_url)}
                  className="ml-3 w-9 h-9 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition-colors cursor-pointer shrink-0 border border-indigo-500/20"
                  title={isVi ? 'Nghe âm IPA' : 'Play IPA audio'}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Related Symbols */}
          {symbol.related_symbols && symbol.related_symbols.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Hash className="w-3.5 h-3.5 text-violet-500" />
                <span>{isVi ? 'Ký hiệu liên quan' : 'Related Symbols'}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {symbol.related_symbols.map((rel, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20"
                  >
                    /{rel}/
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isVi ? 'Đóng' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Modal chỉnh sửa thông tin ký hiệu IPA và tải lên âm thanh phát âm.

import { useState, useEffect, useRef } from "react";
import { Volume2, X, Upload, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "@/store/toast.store";
import type { IpaSymbol } from "@/features/vocabulary/data/vocabulary.data";
import { ipaSymbolTypeLabels } from "@/features/vocabulary/data/vocabulary.data";
import { playIpaAudio } from "@/features/vocabulary/helpers/ipa.helper";
import { useUploadIpaAudioMutation } from "@/features/vocabulary/hooks/use.vocabulary.admin.query";

interface IpaSymbolEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: IpaSymbol | null;
  onUpdate: (id: string, data: Partial<IpaSymbol>) => Promise<void>;
}

export function IpaSymbolEditModal({
  isOpen,
  onClose,
  symbol,
  onUpdate,
}: IpaSymbolEditModalProps) {
  const { i18n } = useTranslation();
  const isVi = i18n.language === "vi";
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    description_en: "",
    description_vi: "",
    cefr_min_level: "A1",
    audio_url: "",
  });

  useEffect(() => {
    if (symbol) {
      setFormData({
        description_en: symbol.description_en || "",
        description_vi: symbol.description_vi || "",
        cefr_min_level: symbol.cefr_min_level || "A1",
        audio_url: symbol.audio_url || "",
      });
    }
  }, [symbol]);

  const { mutateAsync: uploadAudio } = useUploadIpaAudioMutation();

  if (!isOpen || !symbol) return null;

  const typeLabel = symbol.symbol_type
    ? ipaSymbolTypeLabels[symbol.symbol_type]
    : undefined;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      setError("Chỉ chấp nhận file audio!");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const result = await uploadAudio({
        id: symbol.id,
        file,
        audioType: "symbol",
      });
      setFormData((prev) => ({ ...prev, audio_url: result.url }));
      toast.success(isVi ? "Upload thành công!" : "Upload successful!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await onUpdate(symbol.id, {
        description_en: formData.description_en,
        description_vi: formData.description_vi,
        cefr_min_level: formData.cefr_min_level,
        audio_url: formData.audio_url,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 dark:bg-black/40 backdrop-blur-[1px] animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative z-10 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {isVi ? "Chỉnh sửa IPA" : "Edit IPA Symbol"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                /{symbol.symbol}/
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="flex items-center justify-center py-4 rounded-xl bg-gradient-to-br from-amber-50/60 to-orange-50/60 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-100 dark:border-amber-900/40">
            <div className="text-5xl font-bold text-amber-700 dark:text-amber-300 font-serif">
              /{symbol.symbol}/
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {typeLabel && (
              <span
                className={`px-2.5 py-1 rounded-md text-xs font-bold ${typeLabel.color}`}
              >
                {isVi ? typeLabel.vi : typeLabel.en}
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {isVi ? "Mô tả (English)" : "Description (English)"}
            </label>
            <textarea
              value={formData.description_en}
              onChange={(e) =>
                setFormData({ ...formData, description_en: e.target.value })
              }
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
              rows={2}
              placeholder={
                isVi
                  ? "Nhập mô tả tiếng Anh..."
                  : "Enter English description..."
              }
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {isVi ? "Mô tả (Tiếng Việt)" : "Description (Vietnamese)"}
            </label>
            <textarea
              value={formData.description_vi}
              onChange={(e) =>
                setFormData({ ...formData, description_vi: e.target.value })
              }
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
              rows={2}
              placeholder={
                isVi
                  ? "Nhập mô tả tiếng Việt..."
                  : "Enter Vietnamese description..."
              }
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              CEFR Level
            </label>
            <select
              value={formData.cefr_min_level}
              onChange={(e) =>
                setFormData({ ...formData, cefr_min_level: e.target.value })
              }
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="A1">A1 - Beginner</option>
              <option value="A2">A2 - Elementary</option>
              <option value="B1">B1 - Intermediate</option>
              <option value="B2">B2 - Upper Intermediate</option>
              <option value="C1">C1 - Advanced</option>
              <option value="C2">C2 - Proficiency</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {isVi ? "Âm thanh IPA" : "IPA Audio"}
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-indigo-300 dark:border-indigo-700 hover:border-indigo-500 dark:hover:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isVi ? "Đang upload..." : "Uploading..."}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  {isVi ? "Upload file audio" : "Upload audio file"}
                </>
              )}
            </button>

            {formData.audio_url && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <p className="flex-1 text-xs text-slate-600 dark:text-slate-400 font-mono truncate">
                  {formData.audio_url}
                </p>
                <button
                  type="button"
                  onClick={() => playIpaAudio(formData.audio_url)}
                  className="p-1.5 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {isVi
                ? "Upload file audio (mp3, wav, ogg). Kích thước tối đa: 5MB."
                : "Upload audio file (mp3, wav, ogg). Max size: 5MB."}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </form>

        <div className="p-4 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            disabled={isLoading || isUploading}
          >
            {isVi ? "Hủy" : "Cancel"}
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || isUploading}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isVi ? "Lưu" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

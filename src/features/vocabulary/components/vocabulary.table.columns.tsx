// Định nghĩa các cột hiển thị bảng từ vựng trong trang quản trị.

import {
  Volume2,
  AudioLines,
  Hash,
  Star,
  Globe,
} from "lucide-react";
import type { LexicalItem } from "@/features/vocabulary/data/vocabulary.data";
import {
  lexicalTypeLabels,
  sourceLabels,
} from "@/features/vocabulary/data/vocabulary.data";
import type { DataTableColumn } from "@/components/data.table";
import { TableRowActions, renderTableDate } from "@/components/table.row.actions";
import { playAudio } from "@/features/vocabulary/helpers/vocabulary.helper";

interface GetVocabularyColumnsOptions {
  isVi?: boolean;
  onEditWord: (wordId: string) => void;
  onDeleteWord: (wordId: string) => Promise<void> | void;
  onViewDetail?: (wordId: string) => void;
}

export function getVocabularyColumns({
  isVi = true,
  onEditWord,
  onDeleteWord,
  onViewDetail,
}: GetVocabularyColumnsOptions): DataTableColumn<LexicalItem>[] {
  return [
    {
      key: "word",
      title: isVi ? "Từ vựng & Phát âm" : "Word & Phonetics",
      sortable: true,
      width: "w-[280px]",
      render: (w) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {w.audio_url_us && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  playAudio(w.audio_url_us)
                }}
                className="w-7 h-7 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title={isVi ? "Nghe phát âm US" : "Play US audio"}
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            )}
            {w.audio_url_uk && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  playAudio(w.audio_url_uk)
                }}
                className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title={isVi ? "Nghe phát âm UK" : "Play UK audio"}
              >
                <AudioLines className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetail?.(w.id);
                }}
                title={w.word}
                className="font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer truncate text-left"
              >
                {w.word}
              </button>
              {w.is_irregular && (
                <span
                  className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 shrink-0"
                  title={isVi ? "Từ bất quy tắc" : "Irregular word"}
                >
                  {isVi ? "BTQ" : "IRR"}
                </span>
              )}
              {w.is_root_word && (
                <span
                  className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 shrink-0"
                  title={isVi ? "Từ gốc" : "Root word"}
                >
                  ROOT
                </span>
              )}
            </div>
            {w.pronunciation && (
              <div className="flex items-center gap-2 mt-0.5">
                <p className="font-mono text-xs text-slate-400">
                  /{w.pronunciation}/
                </p>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "lexical_type",
      title: isVi ? "Loại từ" : "Lexical Type",
      width: "w-[120px]",
      align: "center",
      render: (w) => {
        const typeInfo = w.lexical_type
          ? lexicalTypeLabels[w.lexical_type]
          : undefined;
        return (
          <span className="px-2 py-1 rounded-md text-xs font-medium bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400">
            {typeInfo
              ? isVi
                ? typeInfo.vi
                : typeInfo.en
              : w.lexical_type || "word"}
          </span>
        );
      },
    },
    {
      key: "cefr",
      dataIndex: "cefr_level",
      title: isVi ? "CEFR" : "CEFR",
      width: "w-[70px]",
      align: "center",
      sortable: true,
      render: (w) => (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
          {w.cefr_level || "A1"}
        </span>
      ),
    },
    {
      key: "phonetics",
      title: isVi ? "Âm tiết" : "Syllables",
      width: "w-[80px]",
      align: "center",
      render: (w) => (
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
          <Hash className="w-3 h-3 text-slate-400" />
          <span>{w.syllables || 1}</span>
          {w.stress_pattern && (
            <span className="text-slate-400">/{w.stress_pattern}</span>
          )}
        </div>
      ),
    },
    {
      key: "frequency",
      title: isVi ? "Tần suất" : "Freq",
      width: "w-[70px]",
      align: "center",
      sortable: true,
      render: (w) => (
        <div className="flex items-center justify-center gap-1 text-xs text-slate-500 dark:text-slate-400">
          <Star className="w-3 h-3 text-amber-400" />
          <span>{w.frequency_rank ? `#${w.frequency_rank}` : "—"}</span>
        </div>
      ),
    },
    {
      key: "content",
      title: isVi ? "Nghĩa & Ví dụ" : "Definitions",
      width: "w-[120px]",
      align: "center",
      render: (w) => (
        <div className="text-xs text-slate-600 dark:text-slate-400">
          <span className="font-medium">
            {w.meanings_count || 1} {isVi ? "định nghĩa" : "defs"}
          </span>
          <span className="mx-1.5">•</span>
          <span>
            {w.examples_count || 0} {isVi ? "ví dụ" : "exs"}
          </span>
        </div>
      ),
    },
    {
      key: "source",
      title: isVi ? "Nguồn" : "Source",
      width: "w-[100px]",
      render: (w) => {
        const sourceInfo = w.source ? sourceLabels[w.source] : undefined;
        return (
          <div className="flex items-center gap-1">
            <Globe className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {sourceInfo
                ? isVi
                  ? sourceInfo.vi
                  : sourceInfo.en
                : w.source || "curated"}
            </span>
          </div>
        );
      },
    },
    {
      key: "status",
      title: isVi ? "Trạng thái" : "Status",
      width: "w-[100px]",
      align: "center",
      render: (w) => (
        <div className="flex flex-col items-center gap-1">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border w-fit ${
              w.is_verified
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
            }`}
          >
            {w.is_verified
              ? isVi
                ? "Đã duyệt"
                : "Verified"
              : isVi
              ? "Chờ duyệt"
              : "Pending"}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-medium border w-fit ${
              w.is_active
                ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20"
                : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 border-slate-200 dark:border-slate-700"
            }`}
          >
            {w.is_active
              ? isVi
                ? "Hoạt động"
                : "Active"
              : isVi
              ? "Khóa"
              : "Inactive"}
          </span>
        </div>
      ),
    },
    {
      key: "created_at",
      title: isVi ? "Ngày tạo" : "Created",
      width: "130px",
      align: "center",
      sortable: true,
      render: (w) => renderTableDate(w.created_at),
    },
    {
      key: "actions",
      title: isVi ? "Thao tác" : "Actions",
      width: "110px",
      align: "center",
      render: (w) => (
        <TableRowActions
          isVi={isVi}
          onView={onViewDetail ? () => onViewDetail(w.id) : undefined}
          onEdit={() => onEditWord(w.id)}
          onDelete={() => onDeleteWord(w.id)}
          deleteTitle={isVi ? "Xóa từ vựng này?" : "Delete this word?"}
          deleteDescription={isVi ? "Hành động này không thể hoàn tác." : "This action cannot be undone."}
        />
      ),
    },
  ];
}

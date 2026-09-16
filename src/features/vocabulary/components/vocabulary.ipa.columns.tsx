/**
 * @file vocabulary.ipa.columns.tsx
 * @description Columns cho bảng IPA symbols dùng chung DataTable
 */

import { Volume2, Edit2, Headphones, Tag } from "lucide-react";
import type { IpaSymbol } from "@/features/vocabulary/data/vocabulary.data";
import { ipaSymbolTypeLabels } from "@/features/vocabulary/data/vocabulary.data";
import type { DataTableColumn } from "@/components/data.table";
import { playIpaAudio } from "@/features/vocabulary/helpers/ipa.helper";

interface GetIpaColumnsOptions {
  isVi?: boolean;
  onViewSymbol: (symbol: IpaSymbol) => void;
  onEditSymbol: (symbol: IpaSymbol) => void;
}

export function getIpaColumns({
  isVi = true,
  onViewSymbol,
  onEditSymbol,
}: GetIpaColumnsOptions): DataTableColumn<IpaSymbol>[] {
  return [
    {
      key: "symbol",
      title: isVi ? "Ký hiệu IPA" : "IPA Symbol",
      sortable: true,
      width: "w-[320px]",
      render: (s) => (
        <div className="flex items-center gap-3">
          {/* IPA Symbol Audio - dùng audio_url đúng */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              playIpaAudio(s.audio_url);
            }}
            className="w-7 h-7 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title={isVi ? "Nghe âm IPA" : "Play IPA audio"}
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-mono text-base font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">
                /{s.symbol}/
              </p>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
                {s.symbol_type}
              </span>
            </div>
            {s.example_word && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  {s.example_word} {s.example_word_ipa}
                </p>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "symbol_type",
      title: isVi ? "Loại" : "Type",
      width: "w-[110px]",
      sortable: true,
      render: (s) => {
        const typeInfo = s.symbol_type
          ? ipaSymbolTypeLabels[s.symbol_type]
          : undefined;
        return (
          <span
            className={`px-2 py-1 rounded-md text-xs font-bold ${
              typeInfo?.color || "bg-slate-100 text-slate-600"
            }`}
          >
            {typeInfo
              ? isVi
                ? typeInfo.vi
                : typeInfo.en
              : s.symbol_type || "—"}
          </span>
        );
      },
    },
    {
      key: "cefr",
      title: "CEFR",
      width: "w-[70px]",
      sortable: true,
      render: (s) => (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
          {s.cefr_min_level || "A1"}
        </span>
      ),
    },
    {
      key: "description",
      title: isVi ? "Mô tả" : "Description",
      width: "w-[260px]",
      render: (s) => (
        <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
          {(isVi ? s.description_vi : s.description_en) ||
            (isVi ? s.description_en : s.description_vi) ||
            "—"}
        </div>
      ),
    },
    {
      key: "example",
      title: isVi ? "Từ mẫu" : "Example",
      width: "w-[180px]",
      render: (s) => {
        if (!s.example_word) {
          return <span className="text-xs text-slate-400">—</span>;
        }
        return (
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                {s.example_word}
              </p>
              <p className="font-mono text-[10px] text-slate-400 truncate">
                {s.example_word_ipa}
              </p>
            </div>
            {s.example_audio_url && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playIpaAudio(s.example_audio_url);
                }}
                className="w-6 h-6 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title={isVi ? "Nghe từ mẫu" : "Play example"}
              >
                <Volume2 className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      },
    },
    {
      key: "related",
      title: isVi ? "Liên quan" : "Related",
      width: "w-[140px]",
      render: (s) => {
        if (!s.related_symbols || s.related_symbols.length === 0) {
          return <span className="text-xs text-slate-400">—</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {s.related_symbols.slice(0, 3).map((rel, idx) => (
              <span
                key={idx}
                className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20"
              >
                /{rel}/
              </span>
            ))}
            {s.related_symbols.length > 3 && (
              <span className="text-[10px] text-slate-400">
                +{s.related_symbols.length - 3}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      title: isVi ? "Trạng thái" : "Status",
      width: "w-[110px]",
      render: (s) => (
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
            s.status === "ACTIVE"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
              : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
          }`}
        >
          {s.status === "ACTIVE"
            ? isVi
              ? "Hoạt động"
              : "Active"
            : s.status || "—"}
        </span>
      ),
    },
    {
      key: "actions",
      title: isVi ? "Thao tác" : "Actions",
      width: "w-[90px]",
      align: "right",
      render: (s) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewSymbol(s);
            }}
            className="p-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/20 transition-colors cursor-pointer"
            title={isVi ? "Xem chi tiết" : "View detail"}
            type="button"
          >
            <Headphones className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditSymbol(s);
            }}
            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 transition-colors cursor-pointer"
            title={isVi ? "Chỉnh sửa" : "Edit"}
            type="button"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];
}

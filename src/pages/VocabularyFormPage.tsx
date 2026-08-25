import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronLeft,
  Save,
  Plus,
  Trash2,
  BookOpen,
} from "lucide-react";
import { useAdminStore } from "@/store/admin-store";
import {
  mockTopics,
  cefrLevelLabels,
  wordTypeLabels,
} from "@/data/vocabulary-data";
import { toast } from "@/store/toast-store";

const WORD_TYPES = [
  "NOUN",
  "VERB",
  "ADJECTIVE",
  "ADVERB",
  "PREPOSITION",
  "CONJUNCTION",
  "PRONOUN",
  "PHRASE",
];

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

interface Meaning {
  id: string;
  part_of_speech: string;
  definition_en: string;
  definition_vi: string;
  short_meaning_vi: string;
  examples: string[];
}

export function VocabularyFormPage({ editWordId, editId }: { editWordId?: string; editId?: string }) {
  const { i18n } = useTranslation();
  const isVi = i18n.language === "vi";
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem);
  const currentEditId = editWordId || editId;
  const isEditing = !!currentEditId;

  const [word, setWord] = useState("");
  const [wordType, setWordType] = useState("NOUN");
  const [cefrLevel, setCefrLevel] = useState("B1");
  const [pronunciationUs, setPronunciationUs] = useState("");
  const [pronunciationUk, setPronunciationUk] = useState("");
  const [audioUrlUs, setAudioUrlUs] = useState("");
  const [meanings, setMeanings] = useState<Meaning[]>([
    {
      id: "mean-1",
      part_of_speech: "NOUN",
      definition_en: "",
      definition_vi: "",
      short_meaning_vi: "",
      examples: [""],
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addMeaning = () => {
    setMeanings([
      ...meanings,
      {
        id: `mean-${Date.now()}`,
        part_of_speech: wordType,
        definition_en: "",
        definition_vi: "",
        short_meaning_vi: "",
        examples: [""],
      },
    ]);
  };

  const removeMeaning = (id: string) => {
    setMeanings(meanings.filter((m) => m.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim()) {
      toast.error("Vui lòng nhập từ vựng");
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 500));
      toast.success(
        isEditing
          ? "Cập nhật từ vựng thành công!"
          : "Đã thêm từ vựng mới vào từ điển!"
      );
      setActiveNavItem("vocabulary");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveNavItem("vocabulary")}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
          type="button"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            {isEditing ? "Chỉnh Sửa Từ Vựng" : "Thêm Từ Vựng Mới"}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cấu hình phiên âm IPA, định nghĩa đa ngữ nghĩa và câu ví dụ minh họa
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Word Info */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-400" />
            <span>Thông tin từ vựng căn bản</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Từ vựng (English) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="VD: comprehensive"
                required
                className="w-full h-11 px-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Khung CEFR
              </label>
              <select
                value={cefrLevel}
                onChange={(e) => setCefrLevel(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                {CEFR_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl} - {cefrLevelLabels[lvl]?.[isVi ? "vi" : "en"]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Loại từ (Part of Speech)
              </label>
              <select
                value={wordType}
                onChange={(e) => setWordType(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                {WORD_TYPES.map((wt) => (
                  <option key={wt} value={wt}>
                    {wordTypeLabels[wt]?.[isVi ? "vi" : "en"] || wt}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Phiên âm Mỹ (IPA US)
              </label>
              <input
                type="text"
                value={pronunciationUs}
                onChange={(e) => setPronunciationUs(e.target.value)}
                placeholder="/ˌkɑːm.prəˈhen.sɪv/"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-100 font-mono focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Phiên âm Anh (IPA UK)
              </label>
              <input
                type="text"
                value={pronunciationUk}
                onChange={(e) => setPronunciationUk(e.target.value)}
                placeholder="/ˌkɒm.prɪˈhen.sɪv/"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-100 font-mono focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Audio phát âm (URL)
              </label>
              <input
                type="url"
                value={audioUrlUs}
                onChange={(e) => setAudioUrlUs(e.target.value)}
                placeholder="https://..."
                className="w-full h-11 px-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Meanings Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-100">
              Định nghĩa & Nghĩa tiếng Việt
            </h2>
            <button
              type="button"
              onClick={addMeaning}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm nét nghĩa</span>
            </button>
          </div>

          <div className="space-y-4">
            {meanings.map((meaning, mIdx) => (
              <div
                key={meaning.id}
                className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-400">Nét nghĩa #{mIdx + 1}</span>
                  {meanings.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMeaning(meaning.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Nghĩa ngắn tiếng Việt</label>
                    <input
                      type="text"
                      value={meaning.short_meaning_vi}
                      onChange={(e) =>
                        setMeanings(
                          meanings.map((m) =>
                            m.id === meaning.id ? { ...m, short_meaning_vi: e.target.value } : m
                          )
                        )
                      }
                      placeholder="VD: toàn diện, bao hàm"
                      className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Định nghĩa chi tiết (English)</label>
                    <input
                      type="text"
                      value={meaning.definition_en}
                      onChange={(e) =>
                        setMeanings(
                          meanings.map((m) =>
                            m.id === meaning.id ? { ...m, definition_en: e.target.value } : m
                          )
                        )
                      }
                      placeholder="Complete and including everything that is necessary"
                      className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setActiveNavItem("vocabulary")}
            className="h-11 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Lưu từ vựng</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Volume2,
  CheckCircle,
  X,
  RotateCcw,
  Layers,
  Sparkles,
  Bookmark,
} from "lucide-react";
import { Pagination } from "@/components/common/Pagination";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { vocabularyService } from "@/services/vocabulary.service";
import { toast } from "@/store/toast-store";
import {
  mockLexicalItems,
  mockTopics,
  mockFlashcardDecks,
  wordTypeLabels,
  type LexicalItem,
  type Topic,
  type FlashcardDeck,
} from "@/data/vocabulary-data";
import { useAdminStore } from "@/store/admin-store";

type TabType = "words" | "topics" | "decks";
type FilterLevel = "ALL" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export function VocabularyPage() {
  const { i18n } = useTranslation();
  const isVi = i18n.language === "vi";
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem);

  const [activeTab, setActiveTab] = useState<TabType>("words");
  const [words, setWords] = useState<LexicalItem[]>(mockLexicalItems);
  const [topics, setTopics] = useState<Topic[]>(mockTopics);
  const [decks, setDecks] = useState<FlashcardDeck[]>(mockFlashcardDecks);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [searchWord, setSearchWord] = useState("");
  const [filterLevel, setFilterLevel] = useState<FilterLevel>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Delete modal
  const [deleteWordId, setDeleteWordId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchVocabularyData = async () => {
    setIsLoading(true);
    try {
      const realWords = await vocabularyService.searchVocabulary({
        cefr_level: filterLevel !== "ALL" ? filterLevel : undefined,
      });

      if (realWords && realWords.length > 0) {
        const mappedWords: LexicalItem[] = realWords.map((w) => ({
          id: w._id,
          word: w.word,
          word_type: w.word_type || "NOUN",
          cefr_level: w.cefr_level || "A1",
          pronunciation_us: w.pronunciation_us || `/${w.word}/`,
          pronunciation_uk: w.pronunciation_uk || `/${w.word}/`,
          audio_url_us: w.audio_url_us,
          meanings_count: w.meanings?.length || 1,
          examples_count: w.meanings?.reduce((acc, m) => acc + (m.examples?.length || 0), 0) || 2,
          status: w.is_active !== false ? "ACTIVE" : "INACTIVE",
          is_verified: true,
          created_at: w.created_at || new Date().toISOString(),
        }));
        setWords(mappedWords);
      }
    } catch (err) {
      console.warn("Using local vocabulary data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVocabularyData();
  }, [filterLevel]);

  const filteredWords = useMemo(() => {
    return words.filter((w) => {
      const matchSearch = w.word.toLowerCase().includes(searchWord.toLowerCase());
      const matchLevel = filterLevel === "ALL" || w.cefr_level === filterLevel;
      return matchSearch && matchLevel;
    });
  }, [words, searchWord, filterLevel]);

  const paginatedWords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredWords.slice(start, start + pageSize);
  }, [filteredWords, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredWords.length / pageSize);

  const handleDeleteConfirm = async () => {
    if (!deleteWordId) return;
    setIsDeleting(true);
    try {
      setWords((prev) => prev.filter((w) => w.id !== deleteWordId));
      toast.success("Đã xóa từ vựng thành công!");
    } finally {
      setIsDeleting(false);
      setDeleteWordId(null);
    }
  };

  const playAudio = (url?: string) => {
    if (url) {
      const audio = new Audio(url);
      audio.play().catch(() => toast.info("Không thể phát âm thanh"));
    } else {
      toast.info("Chưa có bản ghi âm cho từ này");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Kho Từ Vựng & Bộ Thẻ Flashcard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý từ vựng chuẩn khung CEFR (A1-C2), bảng phát âm IPA, bộ thẻ ôn tập và chủ đề
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchVocabularyData}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-teal-400" : ""}`} />
            <span>Làm mới</span>
          </button>
          <button
            onClick={() => setActiveNavItem("vocab-create")}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Từ Vựng Mới</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-900/80 border border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab("words")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "words"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Kho từ vựng ({words.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("topics")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "topics"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Chủ đề ({topics.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("decks")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "decks"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Bộ thẻ công khai ({decks.length})</span>
        </button>
      </div>

      {/* TAB 1: WORDS */}
      {activeTab === "words" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
              <div className="flex items-center gap-2 w-full sm:w-72 h-10 px-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 focus-within:border-teal-500 transition-all">
                <Search className="w-4 h-4 text-slate-500 shrink-0" />
                <input
                  type="text"
                  value={searchWord}
                  onChange={(e) => setSearchWord(e.target.value)}
                  placeholder="Tra cứu từ vựng..."
                  className="w-full bg-transparent border-0 outline-none placeholder:text-slate-500 p-0 text-xs focus:ring-0"
                />
                {searchWord && (
                  <button onClick={() => setSearchWord("")} className="text-slate-500 hover:text-slate-300">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value as FilterLevel)}
                className="h-10 px-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                <option value="ALL">Tất cả trình độ CEFR</option>
                <option value="A1">A1 - Căn bản</option>
                <option value="A2">A2 - Sơ cấp</option>
                <option value="B1">B1 - Trung cấp</option>
                <option value="B2">B2 - Trung cao</option>
                <option value="C1">C1 - Nâng cao</option>
                <option value="C2">C2 - Thành thạo</option>
              </select>
            </div>
          </div>

          {/* Words Table */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold">
                    <th className="py-3.5 px-4">Từ vựng</th>
                    <th className="py-3.5 px-4">Khung CEFR</th>
                    <th className="py-3.5 px-4">Loại từ</th>
                    <th className="py-3.5 px-4">Phát âm IPA</th>
                    <th className="py-3.5 px-4">Nghĩa & Ví dụ</th>
                    <th className="py-3.5 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-200">
                  {paginatedWords.map((word) => (
                    <tr key={word.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-100">{word.word}</span>
                          <button
                            onClick={() => playAudio(word.audio_url_us)}
                            className="p-1 rounded-lg hover:bg-slate-800 text-teal-400 transition-colors cursor-pointer"
                            title="Phát âm"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                          {word.cefr_level}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-slate-300 font-medium">
                          {wordTypeLabels[word.word_type]?.[isVi ? "vi" : "en"] || word.word_type}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {word.pronunciation_us || `/${word.word}/`}
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        {word.meanings_count} định nghĩa · {word.examples_count} câu mẫu
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setActiveNavItem(`vocab-edit:${word.id}`)}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteWordId(word.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-800 p-2">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
                totalItems={filteredWords.length}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TOPICS */}
      {activeTab === "topics" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map((topic) => (
            <div key={topic.id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    {topic.cefr_level}
                  </span>
                  <span className="text-xs text-slate-400">{topic.lexical_count} từ</span>
                </div>
                <h3 className="text-base font-bold text-slate-100">{isVi ? topic.name_vi : topic.name_en}</h3>
                <p className="text-xs text-slate-400 mt-1">{topic.description || "Từ vựng thông dụng theo ngữ cảnh giao tiếp"}</p>
              </div>
              <div className="pt-3 mt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Slug: {topic.slug}</span>
                <span className="text-emerald-400 font-semibold">Hoạt động</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: DECKS */}
      {activeTab === "decks" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map((deck) => (
            <div key={deck.id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {deck.card_count} thẻ
                  </span>
                  <span className="text-xs text-amber-400 font-semibold">★ {deck.rating_average}</span>
                </div>
                <h3 className="text-base font-bold text-slate-100">{isVi ? deck.name_vi : deck.name_en}</h3>
                <p className="text-xs text-slate-400 mt-1">{deck.description}</p>
              </div>
              <div className="pt-3 mt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>{deck.total_users} người học</span>
                <span className="text-teal-400 font-semibold">{deck.avg_mastery_percent}% Mastery</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteWordId)}
        onClose={() => setDeleteWordId(null)}
        onConfirm={handleDeleteConfirm}
        title="Xóa từ vựng này?"
        description="Từ vựng và các ví dụ định nghĩa liên quan sẽ bị xóa khỏi từ điển."
        confirmText="Xóa từ"
        cancelText="Hủy"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

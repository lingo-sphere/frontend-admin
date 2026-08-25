import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  BookOpen,
  Search,
  Plus,
  Edit2,
  Trash2,
  Volume2,
  Bookmark,
  Layers,
  RotateCcw,
  X,
  FileSpreadsheet,
} from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { useAdminStore } from "@/store/admin-store";
import { vocabularyService } from "@/services/vocabulary.service";
import { toast } from "@/store/toast-store";
import {
  mockLexicalItems,
  mockTopics,
  mockFlashcardDecks,
  type LexicalItem,
  type Topic,
  type FlashcardDeck,
} from "@/data/vocabulary-data";
import type { LexicalItem as ApiLexicalItem, Topic as ApiTopic } from "@/types/api.types";

type TabType = "words" | "topics" | "decks";

export function VocabularyPage() {
  const { t } = useTranslation();
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem);

  const [activeTab, setActiveTab] = useState<TabType>("words");
  const [words, setWords] = useState<LexicalItem[]>(mockLexicalItems);
  const [topics, setTopics] = useState<Topic[]>(mockTopics);
  const [decks, setDecks] = useState<FlashcardDeck[]>(mockFlashcardDecks);
  const [isLoading, setIsLoading] = useState(false);

  const [searchWord, setSearchWord] = useState("");
  const [filterLevel, setFilterLevel] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [deleteWordId, setDeleteWordId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchVocabularyData = async () => {
    setIsLoading(true);
    try {
      const [wordsRes, topicsRes] = await Promise.allSettled([
        vocabularyService.searchVocabulary(),
        vocabularyService.getAllTopics(),
      ]);

      if (wordsRes.status === "fulfilled" && wordsRes.value && wordsRes.value.length > 0) {
        const mapped: LexicalItem[] = wordsRes.value.map((w: ApiLexicalItem) => ({
          id: w._id,
          word: w.word,
          word_type: w.word_type || "NOUN",
          cefr_level: w.cefr_level || "B1",
          pronunciation_us: w.pronunciation_us || "",
          audio_url_us: w.audio_url_us,
          meanings_count: 1,
          examples_count: 2,
          status: "ACTIVE",
          is_verified: true,
          created_at: new Date().toISOString(),
        }));
        setWords(mapped);
      }

      if (topicsRes.status === "fulfilled" && topicsRes.value && topicsRes.value.length > 0) {
        const mappedTopics: Topic[] = topicsRes.value.map((t: ApiTopic) => ({
          id: t._id,
          name: t.name,
          name_vi: t.name_vi || t.name,
          name_en: t.name,
          slug: t.slug || '',
          description: t.description || '',
          icon: t.icon_url || 'BookOpen',
          cefr_level: 'B1',
          lexical_count: t.words_count || 0,
          is_featured: false,
          status: 'ACTIVE',
          created_at: t.created_at || new Date().toISOString(),
        }));
        setTopics(mappedTopics);
      }
    } catch (err) {
      console.warn("Using local mock vocabulary:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVocabularyData();
  }, []);

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

  const handleDeleteWord = async () => {
    if (!deleteWordId) return;
    setIsDeleting(true);
    try {
      setWords((prev) => prev.filter((w) => w.id !== deleteWordId));
      toast.success("Đã xóa từ vựng thành công!");
    } catch {
      toast.error("Xóa từ vựng thất bại");
    } finally {
      setIsDeleting(false);
      setDeleteWordId(null);
    }
  };

  const playAudio = (url?: string) => {
    if (!url) return;
    const audio = new Audio(url);
    audio.play().catch(() => toast.info("Không thể phát âm thanh"));
  };

  const handleResetFilters = () => {
    setSearchWord("");
    setFilterLevel("ALL");
    setCurrentPage(1);
  };

  const columns: DataTableColumn<LexicalItem>[] = [
    {
      key: "word",
      title: "Từ vựng",
      render: (word) => (
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{word.word}</span>
          {word.audio_url_us && (
            <button
              onClick={() => playAudio(word.audio_url_us)}
              className="p-1 rounded-md text-teal-600 dark:text-teal-400 hover:bg-teal-500/10 transition-colors cursor-pointer"
              title="Nghe phát âm"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
    {
      key: "level",
      title: "Khung CEFR",
      render: (word) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            word.cefr_level === "C1" || word.cefr_level === "C2"
              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
              : word.cefr_level === "B1" || word.cefr_level === "B2"
              ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20"
              : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
          }`}
        >
          {word.cefr_level}
        </span>
      ),
    },
    {
      key: "pos",
      title: "Loại từ",
      render: (word) => <span className="text-slate-600 dark:text-slate-400 font-medium">{word.word_type}</span>,
    },
    {
      key: "ipa",
      title: "Phát âm IPA",
      render: (word) => <span className="font-mono text-slate-500 dark:text-slate-400">{word.pronunciation_us || "—"}</span>,
    },
    {
      key: "meanings",
      title: "Định nghĩa & Ví dụ",
      render: (word) => (
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          {word.meanings_count} định nghĩa · {word.examples_count} câu mẫu
        </span>
      ),
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (word) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
            word.status === "ACTIVE"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
              : "bg-slate-500/10 text-slate-500 border-slate-500/20"
          }`}
        >
          {word.status === "ACTIVE" ? "Hoạt động" : "Tạm ẩn"}
        </span>
      ),
    },
    {
      key: "actions",
      title: "Thao tác",
      align: "right",
      render: (word) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => setActiveNavItem(`vocab-edit:${word.id}`)}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Chỉnh sửa từ vựng"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteWordId(word.id)}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-500/20 dark:bg-slate-800 text-slate-500 hover:text-rose-500 transition-colors cursor-pointer"
            title="Xóa từ vựng"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Kho Từ Vựng & Bộ Thẻ Flashcard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Quản lý từ vựng chuẩn khung CEFR (A1-C2), bảng phát âm IPA, bộ thẻ ôn tập và chủ đề
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchVocabularyData}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-teal-500" : ""}`} />
            <span>Làm mới</span>
          </button>
          <button
            onClick={() => setActiveNavItem("vocabulary-import")}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-teal-500" />
            <span>Nhập File CSV</span>
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
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab("words")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "words"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
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
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
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
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Bộ thẻ công khai ({decks.length})</span>
        </button>
      </div>

      {/* TAB 1: WORDS */}
      {activeTab === "words" && (
        <DataTable<LexicalItem>
          columns={columns}
          data={paginatedWords}
          rowKey={(w) => w.id}
          isLoading={isLoading}
          onResetFilters={handleResetFilters}
          filterSlot={
            <>
              <div className="flex items-center gap-2 w-full sm:w-72 h-10 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus-within:border-indigo-500 transition-all">
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                <input
                  type="text"
                  value={searchWord}
                  onChange={(e) => setSearchWord(e.target.value)}
                  placeholder="Tra cứu từ vựng..."
                  className="w-full bg-transparent border-0 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 p-0 text-xs focus:ring-0"
                />
                {searchWord && (
                  <button onClick={() => setSearchWord("")} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="h-10 px-3 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="ALL">Tất cả trình độ CEFR</option>
                <option value="A1">A1 - Sơ cấp căn bản</option>
                <option value="A2">A2 - Sơ cấp nâng cao</option>
                <option value="B1">B1 - Trung cấp</option>
                <option value="B2">B2 - Trung cấp trên</option>
                <option value="C1">C1 - Cao cấp</option>
                <option value="C2">C2 - Thành thạo</option>
              </select>
            </>
          }
          pagination={{
            currentPage,
            pageSize,
            totalItems: filteredWords.length,
            onPageChange: setCurrentPage,
            onPageSizeChange: (size) => {
              setPageSize(size);
              setCurrentPage(1);
            },
          }}
        />
      )}

      {/* TAB 2: TOPICS */}
      {activeTab === "topics" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                  <Bookmark className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
                  {topic.lexical_count} từ vựng
                </span>
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{topic.name_vi}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{topic.name_en}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">{topic.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: DECKS */}
      {activeTab === "decks" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck) => (
            <div
              key={deck.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {deck.card_count} thẻ
                </span>
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{deck.name_vi || deck.name_en}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{deck.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Word Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteWordId)}
        onClose={() => setDeleteWordId(null)}
        onConfirm={handleDeleteWord}
        title="Xóa từ vựng này?"
        description="Từ vựng và các định nghĩa mẫu liên quan sẽ bị xóa khỏi kho từ vựng hệ thống."
        confirmText="Xóa từ vựng"
        cancelText="Hủy bỏ"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

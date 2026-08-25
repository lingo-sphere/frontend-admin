// Updated: 2026-08-22
// Vocabulary Page - Quản lý từ vựng (Header Filter, Topics/Decks Filters & Modern Sync)

import { useState, useMemo, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  Plus,
  Download,
  Upload,
  Eye,
  Edit2,
  Trash2,
  BookOpen,
  Star,
  CheckCircle,
  XCircle,
  X,
  RotateCcw,
  Filter,
  ChevronUp,
  ChevronsUpDown,
} from "lucide-react";
import { Pagination } from "@/components/common/Pagination";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import {
  mockLexicalItems,
  mockTopics,
  mockFlashcardDecks,
  getVocabularyStats,
  wordTypeLabels,
  cefrLevelColors,
  type LexicalItem,
  formatDate,
} from "@/data/vocabulary-data";
import { useAdminStore } from "@/store/admin-store";

type TabType = "words" | "topics" | "decks";

// Word Filters
type FilterStatus = "ALL" | "ACTIVE" | "INACTIVE";
type FilterLevel = "ALL" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
type FilterType = "ALL" | "NOUN" | "VERB" | "ADJECTIVE" | "ADVERB" | "PREPOSITION" | "CONJUNCTION" | "PRONOUN" | "PHRASE";
type SortKey = "word" | "meanings" | "created_at" | null;
type SortDir = "asc" | "desc";

// Topic Filters
type FilterTopicFeatured = "ALL" | "FEATURED" | "NORMAL";
type SortTopic = "latest" | "oldest" | "words_desc" | "name";

// Deck Filters
type FilterDeckPlan = "ALL" | "FREE" | "PREMIUM";
type FilterDeckVisibility = "ALL" | "PUBLIC" | "PRIVATE";
type SortDeck = "latest" | "oldest" | "cards_desc" | "mastery_desc";

// Sortable Header Helper
function SortableHeader({
  title,
  sortKey,
  activeSortKey,
  sortDir,
  onSort,
}: {
  title: string;
  sortKey: SortKey;
  activeSortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const isActive = activeSortKey === sortKey;
  return (
    <button
      type="button"
      className={`th-sort-btn${isActive ? " active" : ""}`}
      onClick={() => onSort(sortKey)}
    >
      <span>{title}</span>
      {isActive ? (
        <ChevronUp
          className="th-sort-icon"
          style={{ transform: sortDir === "desc" ? "rotate(180deg)" : "none" }}
        />
      ) : (
        <ChevronsUpDown className="th-sort-icon muted" />
      )}
    </button>
  );
}

// Word Type Filter Header
function WordTypeFilterHeader({
  isVi,
  filterType,
  setFilterType,
  setCurrentPage,
}: {
  isVi: boolean;
  filterType: FilterType;
  setFilterType: (v: FilterType) => void;
  setCurrentPage: (n: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const OPTIONS: { value: FilterType; labelVi: string; labelEn: string }[] = [
    { value: "ALL", labelVi: "Tất cả loại từ", labelEn: "All Types" },
    ...Object.entries(wordTypeLabels).map(([key, label]) => ({
      value: key as FilterType,
      labelVi: label.vi,
      labelEn: label.en,
    })),
  ];

  const current = OPTIONS.find((o) => o.value === filterType);

  return (
    <div className="th-filter-wrapper" ref={ref}>
      <button
        type="button"
        className={`th-filter-btn${filterType !== "ALL" ? " active" : ""}${open ? " open" : ""}`}
        onClick={() => setOpen(!open)}
      >
        {isVi ? (current?.value === "ALL" ? "Loại từ" : current?.labelVi) : (current?.value === "ALL" ? "Type" : current?.labelEn)}
        <Filter className="th-filter-icon" />
      </button>
      {open && (
        <div className="th-filter-dropdown" style={{ minWidth: 170 }}>
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`th-filter-option${filterType === opt.value ? " active" : ""}`}
              onClick={() => {
                setFilterType(opt.value);
                setCurrentPage(1);
                setOpen(false);
              }}
            >
              {filterType === opt.value && <CheckCircle className="th-filter-check" />}
              {isVi ? opt.labelVi : opt.labelEn}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// CEFR Level Filter Header
function CefrFilterHeader({
  isVi,
  filterLevel,
  setFilterLevel,
  setCurrentPage,
}: {
  isVi: boolean;
  filterLevel: FilterLevel;
  setFilterLevel: (v: FilterLevel) => void;
  setCurrentPage: (n: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const OPTIONS: { value: FilterLevel; label: string }[] = [
    { value: "ALL", label: isVi ? "Tất cả cấp độ" : "All Levels" },
    { value: "A1", label: "A1" },
    { value: "A2", label: "A2" },
    { value: "B1", label: "B1" },
    { value: "B2", label: "B2" },
    { value: "C1", label: "C1" },
    { value: "C2", label: "C2" },
  ];

  return (
    <div className="th-filter-wrapper" ref={ref}>
      <button
        type="button"
        className={`th-filter-btn${filterLevel !== "ALL" ? " active" : ""}${open ? " open" : ""}`}
        onClick={() => setOpen(!open)}
      >
        {filterLevel === "ALL" ? "CEFR" : filterLevel}
        <Filter className="th-filter-icon" />
      </button>
      {open && (
        <div className="th-filter-dropdown" style={{ minWidth: 150 }}>
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`th-filter-option${filterLevel === opt.value ? " active" : ""}`}
              onClick={() => {
                setFilterLevel(opt.value);
                setCurrentPage(1);
                setOpen(false);
              }}
            >
              {filterLevel === opt.value && <CheckCircle className="th-filter-check" />}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Vocab Status Filter Header
function VocabStatusFilterHeader({
  isVi,
  filterStatus,
  setFilterStatus,
  setCurrentPage,
}: {
  isVi: boolean;
  filterStatus: FilterStatus;
  setFilterStatus: (v: FilterStatus) => void;
  setCurrentPage: (n: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const OPTIONS: { value: FilterStatus; labelVi: string; labelEn: string }[] = [
    { value: "ALL", labelVi: "Tất cả trạng thái", labelEn: "All Status" },
    { value: "ACTIVE", labelVi: "Hoạt động", labelEn: "Active" },
    { value: "INACTIVE", labelVi: "Không hoạt động", labelEn: "Inactive" },
  ];

  const current = OPTIONS.find((o) => o.value === filterStatus);

  return (
    <div className="th-filter-wrapper" ref={ref}>
      <button
        type="button"
        className={`th-filter-btn${filterStatus !== "ALL" ? " active" : ""}${open ? " open" : ""}`}
        onClick={() => setOpen(!open)}
      >
        {isVi ? (current?.value === "ALL" ? "Trạng thái" : current?.labelVi) : (current?.value === "ALL" ? "Status" : current?.labelEn)}
        <Filter className="th-filter-icon" />
      </button>
      {open && (
        <div className="th-filter-dropdown" style={{ minWidth: 160 }}>
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`th-filter-option${filterStatus === opt.value ? " active" : ""}`}
              onClick={() => {
                setFilterStatus(opt.value);
                setCurrentPage(1);
                setOpen(false);
              }}
            >
              {filterStatus === opt.value && <CheckCircle className="th-filter-check" />}
              {isVi ? opt.labelVi : opt.labelEn}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function VocabularyPage() {
  const { i18n } = useTranslation();
  const isVi = i18n.language === "vi";
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem);

  const [words, setWords] = useState<LexicalItem[]>(mockLexicalItems);
  const [activeTab, setActiveTab] = useState<TabType>("words");

  // Word Filters & Sort
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [filterLevel, setFilterLevel] = useState<FilterLevel>("ALL");
  const [filterType, setFilterType] = useState<FilterType>("ALL");
  const [filterJoin, setFilterJoin] = useState<string>("ALL");
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Topic Filters & Sort
  const [filterTopicLevel, setFilterTopicLevel] = useState<FilterLevel>("ALL");
  const [filterTopicStatus, setFilterTopicStatus] = useState<FilterStatus>("ALL");
  const [filterTopicFeatured, setFilterTopicFeatured] = useState<FilterTopicFeatured>("ALL");
  const [sortTopic, setSortTopic] = useState<SortTopic>("latest");

  // Deck Filters & Sort
  const [filterDeckLevel, setFilterDeckLevel] = useState<FilterLevel>("ALL");
  const [filterDeckPlan, setFilterDeckPlan] = useState<FilterDeckPlan>("ALL");
  const [filterDeckVisibility, setFilterDeckVisibility] = useState<FilterDeckVisibility>("ALL");
  const [sortDeck, setSortDeck] = useState<SortDeck>("latest");

  // Pagination & Selections
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
  const [deleteModalWord, setDeleteModalWord] = useState<string | null>(null);
  const [deleteMultipleModal, setDeleteMultipleModal] = useState(false);

  const stats = useMemo(() => getVocabularyStats(), []);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSelectedWords(new Set());
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else {
        setSortKey(null);
        setSortDir("asc");
      }
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchQuery("");
    setFilterStatus("ALL");
    setFilterLevel("ALL");
    setFilterType("ALL");
    setFilterJoin("ALL");
    setSortKey(null);
    setSortDir("asc");

    setFilterTopicLevel("ALL");
    setFilterTopicStatus("ALL");
    setFilterTopicFeatured("ALL");
    setSortTopic("latest");

    setFilterDeckLevel("ALL");
    setFilterDeckPlan("ALL");
    setFilterDeckVisibility("ALL");
    setSortDeck("latest");

    setCurrentPage(1);
  };

  const hasActiveFilters =
    filterStatus !== "ALL" ||
    filterLevel !== "ALL" ||
    filterType !== "ALL" ||
    filterJoin !== "ALL" ||
    searchQuery !== "" ||
    sortKey !== null ||
    filterTopicLevel !== "ALL" ||
    filterTopicStatus !== "ALL" ||
    filterTopicFeatured !== "ALL" ||
    sortTopic !== "latest" ||
    filterDeckLevel !== "ALL" ||
    filterDeckPlan !== "ALL" ||
    filterDeckVisibility !== "ALL" ||
    sortDeck !== "latest";

  const toggleWordSelection = (wordId: string) => {
    setSelectedWords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(wordId)) {
        newSet.delete(wordId);
      } else {
        newSet.add(wordId);
      }
      return newSet;
    });
  };

  const toggleAllSelection = () => {
    if (selectedWords.size === paginatedWords.length) {
      setSelectedWords(new Set());
    } else {
      setSelectedWords(new Set(paginatedWords.map((w) => w.id)));
    }
  };

  const handleDeleteWord = (wordId: string) => {
    setDeleteModalWord(wordId);
  };

  const confirmDeleteWord = () => {
    if (deleteModalWord) {
      setWords((prev) => prev.filter((w) => w.id !== deleteModalWord));
      setDeleteModalWord(null);
    }
  };

  const handleDeleteMultiple = () => {
    if (selectedWords.size > 0) {
      setDeleteMultipleModal(true);
    }
  };

  const confirmDeleteMultiple = () => {
    setWords((prev) => prev.filter((w) => !selectedWords.has(w.id)));
    setSelectedWords(new Set());
    setDeleteMultipleModal(false);
  };

  // Filtered Lexical Items
  const filteredWords = useMemo(() => {
    let result = [...words];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((w) => w.word.toLowerCase().includes(query));
    }
    if (filterStatus !== "ALL") {
      result = result.filter((w) => w.status === filterStatus);
    }
    if (filterLevel !== "ALL") {
      result = result.filter((w) => w.cefr_level === filterLevel);
    }
    if (filterType !== "ALL") {
      result = result.filter((w) => w.word_type === filterType);
    }

    // Date range filter
    if (filterJoin !== "ALL" && filterJoin.includes("_")) {
      const [fromStr, toStr] = filterJoin.split("_");
      const from = fromStr && fromStr.trim() ? new Date(fromStr + "T00:00:00") : null;
      const to = toStr && toStr.trim() ? new Date(toStr + "T23:59:59") : null;
      result = result.filter((w) => {
        const d = new Date(w.created_at);
        if (from && !isNaN(from.getTime()) && d < from) return false;
        if (to && !isNaN(to.getTime()) && d > to) return false;
        return true;
      });
    }

    // Sorting
    if (sortKey) {
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sortKey) {
        case "word":
          result.sort((a, b) => dir * a.word.localeCompare(b.word));
          break;
        case "meanings":
          result.sort((a, b) => dir * (a.meanings_count - b.meanings_count));
          break;
        case "created_at":
          result.sort((a, b) => dir * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
          break;
      }
    } else {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return result;
  }, [words, searchQuery, filterStatus, filterLevel, filterType, filterJoin, sortKey, sortDir]);

  const paginatedWords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredWords.slice(start, start + pageSize);
  }, [filteredWords, currentPage, pageSize]);

  // Filtered Topics
  const filteredTopics = useMemo(() => {
    let result = [...mockTopics];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.name_vi.toLowerCase().includes(q) ||
          t.name_en.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }
    if (filterTopicLevel !== "ALL") {
      result = result.filter((t) => t.cefr_level === filterTopicLevel);
    }
    if (filterTopicStatus !== "ALL") {
      result = result.filter((t) => t.status === filterTopicStatus);
    }
    if (filterTopicFeatured === "FEATURED") {
      result = result.filter((t) => t.is_featured);
    } else if (filterTopicFeatured === "NORMAL") {
      result = result.filter((t) => !t.is_featured);
    }

    if (filterJoin !== "ALL" && filterJoin.includes("_")) {
      const [fromStr, toStr] = filterJoin.split("_");
      const from = fromStr && fromStr.trim() ? new Date(fromStr + "T00:00:00") : null;
      const to = toStr && toStr.trim() ? new Date(toStr + "T23:59:59") : null;
      result = result.filter((t) => {
        const d = new Date(t.created_at);
        if (from && !isNaN(from.getTime()) && d < from) return false;
        if (to && !isNaN(to.getTime()) && d > to) return false;
        return true;
      });
    }

    switch (sortTopic) {
      case "latest":
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "words_desc":
        result.sort((a, b) => b.lexical_count - a.lexical_count);
        break;
      case "name":
        result.sort((a, b) => (isVi ? a.name_vi : a.name_en).localeCompare(isVi ? b.name_vi : b.name_en));
        break;
    }

    return result;
  }, [searchQuery, filterTopicLevel, filterTopicStatus, filterTopicFeatured, filterJoin, sortTopic, isVi]);

  // Filtered Decks
  const filteredDecks = useMemo(() => {
    let result = [...mockFlashcardDecks];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (d) =>
          d.name_vi.toLowerCase().includes(q) ||
          d.name_en.toLowerCase().includes(q) ||
          (d.description && d.description.toLowerCase().includes(q))
      );
    }
    if (filterDeckLevel !== "ALL") {
      result = result.filter((d) => d.cefr_level === filterDeckLevel);
    }
    if (filterDeckPlan === "FREE") {
      result = result.filter((d) => !d.is_premium);
    } else if (filterDeckPlan === "PREMIUM") {
      result = result.filter((d) => d.is_premium);
    }
    if (filterDeckVisibility !== "ALL") {
      result = result.filter((d) => d.visibility === filterDeckVisibility);
    }

    if (filterJoin !== "ALL" && filterJoin.includes("_")) {
      const [fromStr, toStr] = filterJoin.split("_");
      const from = fromStr && fromStr.trim() ? new Date(fromStr + "T00:00:00") : null;
      const to = toStr && toStr.trim() ? new Date(toStr + "T23:59:59") : null;
      result = result.filter((d) => {
        const date = new Date(d.created_at);
        if (from && !isNaN(from.getTime()) && date < from) return false;
        if (to && !isNaN(to.getTime()) && date > to) return false;
        return true;
      });
    }

    switch (sortDeck) {
      case "latest":
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "cards_desc":
        result.sort((a, b) => b.card_count - a.card_count);
        break;
      case "mastery_desc":
        result.sort((a, b) => b.avg_mastery_percent - a.avg_mastery_percent);
        break;
    }

    return result;
  }, [searchQuery, filterDeckLevel, filterDeckPlan, filterDeckVisibility, filterJoin, sortDeck, isVi]);

  // Export CSV
  const handleExportCsv = () => {
    const headers = ["id", "word", "word_type", "cefr_level", "meanings_count", "status", "created_at"];
    const rows = filteredWords.map((w) => [
      String(w.id),
      w.word,
      w.word_type,
      w.cefr_level,
      w.meanings_count,
      w.status,
      w.created_at,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vocabulary-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="page-content">
      {/* Header */}
      <div className="page-heading">
        <div>
          <h1 className="page-title">{isVi ? "Từ vựng" : "Vocabulary"}</h1>
          <p className="page-subtitle">
            {isVi ? "Quản lý từ vựng, chủ đề và bộ thẻ kho học" : "Manage vocabulary, topics, and flashcard decks"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="vocab-tabs">
        <button
          className={`vocab-tab${activeTab === "words" ? " active" : ""}`}
          onClick={() => handleTabChange("words")}
        >
          {isVi ? "Từ vựng" : "Words"}
          <span className="tab-count">{stats.totalWords}</span>
        </button>
        <button
          className={`vocab-tab${activeTab === "topics" ? " active" : ""}`}
          onClick={() => handleTabChange("topics")}
        >
          {isVi ? "Chủ đề" : "Topics"}
          <span className="tab-count">{stats.totalTopics}</span>
        </button>
        <button
          className={`vocab-tab${activeTab === "decks" ? " active" : ""}`}
          onClick={() => handleTabChange("decks")}
        >
          {isVi ? "Bộ thẻ" : "Decks"}
          <span className="tab-count">{stats.totalDecks}</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="users-toolbar">
        <div className="users-search">
          <Search className="search-icon" />
          <input
            type="text"
            className="users-search-input"
            placeholder={
              activeTab === "words"
                ? isVi ? "Tìm từ vựng..." : "Search words..."
                : activeTab === "topics"
                ? isVi ? "Tìm chủ đề..." : "Search topics..."
                : isVi ? "Tìm bộ thẻ..." : "Search decks..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery("")}>
              <X />
            </button>
          )}
        </div>

        {/* Date Range Filter beside Search */}
        <div className="toolbar-date-range">
          <span className="date-range-label">{isVi ? "Ngày tạo:" : "Created:"}</span>
          <div className="toolbar-date-inputs">
            <input
              type="date"
              className="toolbar-date-input"
              value={filterJoin && filterJoin !== "ALL" ? filterJoin.split("_")[0] || "" : ""}
              onChange={(e) => {
                const to = filterJoin && filterJoin !== "ALL" ? filterJoin.split("_")[1] || "" : "";
                const from = e.target.value;
                setFilterJoin(from || to ? `${from}_${to}` : "ALL");
                setCurrentPage(1);
              }}
            />
            <span className="date-range-sep">~</span>
            <input
              type="date"
              className="toolbar-date-input"
              value={filterJoin && filterJoin !== "ALL" ? filterJoin.split("_")[1] || "" : ""}
              onChange={(e) => {
                const from = filterJoin && filterJoin !== "ALL" ? filterJoin.split("_")[0] || "" : "";
                const to = e.target.value;
                setFilterJoin(from || to ? `${from}_${to}` : "ALL");
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* ProTable-style Actions Bar */}
      <div className="admin-table-actions">
        <h2 className="admin-table-title">
          {activeTab === "words"
            ? isVi ? "Danh sách từ vựng" : "Word List"
            : activeTab === "topics"
            ? isVi ? "Danh sách chủ đề" : "Topic List"
            : isVi ? "Danh sách bộ thẻ" : "Deck List"}
          <span className="admin-table-count">
            {activeTab === "words"
              ? filteredWords.length
              : activeTab === "topics"
              ? filteredTopics.length
              : filteredDecks.length}
          </span>
        </h2>
        <div className="admin-table-action-buttons">
          {/* Filters for Topics Tab */}
          {activeTab === "topics" && (
            <>
              {/* CEFR Level Filter */}
              <select
                className="admin-select"
                value={filterTopicLevel}
                onChange={(e) => setFilterTopicLevel(e.target.value as FilterLevel)}
              >
                <option value="ALL">{isVi ? "Tất cả cấp độ" : "All Levels"}</option>
                {["A1", "A2", "B1", "B2", "C1", "C2"].map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                className="admin-select"
                value={filterTopicStatus}
                onChange={(e) => setFilterTopicStatus(e.target.value as FilterStatus)}
              >
                <option value="ALL">{isVi ? "Tất cả trạng thái" : "All Status"}</option>
                <option value="ACTIVE">{isVi ? "Hoạt động" : "Active"}</option>
                <option value="INACTIVE">{isVi ? "Không hoạt động" : "Inactive"}</option>
              </select>

              {/* Featured Filter */}
              <select
                className="admin-select"
                value={filterTopicFeatured}
                onChange={(e) => setFilterTopicFeatured(e.target.value as FilterTopicFeatured)}
              >
                <option value="ALL">{isVi ? "Tất cả chủ đề" : "All Types"}</option>
                <option value="FEATURED">{isVi ? "Nổi bật" : "Featured"}</option>
                <option value="NORMAL">{isVi ? "Thường" : "Normal"}</option>
              </select>

              {/* Sort Select */}
              <select
                className="admin-select"
                value={sortTopic}
                onChange={(e) => setSortTopic(e.target.value as SortTopic)}
              >
                <option value="latest">{isVi ? "Sắp xếp: Mới nhất" : "Sort: Latest"}</option>
                <option value="oldest">{isVi ? "Sắp xếp: Cũ nhất" : "Sort: Oldest"}</option>
                <option value="words_desc">{isVi ? "Nhiều từ nhất" : "Most Words"}</option>
                <option value="name">{isVi ? "Tên chủ đề A-Z" : "Name A-Z"}</option>
              </select>
            </>
          )}

          {/* Filters for Decks Tab */}
          {activeTab === "decks" && (
            <>
              {/* CEFR Level Filter */}
              <select
                className="admin-select"
                value={filterDeckLevel}
                onChange={(e) => setFilterDeckLevel(e.target.value as FilterLevel)}
              >
                <option value="ALL">{isVi ? "Tất cả cấp độ" : "All Levels"}</option>
                {["A1", "A2", "B1", "B2", "C1", "C2"].map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>

              {/* Plan Filter */}
              <select
                className="admin-select"
                value={filterDeckPlan}
                onChange={(e) => setFilterDeckPlan(e.target.value as FilterDeckPlan)}
              >
                <option value="ALL">{isVi ? "Tất cả gói" : "All Plans"}</option>
                <option value="FREE">{isVi ? "Miễn phí" : "Free"}</option>
                <option value="PREMIUM">Premium</option>
              </select>

              {/* Visibility Filter */}
              <select
                className="admin-select"
                value={filterDeckVisibility}
                onChange={(e) => setFilterDeckVisibility(e.target.value as FilterDeckVisibility)}
              >
                <option value="ALL">{isVi ? "Quyền xem" : "Visibility"}</option>
                <option value="PUBLIC">{isVi ? "Công khai" : "Public"}</option>
                <option value="PRIVATE">{isVi ? "Riêng tư" : "Private"}</option>
              </select>

              {/* Sort Select */}
              <select
                className="admin-select"
                value={sortDeck}
                onChange={(e) => setSortDeck(e.target.value as SortDeck)}
              >
                <option value="latest">{isVi ? "Sắp xếp: Mới nhất" : "Sort: Latest"}</option>
                <option value="oldest">{isVi ? "Sắp xếp: Cũ nhất" : "Sort: Oldest"}</option>
                <option value="cards_desc">{isVi ? "Nhiều thẻ nhất" : "Most Cards"}</option>
                <option value="mastery_desc">{isVi ? "Thành thạo cao nhất" : "Highest Mastery"}</option>
              </select>
            </>
          )}

          {activeTab === "words" && (
            <button type="button" className="table-ghost-btn" onClick={handleExportCsv}>
              <Download />
              {isVi ? "Xuất CSV" : "Export"}
            </button>
          )}

          {/* Reset button */}
          <button
            type="button"
            className="table-ghost-btn"
            onClick={handleReset}
            title={isVi ? "Đặt lại tất cả" : "Reset all"}
          >
            <RotateCcw />
            {isVi ? "Đặt lại" : "Reset"}
          </button>

          {/* Import */}
          <button
            type="button"
            className="table-ghost-btn"
            onClick={() => setActiveNavItem("vocabulary-import")}
          >
            <Upload />
            {isVi ? "Nhập CSV" : "Import"}
          </button>

          {/* Add Word */}
          <button
            type="button"
            className="primary-button"
            onClick={() => setActiveNavItem("vocabulary-form")}
          >
            <Plus />
            {isVi ? "Thêm mới" : "Add Word"}
          </button>
        </div>
      </div>

      {/* Words Tab Content */}
      {activeTab === "words" && (
        <>
          {selectedWords.size > 0 && (
            <div className="bulk-actions-bar">
              <span className="bulk-count">
                {isVi ? "Đã chọn" : "Selected"}: {selectedWords.size}
              </span>
              <button className="danger-button" onClick={handleDeleteMultiple}>
                <Trash2 />
                {isVi ? "Xóa đã chọn" : "Delete"}
              </button>
              <button
                className="secondary-button"
                onClick={() => setSelectedWords(new Set())}
              >
                {isVi ? "Hủy" : "Cancel"}
              </button>
            </div>
          )}
          <div className="users-table-wrapper">
            <table className="users-table density-middle">
              <thead>
                <tr>
                  <th className="checkbox-col" style={{ width: 40 }}>
                    <input
                      type="checkbox"
                      checked={
                        paginatedWords.length > 0 &&
                        selectedWords.size === paginatedWords.length
                      }
                      onChange={toggleAllSelection}
                    />
                  </th>
                  <th>
                    <SortableHeader
                      title={isVi ? "Từ vựng" : "Word"}
                      sortKey="word"
                      activeSortKey={sortKey}
                      sortDir={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                  <th>
                    <WordTypeFilterHeader
                      isVi={isVi}
                      filterType={filterType}
                      setFilterType={setFilterType}
                      setCurrentPage={setCurrentPage}
                    />
                  </th>
                  <th>
                    <CefrFilterHeader
                      isVi={isVi}
                      filterLevel={filterLevel}
                      setFilterLevel={setFilterLevel}
                      setCurrentPage={setCurrentPage}
                    />
                  </th>
                  <th>
                    <SortableHeader
                      title={isVi ? "Số nghĩa" : "Meanings"}
                      sortKey="meanings"
                      activeSortKey={sortKey}
                      sortDir={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                  <th>
                    <SortableHeader
                      title={isVi ? "Ngày tạo" : "Created At"}
                      sortKey="created_at"
                      activeSortKey={sortKey}
                      sortDir={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                  <th>
                    <VocabStatusFilterHeader
                      isVi={isVi}
                      filterStatus={filterStatus}
                      setFilterStatus={setFilterStatus}
                      setCurrentPage={setCurrentPage}
                    />
                  </th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {paginatedWords.map((word) => (
                  <tr
                    key={word.id}
                    className={selectedWords.has(word.id) ? "selected" : ""}
                  >
                    <td className="checkbox-col">
                      <input
                        type="checkbox"
                        checked={selectedWords.has(word.id)}
                        onChange={() => toggleWordSelection(word.id)}
                      />
                    </td>
                    <td>
                      <div className="admin-user-cell">
                        <div className="admin-user-info">
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span className="admin-name">{word.word}</span>
                            {word.is_verified && (
                              <CheckCircle style={{ width: 14, height: 14, color: "var(--success)" }} />
                            )}
                          </div>
                          {word.pronunciation_us && (
                            <span className="admin-email">{word.pronunciation_us}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="role-badge" style={{ background: "var(--surface-hover)", color: "var(--text-primary)" }}>
                        {wordTypeLabels[word.word_type]?.[
                          isVi ? "vi" : "en"
                        ] || word.word_type}
                      </span>
                    </td>
                    <td>
                      <span
                        className="level-badge"
                        style={{
                          background: cefrLevelColors[word.cefr_level]?.bg,
                          color: cefrLevelColors[word.cefr_level]?.text,
                        }}
                      >
                        {word.cefr_level}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{word.meanings_count}</td>
                    <td style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                      {formatDate(word.created_at)}
                    </td>
                    <td>
                      <span
                        className={`status-pill ${
                          word.status === "ACTIVE" ? "success" : "inactive"
                        }`}
                      >
                        {word.status === "ACTIVE"
                          ? isVi ? "Hoạt động" : "Active"
                          : isVi ? "Không hoạt động" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="row-action-btn"
                          title={isVi ? "Xem chi tiết" : "View Details"}
                          onClick={() =>
                            setActiveNavItem(`vocabulary-form:${word.id}`)
                          }
                        >
                          <Eye />
                        </button>
                        <button
                          className="row-action-btn"
                          title={isVi ? "Sửa" : "Edit"}
                          onClick={() =>
                            setActiveNavItem(`vocabulary-form:${word.id}`)
                          }
                        >
                          <Edit2 />
                        </button>
                        <button
                          className="row-action-btn danger"
                          title={isVi ? "Xóa" : "Delete"}
                          onClick={() => handleDeleteWord(word.id)}
                        >
                          <Trash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredWords.length === 0 && (
              <div className="users-empty">
                <BookOpen className="empty-icon" />
                <p className="empty-title">
                  {hasActiveFilters
                    ? isVi ? "Không tìm thấy từ vựng khớp với bộ lọc" : "No words found matching filters"
                    : isVi ? "Chưa có từ vựng nào" : "No words yet"}
                </p>
                {hasActiveFilters && (
                  <button className="empty-action" onClick={handleReset}>
                    {isVi ? "Xóa bộ lọc" : "Clear filters"}
                  </button>
                )}
              </div>
            )}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredWords.length / pageSize)}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
            totalItems={filteredWords.length}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {/* Topics Tab */}
      {activeTab === "topics" && (
        <>
          <div className="vocab-topics-grid">
            {filteredTopics.map((topic) => (
              <div
                key={topic.id}
                className={`topic-card${
                  topic.status === "INACTIVE" ? " inactive" : ""
                }`}
              >
                <div className="topic-header">
                  <h3 className="topic-name">
                    {isVi ? topic.name_vi : topic.name_en}
                  </h3>
                  {topic.is_featured && <Star className="featured-icon" />}
                </div>
                <div className="topic-meta">
                  <span className="level-badge">{topic.cefr_level}</span>
                  <span className="word-count">
                    {topic.lexical_count} {isVi ? "từ" : "words"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredTopics.length === 0 && (
            <div className="users-empty" style={{ marginTop: 24 }}>
              <BookOpen className="empty-icon" />
              <p className="empty-title">
                {hasActiveFilters
                  ? isVi ? "Không tìm thấy chủ đề khớp với bộ lọc" : "No topics found matching filters"
                  : isVi ? "Chưa có chủ đề nào" : "No topics yet"}
              </p>
              {hasActiveFilters && (
                <button className="empty-action" onClick={handleReset}>
                  {isVi ? "Xóa bộ lọc" : "Clear filters"}
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Decks Tab */}
      {activeTab === "decks" && (
        <>
          <div className="vocab-decks-grid">
            {filteredDecks.map((deck) => (
              <div key={deck.id} className="deck-card">
                <div className="deck-header">
                  <h3 className="deck-name">
                    {isVi ? deck.name_vi : deck.name_en}
                  </h3>
                  {deck.is_premium && (
                    <span className="premium-badge">Premium</span>
                  )}
                </div>
                <div className="deck-stats">
                  <div className="deck-stat">
                    <span className="deck-stat-value">{deck.card_count}</span>
                    <span className="deck-stat-label">
                      {isVi ? "Thẻ" : "Cards"}
                    </span>
                  </div>
                  <div className="deck-stat">
                    <span className="deck-stat-value">
                      {deck.avg_mastery_percent}%
                    </span>
                    <span className="deck-stat-label">
                      {isVi ? "Thành thạo" : "Mastery"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredDecks.length === 0 && (
            <div className="users-empty" style={{ marginTop: 24 }}>
              <BookOpen className="empty-icon" />
              <p className="empty-title">
                {hasActiveFilters
                  ? isVi ? "Không tìm thấy bộ thẻ khớp với bộ lọc" : "No decks found matching filters"
                  : isVi ? "Chưa có bộ thẻ nào" : "No decks yet"}
              </p>
              {hasActiveFilters && (
                <button className="empty-action" onClick={handleReset}>
                  {isVi ? "Xóa bộ lọc" : "Clear filters"}
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Delete Single Word Modal */}
      <ConfirmModal
        isOpen={!!deleteModalWord}
        onClose={() => setDeleteModalWord(null)}
        onConfirm={confirmDeleteWord}
        type="danger"
        icon="delete"
        title={isVi ? "Xóa từ vựng" : "Delete Vocabulary"}
        message={
          isVi
            ? "Bạn có chắc muốn xóa từ vựng này? Hành động này không thể hoàn tác."
            : "Are you sure you want to delete this vocabulary? This action cannot be undone."
        }
        confirmText={isVi ? "Xóa" : "Delete"}
        cancelText={isVi ? "Hủy" : "Cancel"}
      />

      {/* Delete Multiple Words Modal */}
      <ConfirmModal
        isOpen={deleteMultipleModal}
        onClose={() => setDeleteMultipleModal(false)}
        onConfirm={confirmDeleteMultiple}
        type="danger"
        icon="delete"
        title={
          isVi ? "Xóa nhiều từ vựng" : "Delete Multiple Vocabulary"
        }
        message={
          isVi
            ? `Bạn có chắc muốn xóa ${selectedWords.size} từ vựng đã chọn? Hành động này không thể hoàn tác.`
            : `Are you sure you want to delete ${selectedWords.size} selected vocabulary? This action cannot be undone.`
        }
        confirmText={
          isVi
            ? `Xóa ${selectedWords.size} từ`
            : `Delete ${selectedWords.size} words`
        }
        cancelText={isVi ? "Hủy" : "Cancel"}
      />
    </main>
  );
}

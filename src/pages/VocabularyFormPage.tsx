// Updated: 2026-08-22
// Vocabulary Form Page - Trang tạo/chỉnh sửa từ vựng
// Đồng bộ với vocabulary-service.dbml - lexical_items, meanings, topics

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronLeft,
  Save,
  Plus,
  Trash2,
  Volume2,
  Star,
  GripVertical,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAdminStore } from "@/store/admin-store";
import {
  mockTopics,
  cefrLevelLabels,
  wordTypeLabels,
} from "@/data/vocabulary-data";

// Word types matching DB
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

// CEFR levels
const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

// Meaning interface matching meanings table
interface Meaning {
  id: string;
  part_of_speech: string;
  definition_en: string;
  definition_vi: string;
  short_meaning_vi: string;
  synonyms: string[];
  antonyms: string[];
  collocations: string[];
  examples: string[];
  cefr_level: string;
  domain: string;
  is_primary: boolean;
}

// Form data interface
interface VocabularyFormData {
  word: string;
  word_type: string;
  cefr_level: string;
  pronunciation_us: string;
  pronunciation_uk: string;
  syllables: number | null;
  stress_pattern: string;
  is_root_word: boolean;
  is_irregular: boolean;
  is_verified: boolean;
  topic_ids: string[];
  meanings: Meaning[];
}

// Form validation
interface FormErrors {
  word?: string;
  meanings?: string;
}

export function VocabularyFormPage({ editWordId }: { editWordId?: string }) {
  const { i18n } = useTranslation();
  const isVietnamese = i18n.language === "vi";
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem);
  const isEditing = !!editWordId;

  const [formData, setFormData] = useState<VocabularyFormData>({
    word: "",
    word_type: "NOUN",
    cefr_level: "B1",
    pronunciation_us: "",
    pronunciation_uk: "",
    syllables: null,
    stress_pattern: "",
    is_root_word: false,
    is_irregular: false,
    is_verified: false,
    topic_ids: [],
    meanings: [
      {
        id: "1",
        part_of_speech: "NOUN",
        definition_en: "",
        definition_vi: "",
        short_meaning_vi: "",
        synonyms: [],
        antonyms: [],
        collocations: [],
        examples: [],
        cefr_level: "B1",
        domain: "",
        is_primary: true,
      },
    ],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [expandedMeanings, setExpandedMeanings] = useState<string[]>(["1"]);
  const [synonymInputs, setSynonymInputs] = useState<Record<string, string>>(
    {}
  );
  const [collocationsInputs, setCollocationsInputs] = useState<
    Record<string, string>
  >({});
  const [exampleInputs, setExampleInputs] = useState<Record<string, string>>(
    {}
  );

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.word.trim()) {
      newErrors.word = isVietnamese
        ? "Từ vựng là bắt buộc"
        : "Word is required";
    }

    const hasValidMeaning = formData.meanings.some(
      (m) => m.definition_en.trim() || m.definition_vi.trim()
    );

    if (!hasValidMeaning) {
      newErrors.meanings = isVietnamese
        ? "Cần ít nhất một nghĩa"
        : "At least one meaning is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    console.log("Saving vocabulary:", formData);
    alert(
      isEditing
        ? isVietnamese
          ? "Đã cập nhật từ vựng!"
          : "Vocabulary updated!"
        : isVietnamese
        ? "Đã thêm từ vựng!"
        : "Vocabulary added!"
    );
    setActiveNavItem("vocabulary");
  };

  const addMeaning = () => {
    const newId = Date.now().toString();
    setFormData((prev) => ({
      ...prev,
      meanings: [
        ...prev.meanings,
        {
          id: newId,
          part_of_speech: "NOUN",
          definition_en: "",
          definition_vi: "",
          short_meaning_vi: "",
          synonyms: [],
          antonyms: [],
          collocations: [],
          examples: [],
          cefr_level: prev.cefr_level,
          domain: "",
          is_primary: prev.meanings.length === 0,
        },
      ],
    }));
    setExpandedMeanings((prev) => [...prev, newId]);
  };

  const removeMeaning = (id: string) => {
    if (formData.meanings.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      meanings: prev.meanings.filter((m) => m.id !== id),
    }));
    setExpandedMeanings((prev) => prev.filter((i) => i !== id));
  };

  const updateMeaning = (id: string, field: keyof Meaning, value: any) => {
    setFormData((prev) => ({
      ...prev,
      meanings: prev.meanings.map((m) =>
        m.id === id ? { ...m, [field]: value } : m
      ),
    }));
  };

  const toggleMeaningExpand = (id: string) => {
    setExpandedMeanings((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const addSynonym = (meaningId: string) => {
    const input = synonymInputs[meaningId];
    if (!input?.trim()) return;

    updateMeaning(meaningId, "synonyms", [
      ...formData.meanings.find((m) => m.id === meaningId)!.synonyms,
      input.trim(),
    ]);
    setSynonymInputs((prev) => ({ ...prev, [meaningId]: "" }));
  };

  const removeSynonym = (meaningId: string, index: number) => {
    const meaning = formData.meanings.find((m) => m.id === meaningId);
    if (!meaning) return;
    updateMeaning(
      meaningId,
      "synonyms",
      meaning.synonyms.filter((_, i) => i !== index)
    );
  };

  const addCollocations = (meaningId: string) => {
    const input = collocationsInputs[meaningId];
    if (!input?.trim()) return;

    updateMeaning(meaningId, "collocations", [
      ...formData.meanings.find((m) => m.id === meaningId)!.collocations,
      input.trim(),
    ]);
    setCollocationsInputs((prev) => ({ ...prev, [meaningId]: "" }));
  };

  const removeCollocations = (meaningId: string, index: number) => {
    const meaning = formData.meanings.find((m) => m.id === meaningId);
    if (!meaning) return;
    updateMeaning(
      meaningId,
      "collocations",
      meaning.collocations.filter((_, i) => i !== index)
    );
  };

  const addExample = (meaningId: string) => {
    const input = exampleInputs[meaningId];
    if (!input?.trim()) return;

    updateMeaning(meaningId, "examples", [
      ...formData.meanings.find((m) => m.id === meaningId)!.examples,
      input.trim(),
    ]);
    setExampleInputs((prev) => ({ ...prev, [meaningId]: "" }));
  };

  const removeExample = (meaningId: string, index: number) => {
    const meaning = formData.meanings.find((m) => m.id === meaningId);
    if (!meaning) return;
    updateMeaning(
      meaningId,
      "examples",
      meaning.examples.filter((_, i) => i !== index)
    );
  };

  const toggleTopic = (topicId: string) => {
    setFormData((prev) => ({
      ...prev,
      topic_ids: prev.topic_ids.includes(topicId)
        ? prev.topic_ids.filter((id) => id !== topicId)
        : [...prev.topic_ids, topicId],
    }));
  };

  const setPrimaryMeaning = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      meanings: prev.meanings.map((m) => ({
        ...m,
        is_primary: m.id === id,
      })),
    }));
  };

  return (
    <main className="page-content">
      {/* Header */}
      <div className="form-header">
        <button
          className="back-button"
          onClick={() => setActiveNavItem("vocabulary")}
        >
          <ChevronLeft />
          {isVietnamese ? "Quay lại" : "Back"}
        </button>
        <h1 className="form-title">
          {isEditing
            ? isVietnamese
              ? "Chỉnh sửa từ vựng"
              : "Edit Vocabulary"
            : isVietnamese
            ? "Thêm từ vựng mới"
            : "Add New Vocabulary"}
        </h1>
        <button className="primary-button" onClick={handleSave}>
          <Save />
          {isVietnamese ? "Lưu" : "Save"}
        </button>
      </div>

      <div className="vocab-form-content">
        {/* Basic Info Section */}
        <div className="vocab-form-section">
          <h2 className="section-title">
            {isVietnamese ? "Thông tin cơ bản" : "Basic Information"}
          </h2>

          <div className="form-grid-2">
            {/* Word */}
            <div className="form-group">
              <label className="form-label">
                {isVietnamese ? "Từ vựng" : "Word"}{" "}
                <span className="required">*</span>
              </label>
              <input
                type="text"
                className={`form-input ${errors.word ? "error" : ""}`}
                placeholder="e.g., accomplish"
                value={formData.word}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, word: e.target.value }));
                  if (errors.word) setErrors((prev) => ({ ...prev, word: "" }));
                }}
              />
              {errors.word && (
                <span className="error-message">{errors.word}</span>
              )}
            </div>

            {/* Word Type */}
            <div className="form-group">
              <label className="form-label">
                {isVietnamese ? "Loại từ" : "Word Type"}
              </label>
              <select
                className="form-select"
                value={formData.word_type}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    word_type: e.target.value,
                  }))
                }
              >
                {WORD_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {wordTypeLabels[type]?.[isVietnamese ? "vi" : "en"] || type}
                  </option>
                ))}
              </select>
            </div>

            {/* CEFR Level */}
            <div className="form-group">
              <label className="form-label">
                {isVietnamese ? "Cấp độ CEFR" : "CEFR Level"}
              </label>
              <select
                className="form-select"
                value={formData.cefr_level}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    cefr_level: e.target.value,
                  }))
                }
              >
                {CEFR_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {cefrLevelLabels[level]?.[isVietnamese ? "vi" : "en"] ||
                      level}
                  </option>
                ))}
              </select>
            </div>

            {/* Syllables */}
            <div className="form-group">
              <label className="form-label">
                {isVietnamese ? "Số âm tiết" : "Syllables"}
              </label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g., 3"
                min="1"
                value={formData.syllables || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    syllables: e.target.value ? parseInt(e.target.value) : null,
                  }))
                }
              />
            </div>

            {/* Pronunciation US */}
            <div className="form-group">
              <label className="form-label">
                {isVietnamese
                  ? "Audio phát âm (US)"
                  : "Audio Pronunciation (US)"}
              </label>
              <div className="audio-upload-group">
                <input
                  type="text"
                  className="form-input"
                  placeholder="/əˈkʌm.plɪʃ/ (IPA)"
                  value={formData.pronunciation_us}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      pronunciation_us: e.target.value,
                    }))
                  }
                />
                <label className="audio-upload-btn">
                  <input
                    type="file"
                    accept="audio/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        console.log("US Audio file:", file.name);
                      }
                    }}
                  />
                  <Volume2 />
                  {isVietnamese ? "Upload audio" : "Upload audio"}
                </label>
              </div>
            </div>

            {/* Pronunciation UK */}
            <div className="form-group">
              <label className="form-label">
                {isVietnamese
                  ? "Audio phát âm (UK)"
                  : "Audio Pronunciation (UK)"}
              </label>
              <div className="audio-upload-group">
                <input
                  type="text"
                  className="form-input"
                  placeholder="/əˈkʌm.plɪʃ/ (IPA)"
                  value={formData.pronunciation_uk}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      pronunciation_uk: e.target.value,
                    }))
                  }
                />
                <label className="audio-upload-btn">
                  <input
                    type="file"
                    accept="audio/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        console.log("UK Audio file:", file.name);
                      }
                    }}
                  />
                  {isVietnamese ? "Upload audio" : "Upload audio"}
                </label>
              </div>
            </div>

            {/* Stress Pattern */}
            <div className="form-group">
              <label className="form-label">
                {isVietnamese ? "Trọng âm" : "Stress Pattern"}
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., 1-2-3"
                value={formData.stress_pattern}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    stress_pattern: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="form-checkboxes">
            <label className="form-checkbox">
              <input
                type="checkbox"
                checked={formData.is_root_word}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    is_root_word: e.target.checked,
                  }))
                }
              />
              <span>{isVietnamese ? "Từ gốc" : "Root Word"}</span>
            </label>
            <label className="form-checkbox">
              <input
                type="checkbox"
                checked={formData.is_irregular}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    is_irregular: e.target.checked,
                  }))
                }
              />
              <span>{isVietnamese ? "Bất quy tắc" : "Irregular"}</span>
            </label>
            <label className="form-checkbox">
              <input
                type="checkbox"
                checked={formData.is_verified}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    is_verified: e.target.checked,
                  }))
                }
              />
              <span>{isVietnamese ? "Đã xác minh" : "Verified"}</span>
            </label>
          </div>
        </div>

        {/* Meanings Section */}
        <div className="vocab-form-section">
          <div className="section-header">
            <h2 className="section-title">
              {isVietnamese ? "Nghĩa & Định nghĩa" : "Meanings & Definitions"}
            </h2>
            <button className="primary-button" onClick={addMeaning}>
              <Plus /> {isVietnamese ? "Thêm nghĩa" : "Add Meaning"}
            </button>
          </div>

          {errors.meanings && (
            <div className="error-message" style={{ marginBottom: 16 }}>
              {errors.meanings}
            </div>
          )}

          <div className="meanings-list">
            {formData.meanings.map((meaning, index) => (
              <div key={meaning.id} className="meaning-card">
                <div className="meaning-header">
                  <div className="meaning-drag">
                    <GripVertical />
                  </div>
                  <div className="meaning-title">
                    <span className="meaning-number">#{index + 1}</span>
                    <span className="meaning-pos">
                      {wordTypeLabels[meaning.part_of_speech]?.[
                        isVietnamese ? "vi" : "en"
                      ] || meaning.part_of_speech}
                    </span>
                    {meaning.is_primary && (
                      <span className="primary-badge">
                        <Star /> {isVietnamese ? "Chính" : "Primary"}
                      </span>
                    )}
                  </div>
                  <div className="meaning-actions">
                    {!meaning.is_primary && (
                      <button
                        className="btn-text"
                        onClick={() => setPrimaryMeaning(meaning.id)}
                        title={
                          isVietnamese
                            ? "Đặt làm nghĩa chính"
                            : "Set as primary"
                        }
                      >
                        <Star />
                      </button>
                    )}
                    <button
                      className="btn-text"
                      onClick={() => toggleMeaningExpand(meaning.id)}
                    >
                      {expandedMeanings.includes(meaning.id) ? (
                        <ChevronUp />
                      ) : (
                        <ChevronDown />
                      )}
                    </button>
                    {formData.meanings.length > 1 && (
                      <button
                        className="btn-text danger"
                        onClick={() => removeMeaning(meaning.id)}
                      >
                        <Trash2 />
                      </button>
                    )}
                  </div>
                </div>

                {expandedMeanings.includes(meaning.id) && (
                  <div className="meaning-body">
                    <div className="form-grid-2">
                      {/* Part of Speech */}
                      <div className="form-group">
                        <label className="form-label">
                          {isVietnamese ? "Loại từ" : "Part of Speech"}
                        </label>
                        <select
                          className="form-select"
                          value={meaning.part_of_speech}
                          onChange={(e) =>
                            updateMeaning(
                              meaning.id,
                              "part_of_speech",
                              e.target.value
                            )
                          }
                        >
                          {WORD_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {wordTypeLabels[type]?.[
                                isVietnamese ? "vi" : "en"
                              ] || type}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* CEFR Level */}
                      <div className="form-group">
                        <label className="form-label">
                          {isVietnamese ? "Cấp độ CEFR" : "CEFR Level"}
                        </label>
                        <select
                          className="form-select"
                          value={meaning.cefr_level}
                          onChange={(e) =>
                            updateMeaning(
                              meaning.id,
                              "cefr_level",
                              e.target.value
                            )
                          }
                        >
                          {CEFR_LEVELS.map((level) => (
                            <option key={level} value={level}>
                              {level}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Definition EN */}
                      <div className="form-group full-width">
                        <label className="form-label">
                          {isVietnamese ? "Định nghĩa (EN)" : "Definition (EN)"}
                        </label>
                        <textarea
                          className="form-textarea"
                          placeholder={
                            isVietnamese
                              ? "Nhập định nghĩa tiếng Anh..."
                              : "Enter English definition..."
                          }
                          rows={2}
                          value={meaning.definition_en}
                          onChange={(e) =>
                            updateMeaning(
                              meaning.id,
                              "definition_en",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      {/* Definition VI */}
                      <div className="form-group full-width">
                        <label className="form-label">
                          {isVietnamese ? "Định nghĩa (VI)" : "Definition (VI)"}
                        </label>
                        <textarea
                          className="form-textarea"
                          placeholder={
                            isVietnamese
                              ? "Nhập định nghĩa tiếng Việt..."
                              : "Enter Vietnamese definition..."
                          }
                          rows={2}
                          value={meaning.definition_vi}
                          onChange={(e) =>
                            updateMeaning(
                              meaning.id,
                              "definition_vi",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      {/* Short Meaning */}
                      <div className="form-group">
                        <label className="form-label">
                          {isVietnamese ? "Nghĩa ngắn" : "Short Meaning"}
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder={
                            isVietnamese
                              ? "VD: hoàn thành"
                              : "e.g., to complete"
                          }
                          value={meaning.short_meaning_vi}
                          onChange={(e) =>
                            updateMeaning(
                              meaning.id,
                              "short_meaning_vi",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      {/* Domain */}
                      <div className="form-group">
                        <label className="form-label">
                          {isVietnamese ? "Lĩnh vực" : "Domain"}
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder={
                            isVietnamese ? "VD: Kinh doanh" : "e.g., Business"
                          }
                          value={meaning.domain}
                          onChange={(e) =>
                            updateMeaning(meaning.id, "domain", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    {/* Synonyms */}
                    <div className="meaning-sub-section">
                      <label className="form-label">
                        {isVietnamese ? "Từ đồng nghĩa" : "Synonyms"}
                      </label>
                      <div className="tag-input-row">
                        <input
                          type="text"
                          className="form-input"
                          placeholder={
                            isVietnamese
                              ? "Thêm từ đồng nghĩa..."
                              : "Add synonym..."
                          }
                          value={synonymInputs[meaning.id] || ""}
                          onChange={(e) =>
                            setSynonymInputs((prev) => ({
                              ...prev,
                              [meaning.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), addSynonym(meaning.id))
                          }
                        />
                        <button
                          className="btn-add"
                          onClick={() => addSynonym(meaning.id)}
                        >
                          <Plus />
                        </button>
                      </div>
                      <div className="tags-list">
                        {meaning.synonyms.map((syn, i) => (
                          <span key={i} className="tag">
                            {syn}
                            <button
                              onClick={() => removeSynonym(meaning.id, i)}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Collocations */}
                    <div className="meaning-sub-section">
                      <label className="form-label">
                        {isVietnamese ? "Cụm từ đi kèm" : "Collocations"}
                      </label>
                      <div className="tag-input-row">
                        <input
                          type="text"
                          className="form-input"
                          placeholder={
                            isVietnamese
                              ? "Thêm cụm từ..."
                              : "Add collocation..."
                          }
                          value={collocationsInputs[meaning.id] || ""}
                          onChange={(e) =>
                            setCollocationsInputs((prev) => ({
                              ...prev,
                              [meaning.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), addCollocations(meaning.id))
                          }
                        />
                        <button
                          className="btn-add"
                          onClick={() => addCollocations(meaning.id)}
                        >
                          <Plus />
                        </button>
                      </div>
                      <div className="tags-list">
                        {meaning.collocations.map((col, i) => (
                          <span key={i} className="tag">
                            {col}
                            <button
                              onClick={() => removeCollocations(meaning.id, i)}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Examples */}
                    <div className="meaning-sub-section">
                      <label className="form-label">
                        {isVietnamese ? "Ví dụ" : "Examples"}
                      </label>
                      <div className="tag-input-row">
                        <input
                          type="text"
                          className="form-input"
                          placeholder={
                            isVietnamese
                              ? "Thêm câu ví dụ..."
                              : "Add example sentence..."
                          }
                          value={exampleInputs[meaning.id] || ""}
                          onChange={(e) =>
                            setExampleInputs((prev) => ({
                              ...prev,
                              [meaning.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), addExample(meaning.id))
                          }
                        />
                        <button
                          className="btn-add"
                          onClick={() => addExample(meaning.id)}
                        >
                          <Plus />
                        </button>
                      </div>
                      <div className="examples-list">
                        {meaning.examples.map((ex, i) => (
                          <div key={i} className="example-item">
                            <span>{ex}</span>
                            <button
                              className="btn-icon-sm"
                              onClick={() => removeExample(meaning.id, i)}
                            >
                              <Trash2 />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Topics Section */}
        <div className="vocab-form-section">
          <h2 className="section-title">
            {isVietnamese ? "Chủ đề" : "Topics"}
          </h2>
          <div className="topics-grid">
            {mockTopics
              .filter((t) => t.status === "ACTIVE")
              .map((topic) => (
                <label key={topic.id} className="topic-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.topic_ids.includes(topic.id)}
                    onChange={() => toggleTopic(topic.id)}
                  />
                  <span className="topic-name">
                    {isVietnamese ? topic.name_vi : topic.name_en}
                  </span>
                  <span className="topic-count">
                    {topic.lexical_count} {isVietnamese ? "từ" : "words"}
                  </span>
                </label>
              ))}
          </div>
        </div>
      </div>
    </main>
  );
}

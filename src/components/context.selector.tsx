/**
 * @file context.selector.tsx
 * @description Component chọn Practice Context - dropdown đơn giản, hiển thị hierarchical
 */

import { useState, useMemo, useRef, useEffect } from "react";
import { ChevronDown, X, Search, Check } from "lucide-react";
import { usePracticeContexts } from "@/features/practice/hooks/use.practice.contexts";

interface ContextSelectorProps {
  value?: string | null;
  onChange: (contextId: string | null) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export function ContextSelector({
  value,
  onChange,
  disabled = false,
  className = "",
  placeholder = "Chọn ngữ cảnh...",
}: ContextSelectorProps) {
  const { contexts, isLoading } = usePracticeContexts();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedL0, setExpandedL0] = useState<string | null>(null);
  const [expandedL1, setExpandedL1] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Group contexts
  const level0Contexts = useMemo(
    () => contexts.filter((c) => c.level === 0),
    [contexts]
  );
  const level1Contexts = useMemo(
    () => contexts.filter((c) => c.level === 1),
    [contexts]
  );
  const level2Contexts = useMemo(
    () => contexts.filter((c) => c.level === 2),
    [contexts]
  );

  // Find selected context
  const selectedContext = useMemo(() => {
    if (!value) return null;
    return contexts.find((c) => c._id === value);
  }, [value, contexts]);

  // Build breadcrumb for selected
  const breadcrumb = useMemo(() => {
    if (!selectedContext) return [];
    const parts: string[] = [];

    if (selectedContext.level === 2) {
      const l1 = level1Contexts.find(
        (c) => c._id === selectedContext.parent_id
      );
      if (l1) {
        const l0 = level0Contexts.find((c) => c._id === l1.parent_id);
        if (l0) parts.push(l0.name);
        parts.push(l1.name);
      }
      parts.push(selectedContext.name);
    } else if (selectedContext.level === 1) {
      const l0 = level0Contexts.find(
        (c) => c._id === selectedContext.parent_id
      );
      if (l0) parts.push(l0.name);
      parts.push(selectedContext.name);
    } else {
      parts.push(selectedContext.name);
    }
    return parts;
  }, [selectedContext, level0Contexts, level1Contexts]);

  // Get children
  const getLevel1Children = (parentId: string) =>
    level1Contexts.filter((c) => c.parent_id === parentId);
  const getLevel2Children = (parentId: string) =>
    level2Contexts.filter((c) => c.parent_id === parentId);

  // Filter
  const filteredLevel0 = useMemo(() => {
    if (!searchTerm) return level0Contexts;
    const term = searchTerm.toLowerCase();
    return level0Contexts.filter(
      (l0) =>
        l0.name.toLowerCase().includes(term) ||
        l0.name_vi?.toLowerCase().includes(term) ||
        getLevel1Children(l0._id).some(
          (l1) =>
            l1.name.toLowerCase().includes(term) ||
            l1.name_vi?.toLowerCase().includes(term) ||
            getLevel2Children(l1._id).some(
              (l2) =>
                l2.name.toLowerCase().includes(term) ||
                l2.name_vi?.toLowerCase().includes(term)
            )
        )
    );
  }, [searchTerm, level0Contexts, level1Contexts, level2Contexts]);

  // Auto-expand based on selection
  useEffect(() => {
    if (selectedContext && !isOpen) {
      if (selectedContext.level === 2) {
        // Khi chọn Level 2, expand cả L0, L1, L2
        const l1 = level1Contexts.find(
          (c) => c._id === selectedContext.parent_id
        );
        if (l1) {
          const l0 = level0Contexts.find((c) => c._id === l1.parent_id);
          if (l0) {
            setExpandedL0(l0._id);
            setExpandedL1(l1._id);
          }
        }
      } else if (selectedContext.level === 1) {
        // Khi chọn Level 1, chỉ expand L0 và L1, KHÔNG expand L2
        const l0 = level0Contexts.find(
          (c) => c._id === selectedContext.parent_id
        );
        if (l0) {
          setExpandedL0(l0._id);
          setExpandedL1(null); // Không expand L2 khi chỉ chọn L1
        }
      }
    }
  }, [selectedContext, isOpen, level0Contexts, level1Contexts]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedL0("");
    setExpandedL1("");
    onChange(null);
  };

  const displayText = useMemo(() => {
    if (!selectedContext) return placeholder;
    return breadcrumb.join(" › ");
  }, [selectedContext, breadcrumb, placeholder]);

  if (isLoading) {
    return (
      <div
        className={`h-8 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg ${className}`}
      />
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full h-8 px-3 flex items-center justify-between rounded-lg border text-xs font-medium transition-all ${
          disabled
            ? "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-50 cursor-not-allowed"
            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 cursor-pointer"
        } ${isOpen ? "border-indigo-500 ring-2 ring-indigo-500/20" : ""}`}
      >
        <span
          className={`truncate ${
            selectedContext
              ? "text-slate-800 dark:text-slate-200"
              : "text-slate-400"
          }`}
        >
          {displayText}
        </span>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {value && !disabled && (
            <X
              className="w-3.5 h-3.5 text-slate-400 hover:text-rose-500"
              onClick={handleClear}
            />
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm ngữ cảnh..."
                className="w-full h-8 pl-8 pr-3 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                autoFocus
              />
            </div>
          </div>

          {/* Options - Tree View */}
          <div className="max-h-64 overflow-y-auto p-1">
            {filteredLevel0.map((l0) => {
              const l1Children = getLevel1Children(l0._id);
              const isExpandedL0 = expandedL0 === l0._id;

              return (
                <div key={l0._id}>
                  {/* Level 0 */}
                  <button
                    type="button"
                    onClick={() => {
                      setExpandedL0(isExpandedL0 ? null : l0._id);
                      setExpandedL1(null);
                    }}
                    className={`w-full px-2 py-1.5 text-left text-xs rounded-lg flex items-center gap-2 transition-colors ${
                      selectedContext?._id === l0._id
                        ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <ChevronDown
                      className={`w-3 h-3 shrink-0 transition-transform ${
                        isExpandedL0 ? "rotate-90" : ""
                      }`}
                    />
                    <span className="font-medium">{l0.name}</span>
                    {selectedContext?._id === l0._id && (
                      <Check className="w-3 h-3 ml-auto text-indigo-500" />
                    )}
                  </button>

                  {/* Level 1 */}
                  {isExpandedL0 &&
                    l1Children.map((l1) => {
                      const l2Children = getLevel2Children(l1._id);
                      const isExpandedL1 = expandedL1 === l1._id;
                      const isSelected = selectedContext?._id === l1._id;

                      return (
                        <div key={l1._id} className="ml-4">
                          {/* Level 1 - Click để chọn, icon chevron để expand */}
                          <div className="flex items-center">
                            <button
                              type="button"
                              onClick={() => {
                                onChange(l1._id);
                                setIsOpen(false);
                              }}
                              className={`flex-1 px-2 py-1 text-left text-[11px] rounded-lg flex items-center gap-2 transition-colors ${
                                isSelected
                                  ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold"
                                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                              }`}
                            >
                              <span>{l1.name}</span>
                              {isSelected && (
                                <Check className="w-2.5 h-2.5 ml-auto text-indigo-500" />
                              )}
                            </button>
                            {/* Chevron để expand Level 2 */}
                            {l2Children.length > 0 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedL1(isExpandedL1 ? null : l1._id);
                                }}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                              >
                                <ChevronDown
                                  className={`w-2.5 h-2.5 text-slate-400 transition-transform ${
                                    isExpandedL1 ? "rotate-90" : ""
                                  }`}
                                />
                              </button>
                            )}
                          </div>

                          {/* Level 2 */}
                          {isExpandedL1 &&
                            l2Children.map((l2) => (
                              <button
                                key={l2._id}
                                type="button"
                                onClick={() => {
                                  onChange(l2._id);
                                  setIsOpen(false);
                                }}
                                className={`w-full ml-4 px-2 py-0.5 text-left text-[10px] rounded-lg flex items-center gap-2 transition-colors ${
                                  value === l2._id
                                    ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-semibold"
                                    : "text-slate-500 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                                }`}
                              >
                                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0" />
                                <span>{l2.name}</span>
                                {value === l2._id && (
                                  <Check className="w-2.5 h-2.5 ml-auto text-indigo-500" />
                                )}
                              </button>
                            ))}
                        </div>
                      );
                    })}
                </div>
              );
            })}

            {filteredLevel0.length === 0 && (
              <div className="py-4 text-center text-xs text-slate-400">
                Không tìm thấy ngữ cảnh phù hợp
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

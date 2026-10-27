import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api.client';
export interface CourseAssessmentConfig {
  comparison_group?: string;
  measurement_profile_id?: string;
  speaking?: {
    exercise_type?: string;
    grading_standard?: string;
    cefr_level?: string;
  };
  writing?: {
    exercise_type?: string;
    grading_standard?: string;
    writing_level?: string;
    min_words?: number;
    max_words?: number;
    task_requirements?: string[];
    keywords?: string[];
    image_description?: string;
  };
  weights?: Record<string, number>;
  minimum_scores?: Record<string, number>;
}

export function CourseAssessmentConfigFields({
  value = {},
  onChange,
}: {
  value?: CourseAssessmentConfig;
  onChange: (value: CourseAssessmentConfig) => void;
}) {
  const profiles = useQuery({ queryKey: ['measurement-profiles'], queryFn: () => api.get<Array<{ _id: string; name: string; version: string; comparison_group: string }>>('/progress/measurement-profiles') });
  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-900";
  const speakingTypes = [
    ["OPINION_RESPONSE", "Nêu quan điểm"],
    ["READ_ALOUD", "Đọc thành tiếng"],
    ["DESCRIBE_PICTURE", "Mô tả tranh"],
    ["ANSWER_QUESTION", "Trả lời câu hỏi"],
    ["RESPOND_USING_INFORMATION", "Trả lời theo thông tin cho sẵn"],
  ];
  const writingTypes = [
    ["EXPRESS_OPINION", "Viết bài nêu quan điểm"],
    ["WRITE_EMAIL", "Trả lời email"],
    ["DESCRIBE_PICTURE", "Viết câu theo tranh"],
    ["SENTENCE_COMPLETION", "Hoàn thành câu"],
  ];
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
      <p className="text-xs font-semibold">Cấu hình đánh giá Nói / Viết</p>
      <label className="block text-xs">Nhóm đề tương đương để đo tiến bộ
        <input className={inputClass} value={value.comparison_group || ''} onChange={event => onChange({ ...value, comparison_group: event.target.value })} placeholder="Chỉ dùng cùng mã khi cấu trúc, độ khó và điều kiện làm bài tương đương" />
      </label>
      <label className="block text-xs">Hiệu chuẩn ước tính TOEIC
        <select className={inputClass} value={value.measurement_profile_id || ''} onChange={event => { const selected = profiles.data?.find(profile => profile._id === event.target.value); onChange({ ...value, measurement_profile_id: event.target.value || undefined, comparison_group: selected?.comparison_group || value.comparison_group }) }}>
          <option value="">Chỉ theo dõi điểm nội bộ; chưa có hiệu chuẩn</option>
          {profiles.data?.map(profile => <option key={profile._id} value={profile._id}>{profile.name} · {profile.version}</option>)}
        </select>
      </label>
      <p className="text-xs text-slate-500">Hiệu chuẩn chỉ áp dụng nếu khớp cấu trúc, thời lượng và rubric của bài. Mỗi phiên thi giữ nguyên phiên bản đã chọn.</p>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-xs">
            Dạng Speaking
            <select
              className={inputClass}
              value={value.speaking?.exercise_type || "OPINION_RESPONSE"}
              onChange={(e) =>
                onChange({
                  ...value,
                  speaking: {
                    ...value.speaking,
                    exercise_type: e.target.value,
                  },
                })
              }
            >
              {speakingTypes.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs">
            Chuẩn chấm Speaking
            <select
              className={inputClass}
              value={value.speaking?.grading_standard || "PRACTICAL"}
              onChange={(e) =>
                onChange({
                  ...value,
                  speaking: {
                    ...value.speaking,
                    grading_standard: e.target.value,
                  },
                })
              }
            >
              <option value="PRACTICAL">Luyện tập thực tế (0–100)</option>
              <option value="TOEIC">
                Tham chiếu rubric TOEIC theo nhiệm vụ
              </option>
            </select>
          </label>
          <label className="block text-xs">
            Trình độ mục tiêu
            <select
              className={inputClass}
              value={value.speaking?.cefr_level || "B1"}
              onChange={(e) =>
                onChange({
                  ...value,
                  speaking: { ...value.speaking, cefr_level: e.target.value },
                })
              }
            >
              {["A1", "A2", "B1", "B2", "C1", "C2"].map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="space-y-2">
          <label className="block text-xs">
            Dạng Writing
            <select
              className={inputClass}
              value={value.writing?.exercise_type || "EXPRESS_OPINION"}
              onChange={(e) =>
                onChange({
                  ...value,
                  writing: {
                    ...value.writing,
                    exercise_type: e.target.value,
                    ...(e.target.value === "SENTENCE_COMPLETION"
                      ? { grading_standard: "PRACTICAL" }
                      : {}),
                  },
                })
              }
            >
              {writingTypes.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs">
            Chuẩn chấm Writing
            <select
              className={inputClass}
              value={value.writing?.grading_standard || "PRACTICAL"}
              onChange={(e) =>
                onChange({
                  ...value,
                  writing: {
                    ...value.writing,
                    grading_standard: e.target.value,
                  },
                })
              }
            >
              <option value="PRACTICAL">Luyện tập thực tế (0–100)</option>
              <option
                value="TOEIC"
                disabled={
                  value.writing?.exercise_type === "SENTENCE_COMPLETION"
                }
              >
                Tham chiếu rubric TOEIC theo nhiệm vụ
              </option>
            </select>
          </label>
          <label className="block text-xs">
            Trình độ mục tiêu
            <select
              className={inputClass}
              value={value.writing?.writing_level || "B1"}
              onChange={(e) =>
                onChange({
                  ...value,
                  writing: { ...value.writing, writing_level: e.target.value },
                })
              }
            >
              {["A1", "A2", "B1", "B2", "C1", "C2"].map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(["min_words", "max_words"] as const).map((field) => (
              <label key={field} className="text-xs">
                {field === "min_words" ? "Số từ tối thiểu" : "Số từ tối đa"}
                <input
                  className={inputClass}
                  type="number"
                  min={0}
                  max={10000}
                  value={value.writing?.[field] ?? ""}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      writing: {
                        ...value.writing,
                        [field]:
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                      },
                    })
                  }
                />
              </label>
            ))}
          </div>
          <label className="block text-xs">
            Yêu cầu nội dung Writing (mỗi dòng một ý)
            <textarea
              className={inputClass}
              value={value.writing?.task_requirements?.join("\n") || ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  writing: {
                    ...value.writing,
                    task_requirements: e.target.value.split("\n"),
                  },
                })
              }
              onBlur={() =>
                onChange({
                  ...value,
                  writing: {
                    ...value.writing,
                    task_requirements: value.writing?.task_requirements
                      ?.map((x) => x.trim())
                      .filter(Boolean),
                  },
                })
              }
            />
          </label>
          <label className="block text-xs">
            Từ khóa bắt buộc (phân cách bằng dấu phẩy)
            <input
              className={inputClass}
              value={value.writing?.keywords?.join(",") || ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  writing: {
                    ...value.writing,
                    keywords: e.target.value.split(","),
                  },
                })
              }
              onBlur={() =>
                onChange({
                  ...value,
                  writing: {
                    ...value.writing,
                    keywords: value.writing?.keywords
                      ?.map((x) => x.trim())
                      .filter(Boolean),
                  },
                })
              }
            />
          </label>
          <label className="block text-xs">
            Mô tả nội dung tranh dùng để đối chiếu (nếu có)
            <textarea
              className={inputClass}
              value={value.writing?.image_description || ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  writing: {
                    ...value.writing,
                    image_description: e.target.value,
                  },
                })
              }
            />
          </label>
        </div>
      </div>
      <p className="text-xs text-slate-500">
        Mỗi kỹ năng có trọng số bằng nhau theo mặc định. Điểm tổng là đánh giá
        nội bộ khóa học. Với bài Nghe/Đọc, cần phân loại kỹ năng cho từng câu
        hỏi.
      </p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {["LISTENING", "READING", "SPEAKING", "WRITING"].map((skill) => (
          <div key={skill} className="space-y-2">
            <p className="text-xs font-semibold">{skill}</p>
            <label className="block text-xs">
              Trọng số
              <input
                className={inputClass}
                type="number"
                min={1}
                max={100}
                value={value.weights?.[skill] ?? 25}
                onChange={(e) =>
                  onChange({
                    ...value,
                    weights: {
                      LISTENING: 25,
                      READING: 25,
                      SPEAKING: 25,
                      WRITING: 25,
                      ...value.weights,
                      [skill]: Number(e.target.value),
                    },
                  })
                }
              />
            </label>
            <label className="block text-xs">
              Điểm tối thiểu
              <input
                className={inputClass}
                type="number"
                min={0}
                max={100}
                value={value.minimum_scores?.[skill] ?? 0}
                onChange={(e) =>
                  onChange({
                    ...value,
                    minimum_scores: {
                      ...value.minimum_scores,
                      [skill]: Number(e.target.value),
                    },
                  })
                }
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

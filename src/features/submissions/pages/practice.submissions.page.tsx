import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileCheck2, RefreshCw, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { resolveMediaUrl } from "@/features/media/utils/media.utils";
import { toast } from "@/store/toast.store";
import { api } from "@/services/api.client";
import {
  practiceReviewService,
  type PracticeSkill,
  type PracticeSubmission,
} from "../services/practice.review.service";

const scoreLabel = (item: PracticeSubmission, ai = false) => {
  const toeic = item.grading_standard === "TOEIC";
  const value = toeic
    ? ai
      ? item.original_ai_raw_score
      : item.raw_score
    : ai
    ? item.ai_score
    : item.overall_score;
  return typeof value === "number"
    ? `${value}/${toeic ? item.max_score : 100}`
    : "Chưa có điểm";
};
function PracticeMedia({
  value,
  image = false,
}: {
  value: string;
  image?: boolean;
}) {
  const isId = /^[a-f\d]{24}$/i.test(value);
  const query = useQuery({
    queryKey: ["practice-review-media", value],
    enabled: isId,
    queryFn: () =>
      api.get<{ storage_key?: string; file_path?: string }>(`/media/${value}`),
  });
  const key = isId
    ? query.data?.storage_key || query.data?.file_path || ""
    : value;
  const source = /^data:(audio|image)\//.test(key) ? key : resolveMediaUrl(key);
  if (isId && query.isPending) return <p>Đang tải tệp…</p>;
  if (!source || query.isError)
    return <p className="text-red-600">Không tải được tệp gốc để đối chiếu.</p>;
  return image ? (
    <img
      src={source}
      alt="Hình ảnh của đề bài gốc"
      className="max-h-80 rounded-xl"
    />
  ) : (
    <audio controls src={source} className="w-full" />
  );
}
export function PracticeSpeakingSubmissionsPage() {
  return <PracticeSubmissionsPage skill="SPEAKING" />;
}
export function PracticeWritingSubmissionsPage() {
  return <PracticeSubmissionsPage skill="WRITING" />;
}

function PracticeSubmissionsPage({ skill }: { skill: PracticeSkill }) {
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["practice-submissions", skill, status, search, page],
    queryFn: () =>
      practiceReviewService.list(skill, { status, search, page, limit: 20 }),
  });
  const retry = useMutation({
    mutationFn: (id: string) => practiceReviewService.retry(skill, id),
    onSuccess: () => {
      toast.success("Đã chấm lại bài luyện tập");
      void client.invalidateQueries({ queryKey: ["practice-submissions"] });
    },
    onError: (error: Error) =>
      toast.error(
        error.message || "Chưa chấm được, bài vẫn được giữ để thử lại",
      ),
  });
  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <FileCheck2 /> Chấm điểm & Phúc khảo — Luyện tập{" "}
          {skill === "SPEAKING" ? "Speaking" : "Writing"}
        </h1>
        <p className="text-sm text-slate-500">
          Ưu tiên yêu cầu phúc khảo chưa giải quyết, theo thứ tự gửi trước. Các
          bài còn lại có thể được giáo viên kiểm tra chủ động.
        </p>
        <nav className="flex flex-wrap gap-3 text-sm">
          <Link
            className={skill === "SPEAKING" ? "font-bold text-indigo-600" : ""}
            to="/submissions/practice/speaking"
          >
            Luyện tập Speaking
          </Link>
          <Link
            className={skill === "WRITING" ? "font-bold text-indigo-600" : ""}
            to="/submissions/practice/writing"
          >
            Luyện tập Writing
          </Link>
          <Link to="/submissions/courses">Bài kiểm tra khóa học</Link>
        </nav>
      </header>
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <span>
          Tìm thấy: <strong>{query.data?.total ?? "—"}</strong>
        </span>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-900">
          Yêu cầu phúc khảo: {query.data?.pending ?? "—"}
        </span>
        <input
          aria-label="Tìm bài luyện tập"
          placeholder="Mã học viên hoặc tên bài"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-300 bg-transparent p-2 text-sm"
        />
        <select
          aria-label="Trạng thái bài luyện tập"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-300 bg-transparent p-2 text-sm"
        >
          <option value="ALL">Tất cả bài có điểm</option>
          <option value="REQUESTED">Yêu cầu phúc khảo</option>
          <option value="RESOLVED">Đã được giáo viên kiểm tra</option>
          <option value="NONE">Chưa kiểm tra</option>
          {isAdmin && (
            <option value="FAILED">Bài chưa chấm xong / chấm lỗi</option>
          )}
        </select>
        <button
          aria-label="Làm mới bài luyện tập"
          onClick={() => void query.refetch()}
        >
          <RefreshCw size={18} />
        </button>
      </div>
      {query.isError && (
        <p role="alert" className="text-red-600">
          {query.error.message}
        </p>
      )}
      {query.isPending ? (
        <p>Đang tải bài luyện tập…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800">
                <th className="p-3">Học viên / bài</th>
                <th>Điểm AI</th>
                <th>Điểm hiện tại</th>
                <th>Trạng thái</th>
                <th className="p-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {query.data?.items.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-slate-200 dark:border-slate-800"
                >
                  <td className="p-3">
                    <p className="font-semibold">{item.user_id}</p>
                    <p>{item.title}</p>
                    <small>
                      {item.exercise_type} · {item.grading_version}
                    </small>
                  </td>
                  <td>{scoreLabel(item, true)}</td>
                  <td>{scoreLabel(item)}</td>
                  <td>
                    {item.review?.status === "REQUESTED" ? (
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-900">
                        Yêu cầu phúc khảo
                      </span>
                    ) : item.review?.status === "RESOLVED" ? (
                      "Đã kiểm tra"
                    ) : item.record_type === "GRADING_REQUEST" ? (
                      <span>
                        {item.status}
                        <br />
                        {item.error}
                      </span>
                    ) : (
                      "AI đã chấm"
                    )}
                  </td>
                  <td className="p-3">
                    {item.record_type === "GRADING_REQUEST" ? (
                      <button
                        disabled={retry.isPending}
                        onClick={() => retry.mutate(item.id)}
                        className="rounded-lg bg-indigo-600 px-3 py-2 text-white disabled:opacity-50"
                      >
                        Thử chấm lại
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelected(item.id)}
                        className="rounded-lg bg-indigo-600 px-3 py-2 text-white"
                      >
                        Xem & chấm bài
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!query.isError && !query.data?.items.length && (
            <p className="p-6 text-center text-slate-500">
              Không có bài luyện tập phù hợp bộ lọc.
            </p>
          )}
        </div>
      )}
      <div className="flex items-center justify-end gap-3 text-sm">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Trang trước
        </button>
        <span>Trang {page}</span>
        <button
          disabled={!query.data || page * 20 >= query.data.total}
          onClick={() => setPage(page + 1)}
        >
          Trang sau
        </button>
      </div>
      {selected && (
        <PracticeReviewDetail
          key={selected}
          id={selected}
          skill={skill}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function PracticeReviewDetail({
  skill,
  id,
  onClose,
}: {
  skill: PracticeSkill;
  id: string;
  onClose: () => void;
}) {
  const query = useQuery({
    queryKey: ["practice-submission-detail", skill, id],
    queryFn: () => practiceReviewService.detail(skill, id),
  });
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Đánh giá bài luyện tập"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 dark:bg-slate-900">
        <button
          aria-label="Đóng đánh giá"
          onClick={onClose}
          className="float-right"
        >
          <X />
        </button>
        <button
          onClick={() => void query.refetch()}
          className="mb-3 text-sm text-indigo-600"
        >
          Tải lại bài và điểm mới nhất
        </button>
        {query.isPending ? (
          <p>Đang tải nội dung bài…</p>
        ) : query.isError ? (
          <p role="alert">{query.error.message}</p>
        ) : (
          <PracticeReviewForm item={query.data} onClose={onClose} />
        )}
      </div>
    </div>
  );
}
function PracticeReviewForm({
  item,
  onClose,
}: {
  item: PracticeSubmission;
  onClose: () => void;
}) {
  const [decision, setDecision] = useState<"KEEP" | "ADJUST">("KEEP");
  const [score, setScore] = useState(
    String(
      item.grading_standard === "TOEIC" ? item.raw_score : item.overall_score,
    ),
  );
  const [feedback, setFeedback] = useState("");
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: () =>
      practiceReviewService.decide(item.skill, item.id, {
        expected_revision: item.revision,
        decision,
        ...(decision === "ADJUST" ? { score: Number(score) } : {}),
        feedback: feedback.trim(),
      }),
    onSuccess: () => {
      toast.success("Đã lưu đánh giá và thông báo cho học viên");
      void client.invalidateQueries({ queryKey: ["practice-submissions"] });
      void client.invalidateQueries({
        queryKey: ["practice-submission-detail"],
      });
      onClose();
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const task = item.task_snapshot || {};
  const ai = item.ai_evaluation || {};
  const criteria = ai.criteria_scores as
    | Record<string, number | null>
    | undefined;
  const criteriaFeedback = ai.criteria_feedback as
    | Record<string, { comment?: string; evidence?: string[] }>
    | undefined;
  const max = item.grading_standard === "TOEIC" ? item.max_score || 5 : 100;
  const valid =
    feedback.trim().length >= 10 &&
    feedback.trim().length <= 5000 &&
    (decision === "KEEP" ||
      (score.trim() !== "" &&
        Number.isFinite(Number(score)) &&
        Number(score) >= 0 &&
        Number(score) <= max &&
        (item.grading_standard !== "TOEIC" ||
          Number.isInteger(Number(score)))));
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold">
        Bài luyện tập {item.skill} · {item.user_id}
      </h2>
      {item.review?.reason && (
        <div className="rounded-xl bg-amber-50 p-4 text-amber-950">
          <strong>Yêu cầu phúc khảo</strong>
          <p className="whitespace-pre-wrap">{item.review.reason}</p>
          <small>
            {item.review.requested_at &&
              new Date(item.review.requested_at).toLocaleString("vi-VN")}
          </small>
        </div>
      )}
      <section className="space-y-2">
        <h3 className="font-bold">Đề bài tại thời điểm nộp</h3>
        {!item.task_snapshot && (
          <p className="text-amber-700">
            Bài cũ chưa lưu snapshot; không dùng đề hiện tại để thay thế đề gốc.
          </p>
        )}
        {[
          "title",
          "task_prompt",
          "prompt_text_en",
          "instruction",
          "source_text",
          "image_description",
          "reference_answer",
        ].map((key) =>
          typeof task[key] === "string" && task[key] ? (
            <p key={key} className="whitespace-pre-wrap">
              <strong>{key}: </strong>
              {String(task[key])}
            </p>
          ) : null,
        )}
        {Array.isArray(task.task_requirements) && (
          <ul className="list-disc pl-5">
            {task.task_requirements.map((value, index) => (
              <li key={index}>{String(value)}</li>
            ))}
          </ul>
        )}
        {typeof task.prompt_image_id === "string" && task.prompt_image_id && (
          <PracticeMedia value={task.prompt_image_id} image />
        )}
      </section>
      <section className="space-y-2">
        <h3 className="font-bold">Bài làm của học viên</h3>
        {item.audio_url && <PracticeMedia value={item.audio_url} />}
        {item.skill === "SPEAKING" &&
          !item.audio_url &&
          !item.dialogue_turns_results?.length && (
            <p className="text-red-600">
              Thiếu bản ghi âm: không đủ căn cứ để đánh giá lại phát âm.
            </p>
          )}
        <p className="whitespace-pre-wrap rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
          {item.content || item.transcription}
        </p>
        {item.dialogue_turns_results?.map((turn) => (
          <div key={turn.turn_number}>
            <strong>Lượt {turn.turn_number}</strong>
            <p>{turn.user_transcription}</p>
            {(turn.audio_url || turn.recording_media_id || turn.audio_data) && (
              <PracticeMedia
                value={
                  turn.audio_url ||
                  (turn.audio_data
                    ? turn.audio_data.startsWith("data:")
                      ? turn.audio_data
                      : `data:audio/webm;base64,${turn.audio_data}`
                    : turn.recording_media_id || "")
                }
              />
            )}
          </div>
        ))}
      </section>
      <section className="space-y-2">
        <h3 className="font-bold">
          Đánh giá AI gốc: {scoreLabel(item, true)} · Hiện tại:{" "}
          {scoreLabel(item)}
        </h3>
        <p>{String(ai.detailed_feedback || ai.score_reason || "")}</p>
        {criteria &&
          Object.entries(criteria).map(([key, value]) => (
            <div
              key={key}
              className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"
            >
              <strong>
                {key}: {value === null ? "N/A" : `${value}/100`}
              </strong>
              <p>{criteriaFeedback?.[key]?.comment}</p>
              {criteriaFeedback?.[key]?.evidence?.map((evidence, index) => (
                <blockquote key={index} className="pl-3 italic">
                  {evidence}
                </blockquote>
              ))}
            </div>
          ))}
      </section>
      <section className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">
        <h3 className="font-bold">Quyết định của giáo viên</h3>
        <select
          aria-label="Quyết định phúc khảo"
          value={decision}
          onChange={(event) =>
            setDecision(event.target.value as "KEEP" | "ADJUST")
          }
          className="rounded border bg-transparent p-2"
        >
          <option value="KEEP">Giữ điểm hiện tại</option>
          <option value="ADJUST">Điều chỉnh điểm</option>
        </select>
        {decision === "ADJUST" && (
          <label className="block">
            Điểm sau đánh giá (0–{max})
            <input
              aria-label="Điểm sau phúc khảo"
              type="number"
              min={0}
              max={max}
              step={item.grading_standard === "TOEIC" ? 1 : 0.1}
              value={score}
              onChange={(event) => setScore(event.target.value)}
              className="ml-3 w-24 rounded border bg-transparent p-2"
            />
          </label>
        )}
        <textarea
          aria-label="Nhận xét phúc khảo"
          placeholder="Giải thích quyết định, dẫn chứng từ bài làm (ít nhất 10 ký tự)"
          value={feedback}
          maxLength={5000}
          onChange={(event) => setFeedback(event.target.value)}
          rows={4}
          className="w-full rounded border border-slate-300 bg-transparent p-3"
        />
        <p className="text-xs text-slate-500">
          Điểm AI gốc và nhận xét từng tiêu chí được giữ lại. Quyết định này cập
          nhật điểm luyện tập, không tạo lượt làm/XP mới và không thay đổi bằng
          chứng ôn tập SRS.
        </p>
        <button
          disabled={
            !valid ||
            mutation.isPending ||
            (item.skill === "SPEAKING" &&
              !item.audio_url &&
              !item.dialogue_turns_results?.some(
                (turn) =>
                  turn.audio_url || turn.recording_media_id || turn.audio_data,
              ))
          }
          onClick={() => mutation.mutate()}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white disabled:opacity-40"
        >
          {mutation.isPending ? "Đang lưu…" : "Lưu quyết định"}
        </button>
      </section>
      {!!item.review_history?.length && (
        <section>
          <h3 className="font-bold">Lịch sử đánh giá</h3>
          {item.review_history.map((entry) => (
            <div key={entry.revision} className="my-2 rounded border p-3">
              <p>
                {entry.reviewer_name} ·{" "}
                {entry.reviewed_at &&
                  new Date(entry.reviewed_at).toLocaleString("vi-VN")}
              </p>
              <p>
                {entry.previous_score} → {entry.score}/100
              </p>
              <p>{entry.feedback}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

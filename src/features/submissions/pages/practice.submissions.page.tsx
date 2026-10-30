// Trang chi tiết và xử lý phúc khảo bài nộp luyện tập.
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Modal, Spin } from "antd";
import { resolveMediaUrl } from "@/features/media/utils/media.utils";
import { toast } from "@/store/toast.store";
import { api } from "@/services/api.client";
import { PracticeSubmissionsTable } from "@/features/submissions/components/practice.submissions.table";
import { practiceScoreLabel as scoreLabel, practiceDateLabel, practiceExerciseLabels } from "@/features/submissions/helpers/practice.submission.display";
import {
  practiceReviewService,
  type PracticeSkill,
  type PracticeSubmission,
} from "@/features/submissions/services/practice.review.service";

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
      api.get<{ storage_key?: string; file_path?: string }>(`/media/files/${value}`),
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
  const [selected, setSelected] = useState<string | null>(null);
  return <>
    <PracticeSubmissionsTable key={skill} skill={skill} onOpenReview={setSelected} />
    {selected && <PracticeReviewDetail key={`${skill}-${selected}`} id={selected} skill={skill} onClose={() => setSelected(null)} />}
  </>;
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
    <Modal open onCancel={onClose} footer={null} width={950} title="Đánh giá bài luyện tập" destroyOnHidden>
      <div className="space-y-4">
        <Button onClick={() => void query.refetch()}>Tải lại bài và điểm mới nhất</Button>
        {query.isPending ? <Spin /> : query.isError ? <p role="alert">{query.error.message}</p> :
          <PracticeReviewForm item={query.data} onClose={onClose} />}
      </div>
    </Modal>
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
        {item.title || `Bài luyện tập ${item.skill}`} · {item.user_email || item.user_id}
      </h2>
      <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 p-4 text-sm dark:border-slate-700">
        <p>Tài khoản: <strong>{item.user_email || item.user_id}</strong></p>
        <p>Loại bài: {practiceExerciseLabels[item.exercise_type || ''] || item.exercise_type || '—'}</p>
        <p>Nộp bài: {practiceDateLabel(item.submitted_at)}</p>
        <p>Hoàn thành: {practiceDateLabel(item.completed_at)}</p>
        <p>Lượt / phiên bản: {item.attempt_number ?? item.version_number ?? '—'}</p>
        <p>{item.skill === 'WRITING' ? `Số từ: ${item.word_count ?? '—'}` : `Thời lượng ghi âm: ${item.recording_duration_seconds == null ? '—' : `${item.recording_duration_seconds} giây`}`}</p>
        <p>Yêu cầu phúc khảo: {practiceDateLabel(item.review?.requested_at)}</p>
        <p>Đã kiểm tra: {practiceDateLabel(item.review?.reviewed_at)}</p>
        <p>Người kiểm tra: {item.review?.reviewer_name || '—'}</p>
        <p>Thang điểm: {item.grading_standard === 'TOEIC' ? `TOEIC /${item.max_score ?? '—'}` : 'Thực hành /100'}</p>
      </div>
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

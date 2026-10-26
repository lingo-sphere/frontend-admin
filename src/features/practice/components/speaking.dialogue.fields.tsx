import { usePracticeText } from '../hooks/use.practice.text'
import { useState } from "react";
import { Alert, Button, Card, Form, Input, Select, Space, Tag } from "antd";
import type { FormInstance } from "antd";
import { toast } from "@/store/toast.store";
import { speakingAdminService } from "../services/speaking-admin.service";
import {
  newSpeakingTurn,
  speakingVoices,
  type SpeakingPayload,
  type SpeakingTurn,
} from "../types/speaking-admin.types";
import { SpeakingAudioPreview } from "./speaking.media.field";
import { ipaError } from "../helpers/ipa-admin.helper";

export function SpeakingDialogueFields({
  form,
  disabled,
  dirty,
  onBusy,
}: {
  form: FormInstance<SpeakingPayload>;
  disabled: boolean;
  dirty: () => void;
  onBusy: (delta: number) => void;
}) {
  const p = usePracticeText()
  const turns: SpeakingTurn[] =
    Form.useWatch(["dialogue_scenario", "turns"], { form, preserve: true }) ||
    [];
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const clearAudio = (index: number) => {
    form.setFieldValue(
      ["dialogue_scenario", "turns", index, "prompt_audio_id"],
      ""
    );
    form.setFieldValue(
      ["dialogue_scenario", "turns", index, "tts_text_hash"],
      ""
    );
    dirty();
  };
  const generate = async (indices: number[]) => {
    if (disabled || progress) return;
    const pending = indices.filter(
      (index) => turns[index]?.speaker === "AI" && turns[index].text_en.trim()
    );
    if (!pending.length) {
      toast.error(p("Nhập lời thoại tiếng Anh cho AI trước"));
      return;
    }
    onBusy(1);
    setError("");
    try {
      for (const [position, index] of pending.entries()) {
        setProgress(p("Đang tạo audio {{p0}}/{{p1}}…", { p0: position + 1, p1: pending.length }));
        const turn = form.getFieldValue([
          "dialogue_scenario",
          "turns",
          index,
        ]) as SpeakingTurn;
        const text = turn.text_en;
        const voice = turn.tts_voice || speakingVoices[0].value;
        const result = await speakingAdminService.tts(text, voice);
        const current = form.getFieldValue([
          "dialogue_scenario",
          "turns",
          index,
        ]) as SpeakingTurn;
        if (
          current.text_en !== text ||
          current.tts_voice !== voice ||
          current.speaker !== "AI"
        )
          throw new Error(
            p("Lượt thoại đã đổi trong lúc tạo audio. Hãy tạo lại.")
          );
        form.setFieldValue(
          ["dialogue_scenario", "turns", index, "prompt_audio_id"],
          result.media_id
        );
        form.setFieldValue(
          ["dialogue_scenario", "turns", index, "tts_text_hash"],
          result.tts_text_hash
        );
        dirty();
      }
      toast.success(
        p("Audio đã lưu trên R2 và kho media. Lưu bài để gắn các lượt thoại.")
      );
    } catch (cause) {
      setError(ipaError(cause));
    } finally {
      setProgress("");
      onBusy(-1);
    }
  };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <Form.Item
          name={["dialogue_scenario", "setting"]}
          label={p("Bối cảnh (Anh)")}
        >
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item
          name={["dialogue_scenario", "setting_vi"]}
          label={p("Bối cảnh (Việt)")}
        >
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item name={["dialogue_scenario", "ai_role"]} label={p("Vai trò AI")}>
          <Input placeholder={p("Ví dụ: Lễ tân khách sạn")} />
        </Form.Item>
        <Form.Item
          name={["dialogue_scenario", "user_role"]}
          label={p("Vai trò học viên")}
        >
          <Input placeholder={p("Ví dụ: Khách đặt phòng")} />
        </Form.Item>
      </div>
      <Form.Item
        name={["dialogue_scenario", "overall_goals_vi"]}
        label={p("Mục tiêu giao tiếp của bài")}
      >
        <Select mode="tags" placeholder={p("Nhập mục tiêu, nhấn Enter")} />
      </Form.Item>
      <Alert
        type="info"
        showIcon
        title={p("Tạo audio TTS cho các lượt AI trước khi xuất bản. Khi sửa lời thoại hoặc giọng, cần tạo lại audio.")}
      />
      {error && <Alert type="error" showIcon title={error} />}
      <Button
        disabled={disabled}
        loading={Boolean(progress)}
        onClick={() => {
          void generate(
            turns
              .map((_, index) => index)
              .filter(
                (index) =>
                  turns[index].speaker === "AI" && !turns[index].tts_text_hash
              )
          );
        }}
      >
        {progress || p("Tạo audio các lượt AI còn thiếu")}
      </Button>
      <Form.List name={["dialogue_scenario", "turns"]}>
        {(fields, { add, remove, move }) => (
          <div className="flex flex-col gap-6 pt-3">
            {fields.map((field, index) => (
              <Card
                key={field.key}
                className={`shadow-xs rounded-xl border border-slate-200 transition-all border-l-4 ${
                  turns[index]?.speaker === "AI"
                    ? "border-l-blue-500 bg-blue-50/4"
                    : "border-l-emerald-500 bg-emerald-50/4"
                }`}
                title={
                  <Space size="middle">
                    <span className="font-bold text-sm text-slate-800">{p("Lượt")} {index + 1}
                    </span>
                    <Tag
                      color={turns[index]?.speaker === "AI" ? "blue" : "green"}
                    >
                      {turns[index]?.speaker === "AI"
                        ? "🤖 AI bot"
                        : p("👤 Học viên (USER)")}
                    </Tag>
                    {turns[index]?.speaker_name && (
                      <span className="text-xs text-slate-500 font-normal">
                        ({turns[index].speaker_name})
                      </span>
                    )}
                  </Space>
                }
                extra={
                  <Space wrap>
                    <Button
                      size="small"
                      disabled={disabled || index === 0}
                      onClick={() => {
                        move(index, index - 1);
                        dirty();
                      }}
                    >{p("Lên")} </Button>
                    <Button
                      size="small"
                      disabled={disabled || index === fields.length - 1}
                      onClick={() => {
                        move(index, index + 1);
                        dirty();
                      }}
                    >{p("Xuống")} </Button>
                    <Button
                      size="small"
                      danger
                      disabled={disabled}
                      onClick={() => {
                        remove(index);
                        dirty();
                      }}
                    >{p("Xóa lượt")} </Button>
                  </Space>
                }
              >
                <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2 mb-2">
                  <Form.Item name={[field.name, "speaker"]} label={p("Người nói")}>
                    <Select
                      options={[
                        { value: "AI", label: "AI bot" },
                        { value: "USER", label: p("Học viên") },
                      ]}
                      onChange={(speaker) => {
                        clearAudio(index);
                        form.setFieldValue(
                          ["dialogue_scenario", "turns", index, "speaker_name"],
                          speaker === "AI" ? "AI" : p("Bạn")
                        );
                        if (speaker === "USER" && !turns[index]?.user_guidance)
                          form.setFieldValue(
                            [
                              "dialogue_scenario",
                              "turns",
                              index,
                              "user_guidance",
                            ],
                            {
                              goal_vi: "",
                              turn_goal_vi: "",
                              suggested_phrases: [],
                              expected_keywords: [],
                            }
                          );
                      }}
                    />
                  </Form.Item>
                  <Form.Item
                    name={[field.name, "speaker_name"]}
                    label={p("Tên hiển thị người nói")}
                  >
                    <Input />
                  </Form.Item>
                </div>
                <div className="space-y-3">
                  <Form.Item
                    name={[field.name, "text_en"]}
                    label={
                      turns[index]?.speaker === "AI"
                        ? p("Lời thoại AI (Anh)")
                        : p("Câu mẫu USER (Anh)")
                    }
                  >
                    <Input.TextArea
                      rows={3}
                      onChange={() => clearAudio(index)}
                    />
                  </Form.Item>
                  <Form.Item
                    name={[field.name, "text_vi"]}
                    label={p("Bản dịch lượt thoại")}
                  >
                    <Input.TextArea rows={2} />
                  </Form.Item>
                </div>
                {turns[index]?.speaker === "AI" ? (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5">
                    <Form.Item
                      name={[field.name, "tts_voice"]}
                      label={p("Giọng TTS")}
                    >
                      <Select
                        options={speakingVoices.map(voice => ({ ...voice, label: p(voice.label) }))}
                        onChange={() => clearAudio(index)}
                      />
                    </Form.Item>
                    <Space wrap>
                      <Button
                        disabled={disabled}
                        onClick={() => {
                          void generate([index]);
                        }}
                      >
                        {turns[index]?.prompt_audio_id
                          ? p("Tạo lại audio AI")
                          : p("Tạo audio AI")}
                      </Button>
                      <Tag
                        color={
                          turns[index]?.tts_text_hash ? "success" : "warning"
                        }
                      >
                        {turns[index]?.tts_text_hash
                          ? p("Đã tạo TTS")
                          : p("Cần tạo TTS")}
                      </Tag>
                    </Space>
                    {turns[index]?.prompt_audio_id && (
                      <div className="mt-2">
                        <SpeakingAudioPreview
                          value={turns[index].prompt_audio_id}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5">
                    <Form.Item
                      name={[field.name, "user_guidance", "goal_vi"]}
                      label={p("Mục tiêu phản hồi (Việt)")}
                    >
                      <Input.TextArea rows={2} />
                    </Form.Item>
                    <Form.Item
                      name={[field.name, "user_guidance", "turn_goal_vi"]}
                      label={p("Mục tiêu cụ thể của lượt")}
                    >
                      <Input.TextArea rows={2} />
                    </Form.Item>
                    <Form.Item
                      name={[field.name, "user_guidance", "suggested_phrases"]}
                      label={p("Cụm từ gợi ý")}
                    >
                      <Select mode="tags" />
                    </Form.Item>
                    <Form.Item
                      name={[field.name, "user_guidance", "expected_keywords"]}
                      label={p("Từ khóa mong đợi của lượt")}
                    >
                      <Select mode="tags" />
                    </Form.Item>
                  </div>
                )}
              </Card>
            ))}
            <div className="pt-2">
              <Space wrap size="middle">
                <Button
                  type="dashed"
                  disabled={disabled || fields.length >= 40}
                  onClick={() => {
                    add(newSpeakingTurn("AI", fields.length));
                    dirty();
                  }}
                >{p("+ Thêm lượt AI")} </Button>
                <Button
                  type="dashed"
                  disabled={disabled || fields.length >= 40}
                  onClick={() => {
                    add(newSpeakingTurn("USER", fields.length));
                    dirty();
                  }}
                >{p("+ Thêm lượt học viên")} </Button>
              </Space>
            </div>
          </div>
        )}
      </Form.List>
    </div>
  );
}

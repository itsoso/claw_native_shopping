import { useState } from "react";

type FeedbackFormProps = {
  scenarioId: string;
  onSubmit: (payload: {
    scenarioId: string;
    rating: number;
    message: string;
  }) => Promise<void>;
  onSubmitted?: () => void;
};

export function FeedbackForm({ scenarioId, onSubmit, onSubmitted }: FeedbackFormProps) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (): Promise<void> => {
    if (!message.trim()) {
      setErrorMessage("请先填写反馈内容");
      return;
    }

    setErrorMessage(null);
    setStatus("submitting");
    try {
      await onSubmit({
        scenarioId,
        rating: 4,
        message: message.trim(),
      });
      setStatus("success");
      onSubmitted?.();
    } catch {
      setStatus("idle");
      setErrorMessage("反馈提交失败，请稍后再试");
    }
  };

  return (
    <section className="panel intake-panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Feedback</p>
          <h2>留下反馈</h2>
        </div>
      </div>

      <label className="field">
        <span className="field__label">这次演示最有说服力的部分</span>
        <textarea
          className="field__input field__input--textarea"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={4}
        />
      </label>

      <div className="intake-panel__actions">
        <button className="primary-button" type="button" onClick={() => void handleSubmit()}>
          {status === "submitting" ? "提交中" : "提交反馈"}
        </button>
        {status === "success" ? <p className="intake-panel__status">反馈已记录</p> : null}
        {errorMessage ? (
          <p className="intake-panel__status intake-panel__status--error">{errorMessage}</p>
        ) : null}
      </div>
    </section>
  );
}

import { useState } from "react";

type InterestFormProps = {
  onSubmit: (payload: { email: string }) => Promise<void>;
};

export function InterestForm({ onSubmit }: InterestFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isValidEmail = (value: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleSubmit = async (): Promise<void> => {
    const normalizedEmail = email.trim();

    if (!isValidEmail(normalizedEmail)) {
      setErrorMessage("请输入有效邮箱");
      return;
    }

    setErrorMessage(null);
    setStatus("submitting");
    try {
      await onSubmit({ email: normalizedEmail });
      setStatus("success");
    } catch {
      setStatus("idle");
      setErrorMessage("候补提交失败，请稍后再试");
    }
  };

  return (
    <section className="panel intake-panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Interest</p>
          <h2>加入候补</h2>
        </div>
      </div>

      <label className="field">
        <span className="field__label">邮箱</span>
        <input
          className="field__input"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
        />
      </label>

      <div className="intake-panel__actions">
        <button className="primary-button" type="button" onClick={() => void handleSubmit()}>
          {status === "submitting" ? "提交中" : "加入候补"}
        </button>
        {status === "success" ? <p className="intake-panel__status">已加入候补名单</p> : null}
        {errorMessage ? (
          <p className="intake-panel__status intake-panel__status--error">{errorMessage}</p>
        ) : null}
      </div>
    </section>
  );
}

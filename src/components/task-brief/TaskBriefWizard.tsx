"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  FileText,
  ListChecks,
  Loader2,
  LockKeyhole,
  Printer,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/locales/LanguageProvider";
import {
  EMPTY_TASK_BRIEF_ANSWERS,
  TASK_BRIEF_DRAFT_KEY,
  TaskBriefApiError,
  submitTaskBrief,
  verifyTaskBriefAccess,
  type TaskBriefAnswers,
  type TaskBriefMode,
} from "@/lib/taskBrief";
import {
  displayTaskBriefValue,
  getTaskBriefSteps,
  type TaskBriefField,
  type TaskBriefStep,
} from "@/lib/taskBriefSchema";

type Phase = "gate" | "choose" | "form" | "review" | "success";

type StoredDraft = {
  mode?: TaskBriefMode;
  answers?: Partial<TaskBriefAnswers>;
  step?: number;
  startedAt?: number;
  clientRequestId?: string;
};

function requestId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function shanghaiNowInput(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}T${value.hour}:${value.minute}`;
}

function modeHasDraft(answers: TaskBriefAnswers) {
  return Boolean(
    answers.requesterName ||
      answers.projectName ||
      answers.objective ||
      answers.deliverables ||
      answers.finalAt
  );
}

function fieldClass(hasError = false) {
  return cn(
    "w-full rounded-2xl border bg-white/55 px-4 text-[15px] text-foreground outline-none backdrop-blur-sm transition",
    "placeholder:text-foreground/35 hover:border-indigo-300/60 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10",
    "dark:bg-slate-950/35",
    hasError ? "border-rose-400" : "border-white/35 dark:border-white/15"
  );
}

function TaskBriefSummary({
  answers,
  mode,
  steps,
  submissionId,
}: {
  answers: TaskBriefAnswers;
  mode: TaskBriefMode;
  steps: TaskBriefStep[];
  submissionId?: string;
}) {
  const { t } = useTranslation();
  const copy = t.taskBrief;

  return (
    <article
      id="task-brief-print-area"
      className="rounded-[28px] border border-white/30 bg-white/55 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8 dark:bg-slate-950/30 dark:border-white/10"
    >
      <div className="mb-7 flex flex-col gap-3 border-b border-foreground/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-indigo-500">COOPER.</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">{copy.summaryTitle}</h2>
          <p className="mt-1 text-sm text-foreground/55">
            {copy.modeLabel}：{mode === "simple" ? copy.simpleLabel : copy.detailedLabel}
          </p>
        </div>
        {submissionId && (
          <div className="rounded-xl border border-indigo-200/70 bg-indigo-50/70 px-3 py-2 text-xs font-semibold text-indigo-700 dark:border-indigo-400/20 dark:bg-indigo-500/10 dark:text-indigo-300">
            {copy.submissionId}：{submissionId}
          </div>
        )}
      </div>

      <div className="space-y-7">
        {steps.map((step, stepIndex) => {
          const values = step.fields
            .map((field) => ({ field, value: answers[field.key]?.trim() ?? "" }))
            .filter(({ value }) => Boolean(value));
          if (values.length === 0) return null;
          return (
            <section key={`${step.title}-${stepIndex}`}>
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">
                  {stepIndex + 1}
                </span>
                <h3 className="font-bold text-foreground">{step.title}</h3>
              </div>
              <dl className="ml-10 grid gap-3 sm:grid-cols-2">
                {values.map(({ field, value }) => (
                  <div
                    key={field.key}
                    className={cn(
                      "rounded-xl border border-foreground/8 bg-white/35 px-4 py-3 dark:bg-white/[0.03]",
                      value.length > 100 && "sm:col-span-2"
                    )}
                  >
                    <dt className="text-xs font-semibold text-foreground/45">{field.label}</dt>
                    <dd className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/85">
                      {displayTaskBriefValue(field, value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          );
        })}
      </div>
    </article>
  );
}

export default function TaskBriefWizard() {
  const { language, t, mounted } = useTranslation();
  const copy = t.taskBrief;
  const [phase, setPhase] = useState<Phase>("gate");
  const [accessCode, setAccessCode] = useState("");
  const [mode, setMode] = useState<TaskBriefMode>("simple");
  const [answers, setAnswers] = useState<TaskBriefAnswers>({ ...EMPTY_TASK_BRIEF_ANSWERS });
  const [step, setStep] = useState(0);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [clientRequestId, setClientRequestId] = useState(requestId);
  const [hydrated, setHydrated] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [gateError, setGateError] = useState("");
  const [stepError, setStepError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState("");
  const [submissionId, setSubmissionId] = useState("");
  const [copied, setCopied] = useState(false);

  const steps = useMemo(() => getTaskBriefSteps(language, mode), [language, mode]);
  const currentStep = steps[Math.min(step, steps.length - 1)];
  const progress = ((Math.min(step, steps.length - 1) + 1) / steps.length) * 100;
  const minDeadline = shanghaiNowInput();

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(TASK_BRIEF_DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as StoredDraft;
        const savedMode = draft.mode === "detailed" ? "detailed" : "simple";
        setMode(savedMode);
        setAnswers({ ...EMPTY_TASK_BRIEF_ANSWERS, ...(draft.answers ?? {}) });
        setStep(Math.max(0, Number.isFinite(draft.step) ? Number(draft.step) : 0));
        if (typeof draft.startedAt === "number") setStartedAt(draft.startedAt);
        if (typeof draft.clientRequestId === "string") setClientRequestId(draft.clientRequestId);
      }
    } catch {
      sessionStorage.removeItem(TASK_BRIEF_DRAFT_KEY);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || phase === "success") return;
    const draft: StoredDraft = { mode, answers, step, startedAt, clientRequestId };
    try {
      sessionStorage.setItem(TASK_BRIEF_DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /* Storage can be unavailable in private mode. */
    }
  }, [answers, clientRequestId, hydrated, mode, phase, startedAt, step]);

  if (!mounted || !hydrated) return null;

  const verifyAccess = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = accessCode.trim();
    if (!code || verifying) return;
    setVerifying(true);
    setGateError("");
    try {
      await verifyTaskBriefAccess(code);
      setAccessCode(code);
      setPhase("choose");
    } catch (error) {
      setGateError(
        error instanceof TaskBriefApiError && error.code === "INVALID_ACCESS_CODE"
          ? copy.invalidCode
          : copy.serviceError
      );
    } finally {
      setVerifying(false);
    }
  };

  const chooseMode = (nextMode: TaskBriefMode) => {
    if (nextMode !== mode) setStep(0);
    setMode(nextMode);
    setStepError("");
    setStartedAt((value) => value || Date.now());
    setPhase("form");
  };

  const setField = (field: TaskBriefField, value: string) => {
    setAnswers((previous) => ({ ...previous, [field.key]: value }));
    if (stepError) setStepError("");
  };

  const validationForStep = (stepIndex: number) => {
    const target = steps[stepIndex];
    const missing = target.fields
      .filter((field) => field.required && !answers[field.key].trim())
      .map((field) => field.label);
    if (missing.length > 0) return `${copy.missing}${missing.join(language === "zh" ? "、" : ", ")}`;
    if (target.fields.some((field) => field.key === "finalAt") && answers.finalAt) {
      if (answers.finalAt < shanghaiNowInput()) return copy.pastDeadline;
    }
    return "";
  };

  const nextStep = () => {
    const validation = validationForStep(step);
    if (validation) {
      setStepError(validation);
      return;
    }
    setStepError("");
    if (step < steps.length - 1) {
      setStep((value) => value + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const invalidIndex = steps.findIndex((_, index) => Boolean(validationForStep(index)));
    if (invalidIndex >= 0) {
      setStep(invalidIndex);
      setStepError(validationForStep(invalidIndex));
      return;
    }
    setPhase("review");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const summaryText = () => {
    const lines = [
      copy.summaryTitle,
      `${copy.modeLabel}: ${mode === "simple" ? copy.simpleLabel : copy.detailedLabel}`,
      submissionId ? `${copy.submissionId}: ${submissionId}` : "",
      "",
    ];
    steps.forEach((taskStep, index) => {
      lines.push(`${index + 1}. ${taskStep.title}`);
      taskStep.fields.forEach((field) => {
        const value = answers[field.key].trim();
        if (value) lines.push(`${field.label}: ${displayTaskBriefValue(field, value)}`);
      });
      lines.push("");
    });
    return lines.filter((line, index, all) => line || all[index - 1] !== "").join("\n");
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summaryText());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const sendTask = async () => {
    if (!consent || submitting) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const result = await submitTaskBrief({
        accessCode,
        language,
        mode,
        answers,
        consent,
        company,
        startedAt,
        clientRequestId,
      });
      setSubmissionId(result.submissionId);
      setPhase("success");
      sessionStorage.removeItem(TASK_BRIEF_DRAFT_KEY);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      if (error instanceof TaskBriefApiError && error.code === "INVALID_ACCESS_CODE") {
        setSubmitError(copy.invalidCode);
        setPhase("gate");
        setAccessCode("");
      } else {
        setSubmitError(copy.submitError);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetTask = () => {
    setAnswers({ ...EMPTY_TASK_BRIEF_ANSWERS });
    setMode("simple");
    setStep(0);
    setStartedAt(Date.now());
    setClientRequestId(requestId());
    setConsent(false);
    setCompany("");
    setSubmissionId("");
    setSubmitError("");
    setPhase("choose");
  };

  if (phase === "gate") {
    return (
      <section className="mx-auto w-full max-w-2xl rounded-[36px] border border-white/30 bg-white/45 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-2xl sm:p-10 dark:bg-slate-950/25 dark:border-white/10">
        <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/20">
          <LockKeyhole className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{copy.gateTitle}</h2>
        <p className="mt-3 leading-relaxed text-foreground/60">{copy.gateHint}</p>
        <form className="mt-8 space-y-4" onSubmit={verifyAccess}>
          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-foreground/50">{copy.accessCode}</span>
            <input
              type="password"
              autoComplete="current-password"
              value={accessCode}
              onChange={(event) => setAccessCode(event.target.value)}
              placeholder={copy.accessPlaceholder}
              className={cn(fieldClass(Boolean(gateError)), "h-13")}
              aria-invalid={Boolean(gateError)}
              autoFocus
            />
          </label>
          {gateError && <p className="text-sm font-medium text-rose-500" role="alert">{gateError}</p>}
          <button
            type="submit"
            disabled={!accessCode.trim() || verifying}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-6 font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            {verifying ? copy.verifying : copy.verify}
          </button>
        </form>
      </section>
    );
  }

  if (phase === "choose") {
    const hasDraft = modeHasDraft(answers);
    return (
      <section className="mx-auto w-full max-w-4xl">
        <div className="mb-7">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{copy.chooseTitle}</h2>
          <p className="mt-2 text-foreground/60">{copy.chooseHint}</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {([
            { value: "simple" as const, icon: Sparkles, title: copy.simpleTitle, description: copy.simpleDesc, badge: "5" },
            { value: "detailed" as const, icon: ListChecks, title: copy.detailedTitle, description: copy.detailedDesc, badge: "10" },
          ]).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => chooseMode(option.value)}
              className="group relative overflow-hidden rounded-[30px] border border-white/35 bg-white/50 p-7 text-left shadow-[0_18px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-indigo-300/70 hover:shadow-[0_24px_80px_rgba(79,70,229,0.13)] dark:bg-slate-950/25 dark:border-white/10"
            >
              <div className="absolute -right-8 -top-10 text-[150px] font-black leading-none text-indigo-500/[0.05]">{option.badge}</div>
              <div className="relative">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 transition group-hover:bg-indigo-500 group-hover:text-white">
                  <option.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-6 text-xl font-bold">{option.title}</h3>
                <p className="mt-3 min-h-[3rem] text-sm leading-relaxed text-foreground/60">{option.description}</p>
                <span className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-indigo-500">
                  {hasDraft && mode === option.value ? copy.resume : copy.start}
                  <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>
    );
  }

  if (phase === "review" || phase === "success") {
    const success = phase === "success";
    return (
      <section className="mx-auto w-full max-w-5xl">
        <div className="no-print mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className={cn("mb-4 flex h-12 w-12 items-center justify-center rounded-2xl", success ? "bg-emerald-500 text-white" : "bg-indigo-500/10 text-indigo-500")}>
              {success ? <CheckCircle2 className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
            </div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{success ? copy.successTitle : copy.reviewTitle}</h2>
            <p className="mt-2 max-w-2xl text-foreground/60">{success ? copy.successHint : copy.reviewHint}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copySummary} className="inline-flex h-10 items-center gap-2 rounded-xl border border-foreground/10 bg-white/50 px-4 text-sm font-semibold transition hover:border-indigo-300 hover:text-indigo-500 dark:bg-white/5">
              {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
              {copied ? copy.copied : copy.copy}
            </button>
            <button type="button" onClick={() => window.print()} className="inline-flex h-10 items-center gap-2 rounded-xl border border-foreground/10 bg-white/50 px-4 text-sm font-semibold transition hover:border-indigo-300 hover:text-indigo-500 dark:bg-white/5">
              <Printer className="h-4 w-4" /> {copy.print}
            </button>
          </div>
        </div>

        <TaskBriefSummary answers={answers} mode={mode} steps={steps} submissionId={success ? submissionId : undefined} />

        {!success ? (
          <div className="no-print mt-6 rounded-[24px] border border-white/30 bg-white/40 p-5 backdrop-blur-xl dark:bg-slate-950/25 dark:border-white/10">
            <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={company} onChange={(event) => setCompany(event.target.value)} />
            <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-foreground/70">
              <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 h-4 w-4 accent-indigo-500" />
              <span>{copy.consent}</span>
            </label>
            {submitError && <p className="mt-4 text-sm font-medium text-rose-500" role="alert">{submitError}</p>}
            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <button type="button" onClick={() => setPhase("form")} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-foreground/10 bg-white/50 px-5 font-semibold transition hover:border-indigo-300 hover:text-indigo-500 dark:bg-white/5">
                <ChevronLeft className="h-4 w-4" /> {copy.edit}
              </button>
              <button type="button" onClick={sendTask} disabled={!consent || submitting} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-6 font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {submitting ? copy.submitting : copy.submit}
              </button>
            </div>
          </div>
        ) : (
          <div className="no-print mt-6 flex justify-center">
            <button type="button" onClick={resetTask} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-6 font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-600">
              <RotateCcw className="h-4 w-4" /> {copy.newTask}
            </button>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-4xl">
      <div className="mb-5 flex items-center justify-between gap-4">
        <button type="button" onClick={() => setPhase("choose")} className="inline-flex items-center gap-2 text-sm font-semibold text-foreground/55 transition hover:text-indigo-500">
          <ChevronLeft className="h-4 w-4" /> {copy.switchMode}
        </button>
        <span className="text-sm font-semibold text-foreground/50">
          {copy.step} {step + 1} / {steps.length}
        </span>
      </div>
      <div className="mb-7 h-1.5 overflow-hidden rounded-full bg-foreground/8">
        <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-[width] duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="rounded-[34px] border border-white/30 bg-white/45 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.09)] backdrop-blur-2xl sm:p-9 dark:bg-slate-950/25 dark:border-white/10">
        <div className="mb-8">
          <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-indigo-500 px-3 text-sm font-bold text-white">{step + 1}</span>
          <h2 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">{currentStep.title}</h2>
          <p className="mt-2 leading-relaxed text-foreground/60">{currentStep.description}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {currentStep.fields.map((field) => {
            const value = answers[field.key];
            const missing = Boolean(stepError && field.required && !value.trim());
            const shared = {
              id: `task-${String(field.key)}`,
              value,
              required: field.required,
              "aria-invalid": missing,
              onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setField(field, event.target.value),
            };
            return (
              <label key={field.key} htmlFor={shared.id} className={cn("block space-y-2", field.type === "textarea" && "sm:col-span-2")}>
                <span className="flex items-center gap-2 text-sm font-bold text-foreground/75">
                  {field.label}
                  {field.required && <span className="rounded-md bg-indigo-500/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-indigo-500">{copy.required}</span>}
                </span>
                {field.hint && <span className="block text-xs text-foreground/45">{field.hint}</span>}
                {field.type === "textarea" ? (
                  <textarea {...shared} rows={field.rows ?? 3} maxLength={4000} placeholder={field.placeholder} className={cn(fieldClass(missing), "min-h-[110px] resize-y py-3")} />
                ) : field.type === "select" ? (
                  <select {...shared} className={cn(fieldClass(missing), "h-12")}>
                    <option value="">{language === "zh" ? "请选择" : "Select"}</option>
                    {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                ) : (
                  <input
                    {...shared}
                    type={field.type === "datetime" ? "datetime-local" : "text"}
                    min={field.type === "datetime" ? minDeadline : undefined}
                    maxLength={field.type === "datetime" ? undefined : 500}
                    placeholder={field.placeholder}
                    onInput={
                      field.type === "datetime"
                        ? (event) => setField(field, event.currentTarget.value)
                        : undefined
                    }
                    className={cn(fieldClass(missing), "h-12")}
                  />
                )}
              </label>
            );
          })}
        </div>

        {stepError && <p className="mt-6 rounded-xl border border-rose-200/70 bg-rose-50/70 px-4 py-3 text-sm font-medium text-rose-600 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-300" role="alert">{stepError}</p>}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-foreground/8 pt-6 sm:flex-row sm:justify-between">
          <button type="button" disabled={step === 0} onClick={() => { setStep((value) => Math.max(0, value - 1)); setStepError(""); }} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-foreground/10 bg-white/45 px-5 font-semibold transition hover:border-indigo-300 hover:text-indigo-500 disabled:cursor-not-allowed disabled:opacity-35 dark:bg-white/5">
            <ChevronLeft className="h-4 w-4" /> {copy.back}
          </button>
          <button type="button" onClick={nextStep} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-6 font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-600">
            {step === steps.length - 1 ? copy.review : copy.next}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

    </section>
  );
}

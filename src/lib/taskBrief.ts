import type { Language } from "@/locales/translations";

export type TaskBriefMode = "simple" | "detailed";

export type TaskBriefAnswers = {
  requesterName: string;
  requesterDepartment: string;
  requesterContact: string;
  projectName: string;
  projectType: string;
  background: string;
  currentProblem: string;
  objective: string;
  priority: string;
  successCriteria: string;
  targetAudience: string;
  useScenario: string;
  channels: string;
  displayEnvironment: string;
  deliverables: string;
  quantity: string;
  dimensions: string;
  formats: string;
  versionRequirements: string;
  requiredContent: string;
  forbiddenContent: string;
  materialsStatus: string;
  assetLinks: string;
  styleKeywords: string;
  referenceLinks: string;
  likedDirection: string;
  forbiddenStyle: string;
  brandConstraints: string;
  copyrightConstraints: string;
  technicalConstraints: string;
  budget: string;
  firstDraftAt: string;
  feedbackAt: string;
  finalAt: string;
  deadlineReason: string;
  decisionMaker: string;
  reviewers: string;
  reviewerContact: string;
  recipientName: string;
  recipientContact: string;
  additionalNotes: string;
};

export const EMPTY_TASK_BRIEF_ANSWERS: TaskBriefAnswers = {
  requesterName: "",
  requesterDepartment: "",
  requesterContact: "",
  projectName: "",
  projectType: "",
  background: "",
  currentProblem: "",
  objective: "",
  priority: "normal",
  successCriteria: "",
  targetAudience: "",
  useScenario: "",
  channels: "",
  displayEnvironment: "",
  deliverables: "",
  quantity: "",
  dimensions: "",
  formats: "",
  versionRequirements: "",
  requiredContent: "",
  forbiddenContent: "",
  materialsStatus: "",
  assetLinks: "",
  styleKeywords: "",
  referenceLinks: "",
  likedDirection: "",
  forbiddenStyle: "",
  brandConstraints: "",
  copyrightConstraints: "",
  technicalConstraints: "",
  budget: "",
  firstDraftAt: "",
  feedbackAt: "",
  finalAt: "",
  deadlineReason: "",
  decisionMaker: "",
  reviewers: "",
  reviewerContact: "",
  recipientName: "",
  recipientContact: "",
  additionalNotes: "",
};

export type TaskBriefPayload = {
  accessCode: string;
  language: Language;
  mode: TaskBriefMode;
  answers: TaskBriefAnswers;
  consent: boolean;
  company: string;
  startedAt: number;
  clientRequestId: string;
};

export type TaskBriefSubmitResult = {
  ok: true;
  submissionId: string;
  duplicate?: boolean;
};

export class TaskBriefApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, code = "REQUEST_FAILED", status = 500) {
    super(message);
    this.name = "TaskBriefApiError";
    this.code = code;
    this.status = status;
  }
}

function taskBriefApiUrl(): string {
  const configured = process.env.NEXT_PUBLIC_TASK_BRIEF_API_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  const xiaocoo = process.env.NEXT_PUBLIC_XIAOCOO_API_URL?.trim();
  if (xiaocoo && /^https?:\/\//i.test(xiaocoo)) {
    return `${xiaocoo.replace(/\/$/, "")}/task-brief`;
  }

  return "/api/task-brief";
}

async function postTaskBrief<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
    code?: string;
  } & T;

  if (!response.ok) {
    throw new TaskBriefApiError(
      data.error || "Task brief request failed.",
      data.code || "REQUEST_FAILED",
      response.status
    );
  }

  return data;
}

export async function verifyTaskBriefAccess(accessCode: string): Promise<void> {
  await postTaskBrief<{ ok: true }>(`${taskBriefApiUrl()}/verify`, { accessCode });
}

export async function submitTaskBrief(
  payload: TaskBriefPayload
): Promise<TaskBriefSubmitResult> {
  return postTaskBrief<TaskBriefSubmitResult>(taskBriefApiUrl(), payload);
}

export const TASK_BRIEF_DRAFT_KEY = "cooper-task-brief-draft-v1";

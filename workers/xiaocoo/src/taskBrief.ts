export type TaskBriefWorkerEnv = {
  TASK_BRIEF_ACCESS_CODE?: string;
  RESEND_API_KEY?: string;
  TASK_BRIEF_TO_EMAIL?: string;
  TASK_BRIEF_FROM_EMAIL?: string;
};

type WorkerExecutionContext = {
  waitUntil(promise: Promise<unknown>): void;
};

type TaskBriefMode = "simple" | "detailed";
type Language = "zh" | "en";
type Answers = Record<string, string>;

const MAX_BODY_BYTES = 64 * 1024;
const MIN_FILL_MS = 2500;
const MAX_FIELD_CHARS = 4000;
const SUBMIT_WINDOW_MS = 5 * 60 * 1000;
const SUBMIT_LIMIT = 4;
const VERIFY_WINDOW_MS = 60 * 1000;
const VERIFY_LIMIT = 10;

const verifyRateLog = new Map<string, number[]>();
const submitRateLog = new Map<string, number[]>();

const ANSWER_KEYS = [
  "requesterName", "requesterDepartment", "requesterContact", "projectName", "projectType",
  "background", "currentProblem", "objective", "priority", "successCriteria", "targetAudience",
  "useScenario", "channels", "displayEnvironment", "deliverables", "quantity", "dimensions",
  "formats", "versionRequirements", "requiredContent", "forbiddenContent", "materialsStatus",
  "assetLinks", "styleKeywords", "referenceLinks", "likedDirection", "forbiddenStyle",
  "brandConstraints", "copyrightConstraints", "technicalConstraints", "budget", "firstDraftAt",
  "feedbackAt", "finalAt", "deadlineReason", "decisionMaker", "reviewers", "reviewerContact",
  "recipientName", "recipientContact", "additionalNotes",
] as const;

const FIELD_LABELS: Record<(typeof ANSWER_KEYS)[number], string> = {
  requesterName: "布置人姓名",
  requesterDepartment: "部门 / 角色",
  requesterContact: "布置人联系方式",
  projectName: "项目 / 任务名称",
  projectType: "设计类型",
  background: "任务背景",
  currentProblem: "当前问题",
  objective: "目标",
  priority: "优先级",
  successCriteria: "成功标准",
  targetAudience: "目标用户",
  useScenario: "使用场景",
  channels: "发布 / 使用渠道",
  displayEnvironment: "展示环境",
  deliverables: "交付内容",
  quantity: "数量 / 版本",
  dimensions: "尺寸 / 比例 / 平台规格",
  formats: "文件格式",
  versionRequirements: "版本要求",
  requiredContent: "必须出现的文案 / 元素",
  forbiddenContent: "不要出现的文案 / 元素",
  materialsStatus: "素材状态",
  assetLinks: "素材 / 云盘链接",
  styleKeywords: "风格关键词",
  referenceLinks: "参考案例",
  likedDirection: "喜欢的方向",
  forbiddenStyle: "禁用风格",
  brandConstraints: "品牌 / 业务限制",
  copyrightConstraints: "版权 / 法务 / 合规限制",
  technicalConstraints: "技术 / 制作限制",
  budget: "预算 / 制作成本",
  firstDraftAt: "初稿时间（北京时间）",
  feedbackAt: "反馈时间（北京时间）",
  finalAt: "最终截止时间（北京时间）",
  deadlineReason: "硬性节点 / 原因",
  decisionMaker: "最终拍板人",
  reviewers: "审核人",
  reviewerContact: "审核人联系方式",
  recipientName: "最终接收人",
  recipientContact: "接收人联系方式",
  additionalNotes: "补充说明",
};

const PROJECT_TYPES: Record<string, string> = {
  brand: "品牌 / VI",
  poster: "海报 / 平面",
  ecommerce: "电商视觉",
  uiux: "UI / UX / 网页",
  video: "视频 / 动效",
  photography: "摄影",
  event: "活动 / 展会物料",
  other: "其他",
};

const PRIORITIES: Record<string, string> = {
  low: "低",
  normal: "普通",
  high: "高",
  urgent: "紧急",
};

const SIMPLE_GROUPS: Array<{ title: string; keys: Array<keyof Answers> }> = [
  { title: "1. 布置人", keys: ["requesterName", "requesterDepartment", "requesterContact"] },
  { title: "2. 任务内容", keys: ["projectName", "projectType", "background", "objective", "targetAudience"] },
  { title: "3. 交付要求", keys: ["deliverables", "channels", "quantity", "dimensions", "formats"] },
  { title: "4. 内容与方向", keys: ["requiredContent", "forbiddenContent", "assetLinks", "referenceLinks", "likedDirection", "forbiddenStyle"] },
  { title: "5. 时间与交付链", keys: ["priority", "finalAt", "deadlineReason", "reviewers", "reviewerContact", "recipientName", "recipientContact"] },
];

const DETAILED_GROUPS: Array<{ title: string; keys: Array<keyof Answers> }> = [
  { title: "1. 布置人", keys: ["requesterName", "requesterDepartment", "requesterContact"] },
  { title: "2. 项目背景与问题", keys: ["projectName", "projectType", "background", "currentProblem"] },
  { title: "3. 目标、优先级与成功标准", keys: ["objective", "priority", "successCriteria"] },
  { title: "4. 用户与使用场景", keys: ["targetAudience", "useScenario", "channels", "displayEnvironment"] },
  { title: "5. 完整交付清单", keys: ["deliverables", "quantity", "dimensions", "formats", "versionRequirements"] },
  { title: "6. 内容与已有素材", keys: ["requiredContent", "materialsStatus", "assetLinks"] },
  { title: "7. 视觉方向与禁用项", keys: ["styleKeywords", "referenceLinks", "likedDirection", "forbiddenContent", "forbiddenStyle"] },
  { title: "8. 限制条件与预算", keys: ["brandConstraints", "copyrightConstraints", "technicalConstraints", "budget"] },
  { title: "9. 时间节点", keys: ["firstDraftAt", "feedbackAt", "finalAt", "deadlineReason"] },
  { title: "10. 决策、审核与交付", keys: ["decisionMaker", "reviewers", "reviewerContact", "recipientName", "recipientContact", "additionalNotes"] },
];

function json(errorOrData: Record<string, unknown>, status: number, headers: HeadersInit) {
  return Response.json(errorOrData, { status, headers });
}

function rateAllowed(log: Map<string, number[]>, key: string, windowMs: number, limit: number) {
  const now = Date.now();
  const recent = (log.get(key) ?? []).filter((timestamp) => now - timestamp < windowMs);
  if (recent.length >= limit) {
    log.set(key, recent);
    return false;
  }
  recent.push(now);
  log.set(key, recent);
  return true;
}

function sanitizeText(input: unknown, max = MAX_FIELD_CHARS): string {
  if (typeof input !== "string") return "";
  return input.replace(/\r\n?/g, "\n").trim().slice(0, max);
}

function sanitizeAnswers(input: unknown): Answers {
  if (!input || typeof input !== "object") return {};
  const source = input as Record<string, unknown>;
  const result: Answers = {};
  for (const key of ANSWER_KEYS) result[key] = sanitizeText(source[key]);
  return result;
}

async function secureEqual(left: string, right: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const [leftHash, rightHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(left)),
    crypto.subtle.digest("SHA-256", encoder.encode(right)),
  ]);
  const a = new Uint8Array(leftHash);
  const b = new Uint8Array(rightHash);
  let difference = a.length ^ b.length;
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    difference |= (a[index % a.length] ?? 0) ^ (b[index % b.length] ?? 0);
  }
  return difference === 0;
}

function ipFor(request: Request) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

async function parseBody(request: Request): Promise<Record<string, unknown> | null> {
  const declared = Number(request.headers.get("content-length") || "0");
  if (declared > MAX_BODY_BYTES) return null;
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) return null;
  try {
    const parsed = JSON.parse(text) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function requiredKeys(mode: TaskBriefMode): string[] {
  const common = [
    "requesterName", "requesterContact", "projectName", "projectType", "objective",
    "deliverables", "priority", "finalAt", "recipientName", "recipientContact",
  ];
  if (mode === "simple") return common;
  return [
    ...common,
    "background", "currentProblem", "successCriteria", "targetAudience", "useScenario", "channels",
    "quantity", "dimensions", "formats", "requiredContent", "materialsStatus", "styleKeywords",
    "forbiddenStyle", "brandConstraints", "deadlineReason", "decisionMaker",
  ];
}

function parseShanghaiDate(value: string): number {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return Number.NaN;
  return Date.parse(`${value}:00+08:00`);
}

function formatValue(key: string, value: string): string {
  if (key === "projectType") return PROJECT_TYPES[value] ?? value;
  if (key === "priority") return PRIORITIES[value] ?? value;
  return value;
}

async function submissionIdFor(clientRequestId: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(clientRequestId));
  const suffix = Array.from(new Uint8Array(digest).slice(0, 5))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
  const date = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Shanghai" }).replace(/-/g, "");
  return `TB-${date}-${suffix}`;
}

function emailText(input: {
  answers: Answers;
  mode: TaskBriefMode;
  language: Language;
  submissionId: string;
  submittedAt: string;
}) {
  const groups = input.mode === "simple" ? SIMPLE_GROUPS : DETAILED_GROUPS;
  const lines = [
    "COOPER. 设计任务 Brief",
    `提交编号：${input.submissionId}`,
    `问卷版本：${input.mode === "simple" ? "简单版（5题）" : "复杂版（10题）"}`,
    `填写语言：${input.language === "zh" ? "中文" : "English"}`,
    `提交时间：${input.submittedAt}（北京时间）`,
    "",
  ];

  for (const group of groups) {
    lines.push(group.title);
    for (const key of group.keys) {
      const value = input.answers[key];
      if (!value) continue;
      const label = FIELD_LABELS[key as (typeof ANSWER_KEYS)[number]] ?? key;
      lines.push(`${label}：${formatValue(key, value)}`);
    }
    lines.push("");
  }
  return lines.join("\n").trim();
}

async function sendEmail(
  env: TaskBriefWorkerEnv,
  input: { answers: Answers; mode: TaskBriefMode; language: Language; submissionId: string; clientRequestId: string }
) {
  const apiKey = env.RESEND_API_KEY?.trim();
  if (!apiKey) throw new Error("missing_resend_key");
  const recipient = env.TASK_BRIEF_TO_EMAIL?.trim() || "liangshicheng303@126.com";
  const from = env.TASK_BRIEF_FROM_EMAIL?.trim() || "Cooper Task Brief <onboarding@resend.dev>";
  const priority = PRIORITIES[input.answers.priority] ?? input.answers.priority ?? "普通";
  const subjectName = input.answers.projectName.replace(/[\r\n]+/g, " ").slice(0, 80);
  const submittedAt = new Date().toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
    hour12: false,
  });
  const requesterEmail = input.answers.requesterContact.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
  const payload: Record<string, unknown> = {
    from,
    to: recipient.split(",").map((item) => item.trim()).filter(Boolean),
    subject: `[任务布置][${priority}] ${subjectName} · ${input.answers.finalAt}`,
    text: emailText({ ...input, submittedAt }),
  };
  if (requesterEmail) payload.reply_to = requesterEmail;

  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `task-brief/${input.clientRequestId}`,
        "User-Agent": "cooper-task-brief/1.0",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("[task-brief] Resend request failed", error);
    throw new Error("resend_network");
  }
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("[task-brief] Resend failed", response.status, detail.slice(0, 300));
    const normalizedDetail = detail.toLowerCase();
    const providerReason = response.status === 403 && (
      normalizedDetail.includes("testing emails")
      || normalizedDetail.includes("own email address")
      || normalizedDetail.includes("verify a domain")
    )
      ? "recipient_restricted"
      : response.status === 403 && (
        normalizedDetail.includes("user-agent")
        || normalizedDetail.includes("error 1010")
      )
        ? "user_agent_rejected"
        : "provider_rejected";
    throw new Error(`resend_${response.status}_${providerReason}`);
  }
}

export async function handleTaskBriefRequest(
  request: Request,
  env: TaskBriefWorkerEnv,
  ctx: WorkerExecutionContext,
  headers: HeadersInit
): Promise<Response | null> {
  const pathname = new URL(request.url).pathname.replace(/\/+$/, "") || "/";
  const verifyPath = pathname.endsWith("/task-brief/verify");
  const submitPath = pathname.endsWith("/task-brief");
  if (!verifyPath && !submitPath) return null;

  if (request.method !== "POST") {
    return json({ error: "Method not allowed.", code: "METHOD_NOT_ALLOWED" }, 405, headers);
  }

  const configuredCode = env.TASK_BRIEF_ACCESS_CODE?.trim();
  if (!configuredCode) {
    return json({ error: "Task brief access is not configured.", code: "SERVICE_NOT_CONFIGURED" }, 503, headers);
  }

  const ip = ipFor(request);
  if (verifyPath && !rateAllowed(verifyRateLog, ip, VERIFY_WINDOW_MS, VERIFY_LIMIT)) {
    return json({ error: "Too many attempts.", code: "RATE_LIMITED" }, 429, headers);
  }
  if (submitPath && !rateAllowed(submitRateLog, ip, SUBMIT_WINDOW_MS, SUBMIT_LIMIT)) {
    return json({ error: "Too many submissions.", code: "RATE_LIMITED" }, 429, headers);
  }

  const body = await parseBody(request);
  if (!body) return json({ error: "Invalid or oversized JSON body.", code: "INVALID_PAYLOAD" }, 400, headers);

  const accessCode = sanitizeText(body.accessCode, 128);
  if (!(await secureEqual(accessCode, configuredCode))) {
    return json({ error: "Invalid access code.", code: "INVALID_ACCESS_CODE" }, 401, headers);
  }
  if (verifyPath) return json({ ok: true }, 200, headers);

  const mode: TaskBriefMode = body.mode === "detailed" ? "detailed" : body.mode === "simple" ? "simple" : "simple";
  const language: Language = body.language === "en" ? "en" : "zh";
  const answers = sanitizeAnswers(body.answers);
  const clientRequestId = sanitizeText(body.clientRequestId, 128).replace(/[^a-zA-Z0-9_-]/g, "");
  const submissionId = await submissionIdFor(clientRequestId || crypto.randomUUID());

  if (sanitizeText(body.company, 200)) {
    return json({ ok: true, submissionId }, 200, headers);
  }

  const startedAt = typeof body.startedAt === "number" ? body.startedAt : 0;
  if (!startedAt || Date.now() - startedAt < MIN_FILL_MS) {
    return json({ error: "Form submitted too quickly.", code: "TOO_FAST" }, 429, headers);
  }
  if (body.consent !== true || !clientRequestId) {
    return json({ error: "Consent and clientRequestId are required.", code: "VALIDATION_ERROR" }, 400, headers);
  }

  const missing = requiredKeys(mode).filter((key) => !answers[key]);
  if (missing.length > 0) {
    return json({ error: "Missing required fields.", code: "VALIDATION_ERROR", fields: missing }, 400, headers);
  }

  const finalTimestamp = parseShanghaiDate(answers.finalAt);
  if (!Number.isFinite(finalTimestamp) || finalTimestamp < Date.now() - 5 * 60 * 1000) {
    return json({ error: "Final deadline is in the past.", code: "PAST_DEADLINE" }, 400, headers);
  }

  if (!env.RESEND_API_KEY?.trim()) {
    return json({ error: "Email delivery is not configured.", code: "SERVICE_NOT_CONFIGURED" }, 503, headers);
  }

  try {
    await sendEmail(env, { answers, mode, language, submissionId, clientRequestId });
    return json({ ok: true, submissionId }, 200, headers);
  } catch (error) {
    const providerStatus = error instanceof Error
      ? Number(error.message.match(/^resend_(\d{3})_/)?.[1]) || undefined
      : undefined;
    const providerReason = error instanceof Error
      ? error.message.match(/^resend_\d{3}_(recipient_restricted|user_agent_rejected|provider_rejected)$/)?.[1]
      : undefined;
    const providerReachable = !(error instanceof Error && error.message === "resend_network");
    return json(
      {
        error: "Email delivery failed.",
        code: "EMAIL_DELIVERY_FAILED",
        providerStatus,
        providerReason,
        providerReachable,
      },
      502,
      headers
    );
  }
}

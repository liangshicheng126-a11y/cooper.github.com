import type { Language } from "@/locales/translations";
import type { TaskBriefAnswers, TaskBriefMode } from "@/lib/taskBrief";

export type TaskBriefField = {
  key: keyof TaskBriefAnswers;
  label: string;
  hint?: string;
  placeholder?: string;
  type?: "text" | "textarea" | "select" | "datetime";
  required?: boolean;
  rows?: number;
  options?: Array<{ value: string; label: string }>;
};

export type TaskBriefStep = {
  title: string;
  description: string;
  fields: TaskBriefField[];
};

const projectTypes = (language: Language) => [
  { value: "brand", label: language === "zh" ? "品牌 / VI" : "Brand / VI" },
  { value: "poster", label: language === "zh" ? "海报 / 平面" : "Poster / Graphic" },
  { value: "ecommerce", label: language === "zh" ? "电商视觉" : "E-commerce Visual" },
  { value: "uiux", label: language === "zh" ? "UI / UX / 网页" : "UI / UX / Web" },
  { value: "video", label: language === "zh" ? "视频 / 动效" : "Video / Motion" },
  { value: "photography", label: language === "zh" ? "摄影" : "Photography" },
  { value: "event", label: language === "zh" ? "活动 / 展会物料" : "Event / Exhibition" },
  { value: "other", label: language === "zh" ? "其他" : "Other" },
];

const priorities = (language: Language) => [
  { value: "low", label: language === "zh" ? "低 — 可灵活排期" : "Low — flexible" },
  { value: "normal", label: language === "zh" ? "普通" : "Normal" },
  { value: "high", label: language === "zh" ? "高 — 有明确节点" : "High — fixed milestone" },
  { value: "urgent", label: language === "zh" ? "紧急 — 需要优先处理" : "Urgent — prioritize" },
];

function zhSteps(mode: TaskBriefMode): TaskBriefStep[] {
  const common = {
    requester: {
      title: "谁来布置这个任务？",
      description: "留下可直接沟通的信息，避免关键问题找不到确认人。",
      fields: [
        { key: "requesterName", label: "布置人姓名", placeholder: "例如：王经理", required: true },
        { key: "requesterDepartment", label: "部门 / 角色", placeholder: "例如：市场部 / 项目负责人" },
        { key: "requesterContact", label: "联系方式", hint: "邮箱、手机号或微信，至少一种", placeholder: "例如：138… / 微信… / name@company.com", required: true },
      ],
    } satisfies TaskBriefStep,
    delivery: {
      title: "最终要交付什么？",
      description: "把数量、尺寸和文件格式尽量说具体。",
      fields: [
        { key: "deliverables", label: "交付内容", placeholder: "例如：主海报1张、社媒延展3张", type: "textarea", rows: 3, required: true },
        { key: "channels", label: "使用渠道", placeholder: "例如：公众号、线下灯箱、Amazon详情页" },
        { key: "quantity", label: "数量 / 版本", placeholder: "例如：中英双语各1版" },
        { key: "dimensions", label: "尺寸 / 比例", placeholder: "例如：1080×1440 px、A3竖版" },
        { key: "formats", label: "文件格式", placeholder: "例如：JPG、PNG、PDF、AI源文件" },
      ],
    } satisfies TaskBriefStep,
  };

  if (mode === "simple") {
    return [
      common.requester,
      {
        title: "这个任务要解决什么？",
        description: "说清任务、目标和给谁看，比只说“做得好看”更有效。",
        fields: [
          { key: "projectName", label: "任务名称", placeholder: "例如：2026新品发布主视觉", required: true },
          { key: "projectType", label: "设计类型", type: "select", options: projectTypes("zh"), required: true },
          { key: "background", label: "任务背景", placeholder: "为什么现在需要做这项设计？", type: "textarea", rows: 3 },
          { key: "objective", label: "希望达到的目标", placeholder: "例如：让经销商快速理解新品卖点", type: "textarea", rows: 3, required: true },
          { key: "targetAudience", label: "主要给谁看？", placeholder: "例如：北美暖通行业采购负责人" },
        ],
      },
      common.delivery,
      {
        title: "哪些内容要出现，哪些不要出现？",
        description: "明确必选项和禁用项，并提供已有素材与参考方向。",
        fields: [
          { key: "requiredContent", label: "必须出现的文案 / 元素", placeholder: "Logo、产品型号、主标题、二维码等", type: "textarea", rows: 3 },
          { key: "forbiddenContent", label: "不要出现的元素", placeholder: "禁用的文字、颜色、图形、人物或表达", type: "textarea", rows: 3 },
          { key: "assetLinks", label: "已有素材 / 云盘链接", placeholder: "请确认链接权限可访问", type: "textarea", rows: 2 },
          { key: "referenceLinks", label: "参考案例", placeholder: "可填写链接，并说明参考哪一点", type: "textarea", rows: 2 },
          { key: "likedDirection", label: "喜欢的风格", placeholder: "例如：克制、专业、有工业质感" },
          { key: "forbiddenStyle", label: "禁止的风格", placeholder: "例如：不要卡通、不要高饱和渐变" },
        ],
      },
      {
        title: "什么时候完成，交给谁？",
        description: "截止时间、审核人与最终接收人都要明确。",
        fields: [
          { key: "priority", label: "优先级", type: "select", options: priorities("zh"), required: true },
          { key: "finalAt", label: "成品截止时间（北京时间）", type: "datetime", required: true },
          { key: "deadlineReason", label: "硬性节点 / 原因", placeholder: "例如：8月20日展会搭建，不能延期" },
          { key: "reviewers", label: "审核人", placeholder: "谁负责提出修改意见？" },
          { key: "reviewerContact", label: "审核人联系方式", placeholder: "可选" },
          { key: "recipientName", label: "最终接收人", placeholder: "成品最终交付给谁？", required: true },
          { key: "recipientContact", label: "接收人联系方式", placeholder: "邮箱、手机号或微信", required: true },
        ],
      },
    ];
  }

  return [
    common.requester,
    {
      title: "项目背景与问题",
      description: "说明为什么要做，以及当前到底卡在哪里。",
      fields: [
        { key: "projectName", label: "项目名称", required: true },
        { key: "projectType", label: "设计类型", type: "select", options: projectTypes("zh"), required: true },
        { key: "background", label: "项目背景", type: "textarea", rows: 4, required: true },
        { key: "currentProblem", label: "当前需要解决的问题", type: "textarea", rows: 3, required: true },
      ],
    },
    {
      title: "目标、优先级与成功标准",
      description: "告诉设计师什么结果才算完成，而不只是输出文件。",
      fields: [
        { key: "objective", label: "项目目标", type: "textarea", rows: 3, required: true },
        { key: "priority", label: "优先级", type: "select", options: priorities("zh"), required: true },
        { key: "successCriteria", label: "成功标准", placeholder: "例如：首屏能在3秒内讲清核心卖点", type: "textarea", rows: 3, required: true },
      ],
    },
    {
      title: "用户与使用场景",
      description: "同一个设计在手机、展会或销售演示中需要不同处理。",
      fields: [
        { key: "targetAudience", label: "目标用户", type: "textarea", rows: 3, required: true },
        { key: "useScenario", label: "使用场景", type: "textarea", rows: 3, required: true },
        { key: "channels", label: "发布渠道", placeholder: "官网、社媒、电商、印刷、展会等", required: true },
        { key: "displayEnvironment", label: "展示环境", placeholder: "手机屏、会议大屏、户外灯箱等" },
      ],
    },
    {
      title: "完整交付清单",
      description: "逐项列明数量、尺寸、平台、格式与版本。",
      fields: [
        { key: "deliverables", label: "交付内容", type: "textarea", rows: 4, required: true },
        { key: "quantity", label: "数量", required: true },
        { key: "dimensions", label: "尺寸 / 比例 / 平台规格", required: true },
        { key: "formats", label: "文件格式", required: true },
        { key: "versionRequirements", label: "版本要求", placeholder: "横竖版、多语言、深浅色、源文件等" },
      ],
    },
    {
      title: "内容与已有素材",
      description: "确认哪些内容已经准备好，哪些仍需补充。",
      fields: [
        { key: "requiredContent", label: "必须出现的文案 / 元素", type: "textarea", rows: 3, required: true },
        { key: "materialsStatus", label: "Logo、图片、文案、品牌规范等素材状态", type: "textarea", rows: 3, required: true },
        { key: "assetLinks", label: "素材 / 云盘链接", hint: "请确认链接权限可访问", type: "textarea", rows: 2 },
      ],
    },
    {
      title: "视觉方向与禁用项",
      description: "既说明想要什么，也明确不要什么。",
      fields: [
        { key: "styleKeywords", label: "风格关键词", placeholder: "3–5个词", required: true },
        { key: "referenceLinks", label: "参考案例与原因", type: "textarea", rows: 3 },
        { key: "likedDirection", label: "喜欢的方向", type: "textarea", rows: 2 },
        { key: "forbiddenContent", label: "不要出现的文案 / 元素", type: "textarea", rows: 2 },
        { key: "forbiddenStyle", label: "明确禁用的风格", type: "textarea", rows: 2, required: true },
      ],
    },
    {
      title: "限制条件与预算",
      description: "没有限制的项目也请填写“无”或“不适用”。",
      fields: [
        { key: "brandConstraints", label: "品牌与业务限制", type: "textarea", rows: 2, required: true },
        { key: "copyrightConstraints", label: "版权 / 法务 / 合规限制", type: "textarea", rows: 2 },
        { key: "technicalConstraints", label: "技术与制作限制", type: "textarea", rows: 2 },
        { key: "budget", label: "预算或制作成本范围", placeholder: "无 / 不适用 / 预算区间" },
      ],
    },
    {
      title: "时间节点",
      description: "给初稿、反馈和定稿留出真实可执行的时间。",
      fields: [
        { key: "firstDraftAt", label: "初稿时间（北京时间）", type: "datetime" },
        { key: "feedbackAt", label: "集中反馈时间（北京时间）", type: "datetime" },
        { key: "finalAt", label: "最终截止时间（北京时间）", type: "datetime", required: true },
        { key: "deadlineReason", label: "硬性节点 / 原因", type: "textarea", rows: 2, required: true },
      ],
    },
    {
      title: "决策、审核与交付",
      description: "明确谁拍板、谁提意见，以及成品最终交给谁。",
      fields: [
        { key: "decisionMaker", label: "最终拍板人", required: true },
        { key: "reviewers", label: "参与审核者" },
        { key: "reviewerContact", label: "审核人联系方式" },
        { key: "recipientName", label: "最终接收人", required: true },
        { key: "recipientContact", label: "接收人联系方式", required: true },
        { key: "additionalNotes", label: "补充说明", type: "textarea", rows: 3 },
      ],
    },
  ];
}

function enSteps(mode: TaskBriefMode): TaskBriefStep[] {
  const translateField = (
    key: keyof TaskBriefAnswers,
    label: string,
    options: Partial<TaskBriefField> = {}
  ): TaskBriefField => ({ key, label, ...options });

  const requester: TaskBriefStep = {
    title: "Who is assigning this task?",
    description: "Add direct contact details so decisions never stall.",
    fields: [
      translateField("requesterName", "Requester name", { required: true }),
      translateField("requesterDepartment", "Department / role"),
      translateField("requesterContact", "Contact", { hint: "Email, phone, or WeChat", required: true }),
    ],
  };

  const delivery: TaskBriefStep = {
    title: "What must be delivered?",
    description: "Be specific about quantity, size, and file formats.",
    fields: [
      translateField("deliverables", "Deliverables", { type: "textarea", rows: 3, required: true }),
      translateField("channels", "Channels / placements"),
      translateField("quantity", "Quantity / versions"),
      translateField("dimensions", "Dimensions / aspect ratios"),
      translateField("formats", "File formats"),
    ],
  };

  if (mode === "simple") {
    return [
      requester,
      {
        title: "What should this task solve?",
        description: "Define the task, goal, and audience—not only how it should look.",
        fields: [
          translateField("projectName", "Task name", { required: true }),
          translateField("projectType", "Design type", { type: "select", options: projectTypes("en"), required: true }),
          translateField("background", "Background", { type: "textarea", rows: 3 }),
          translateField("objective", "Goal", { type: "textarea", rows: 3, required: true }),
          translateField("targetAudience", "Primary audience"),
        ],
      },
      delivery,
      {
        title: "What must—or must not—appear?",
        description: "List required and forbidden content, plus available assets and references.",
        fields: [
          translateField("requiredContent", "Required copy / elements", { type: "textarea", rows: 3 }),
          translateField("forbiddenContent", "Elements that must not appear", { type: "textarea", rows: 3 }),
          translateField("assetLinks", "Available assets / drive links", { type: "textarea", rows: 2 }),
          translateField("referenceLinks", "References", { type: "textarea", rows: 2 }),
          translateField("likedDirection", "Preferred style"),
          translateField("forbiddenStyle", "Forbidden style"),
        ],
      },
      {
        title: "When is it due, and who receives it?",
        description: "Confirm the deadline, reviewer, and final recipient.",
        fields: [
          translateField("priority", "Priority", { type: "select", options: priorities("en"), required: true }),
          translateField("finalAt", "Final deadline (China Standard Time)", { type: "datetime", required: true }),
          translateField("deadlineReason", "Fixed milestone / reason"),
          translateField("reviewers", "Reviewer"),
          translateField("reviewerContact", "Reviewer contact"),
          translateField("recipientName", "Final recipient", { required: true }),
          translateField("recipientContact", "Recipient contact", { required: true }),
        ],
      },
    ];
  }

  return [
    requester,
    { title: "Project background and problem", description: "Explain why this is needed and what is not working today.", fields: [translateField("projectName", "Project name", { required: true }), translateField("projectType", "Design type", { type: "select", options: projectTypes("en"), required: true }), translateField("background", "Project background", { type: "textarea", rows: 4, required: true }), translateField("currentProblem", "Problem to solve", { type: "textarea", rows: 3, required: true })] },
    { title: "Goal, priority, and success", description: "Define the outcome—not only the files.", fields: [translateField("objective", "Project goal", { type: "textarea", rows: 3, required: true }), translateField("priority", "Priority", { type: "select", options: priorities("en"), required: true }), translateField("successCriteria", "Success criteria", { type: "textarea", rows: 3, required: true })] },
    { title: "Audience and context", description: "A phone screen, trade show, and sales deck need different solutions.", fields: [translateField("targetAudience", "Target audience", { type: "textarea", rows: 3, required: true }), translateField("useScenario", "Use scenario", { type: "textarea", rows: 3, required: true }), translateField("channels", "Publishing channels", { required: true }), translateField("displayEnvironment", "Display environment")] },
    { title: "Complete deliverable list", description: "List quantity, dimensions, platform, formats, and versions.", fields: [translateField("deliverables", "Deliverables", { type: "textarea", rows: 4, required: true }), translateField("quantity", "Quantity", { required: true }), translateField("dimensions", "Dimensions / platform specs", { required: true }), translateField("formats", "File formats", { required: true }), translateField("versionRequirements", "Version requirements")] },
    { title: "Content and available assets", description: "Confirm what is ready and what still needs to be supplied.", fields: [translateField("requiredContent", "Required copy / elements", { type: "textarea", rows: 3, required: true }), translateField("materialsStatus", "Status of logos, images, copy, and guidelines", { type: "textarea", rows: 3, required: true }), translateField("assetLinks", "Asset / drive links", { type: "textarea", rows: 2 })] },
    { title: "Visual direction and exclusions", description: "State both what you want and what must be avoided.", fields: [translateField("styleKeywords", "Style keywords", { required: true }), translateField("referenceLinks", "References and reasons", { type: "textarea", rows: 3 }), translateField("likedDirection", "Preferred direction", { type: "textarea", rows: 2 }), translateField("forbiddenContent", "Copy / elements that must not appear", { type: "textarea", rows: 2 }), translateField("forbiddenStyle", "Forbidden styles", { type: "textarea", rows: 2, required: true })] },
    { title: "Constraints and budget", description: "Enter “None” or “Not applicable” when there is no constraint.", fields: [translateField("brandConstraints", "Brand / business constraints", { type: "textarea", rows: 2, required: true }), translateField("copyrightConstraints", "Copyright / legal constraints", { type: "textarea", rows: 2 }), translateField("technicalConstraints", "Technical / production constraints", { type: "textarea", rows: 2 }), translateField("budget", "Budget / production cost range")] },
    { title: "Timeline", description: "Leave realistic time for drafts, feedback, and final delivery.", fields: [translateField("firstDraftAt", "First draft (China Standard Time)", { type: "datetime" }), translateField("feedbackAt", "Consolidated feedback (China Standard Time)", { type: "datetime" }), translateField("finalAt", "Final deadline (China Standard Time)", { type: "datetime", required: true }), translateField("deadlineReason", "Fixed milestone / reason", { type: "textarea", rows: 2, required: true })] },
    { title: "Decision, review, and handoff", description: "Clarify who approves, who comments, and who receives the final files.", fields: [translateField("decisionMaker", "Final decision maker", { required: true }), translateField("reviewers", "Reviewers"), translateField("reviewerContact", "Reviewer contact"), translateField("recipientName", "Final recipient", { required: true }), translateField("recipientContact", "Recipient contact", { required: true }), translateField("additionalNotes", "Additional notes", { type: "textarea", rows: 3 })] },
  ];
}

export function getTaskBriefSteps(language: Language, mode: TaskBriefMode): TaskBriefStep[] {
  return language === "zh" ? zhSteps(mode) : enSteps(mode);
}

export function displayTaskBriefValue(field: TaskBriefField, value: string): string {
  return field.options?.find((option) => option.value === value)?.label ?? value;
}

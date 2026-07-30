/**
 * Exact FAQ answers for XiaoCoo suggestion chips / matching questions.
 * Prefer these over the LLM so production replies stay on-script.
 */

export type CannedReply = {
  /** Match keys (normalized): suggestion label + common aliases */
  keys: string[];
  answer: string;
};

function normalizeQuestion(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[？?！!。．\s]/g, "")
    .replace(/上一[家个]/g, "上家")
    .replace(/一下你自己/g, "你自己")
    .replace(/介绍一下你自己/g, "介绍你自己");
}

/** Canonical answers — items 1 / 3 / 4 / 5 / 7 / 10 from the brief */
export const XIAOCOO_CANNED_REPLIES: CannedReply[] = [
  {
    keys: [
      "用一分钟介绍一下你自己",
      "用一分钟介绍你自己",
      "介绍一下你自己",
      "自我介绍",
      "introduce yourself in one minute",
      "introduce yourself",
    ],
    answer: `Hi，我是 Cooper，韩国设计学硕士，一个融合设计师。
具备从产品拍摄-视觉分析-平面设计-视频剪辑-品牌网站建立的全链路落地能力。不只是P图，而是能从产品卖点出发，分析市场需要什么；客户为什么停留；为什么买单；平台为什么推荐，为此优化整个项目的视觉体系。
我是一个实干型设计师，强调执行力和实用性，我希望设计不只是停留在好看的层面，而是真正能被用户看到和理解，并服务于产品转化，变为一个记忆锚点，为可落地的灵感而设计。`,
  },
  {
    keys: [
      "你的核心技能和常用工具是什么？",
      "你的核心技能和常用工具是什么",
      "核心技能",
      "常用工具",
      "what are your core skills and tools",
      "core skills",
    ],
    answer: `我的核心能力是品牌与产品视觉的全链路落地：产品拍摄、视觉分析、平面设计、视频剪辑、品牌网站，以及电商转化视觉（含 Amazon 详情页）。

常用工具：
- 设计与后期：Photoshop / Illustrator / Figma / PR / 剪映 / PS AI
- AI 工作流：ChatGPT / Claude / Codex / Cursor、Midjourney、Nano Banana

不只是「做得好看」，更关注卖点传达、停留与转化，以及平台为什么推荐。`,
  },
  {
    keys: [
      "平时是怎么工作的",
      "平时怎么工作",
      "你平时怎么工作",
      "ai工作流",
      "how do you usually work",
      "how do you work",
    ],
    answer: `第一阶段：灵感与方案策划（效率提升）
工具：ChatGPT / Claude / Codex / Cursor
应用：在项目初期，我利用 ChatGPT / Codex 进行竞品分析和视觉风格调研，快速梳理品牌调性，在几分钟内生成多种风格构思，与团队快速对齐视觉方向，避免了传统找图、拼贴的繁琐过程。

第二阶段：素材生成与资产构建（成本优化）
工具：Midjourney (V6.1) / Nano Banana
应用：针对产品拍摄中难以实现的场景（如复杂、昂贵的布景），我利用 Midjourney 生成高质量的场景底图，再通过 Photoshop 将产品与 AI 生成的环境进行无缝融合，并对大致方向进行二次优化。这极大降低了外拍成本，同时保证了视觉质感。

第三阶段：后期精修与延展（质量把控）
工具：PS AI
应用：在后期环节，我调用 Cursor 的图像 skill 和 MCP 在 PS 和 AI 中进行快速的画面延展和瑕疵修复，将原本需要数小时的修图工作缩短至分钟级，让我有更多精力投入到品牌策略和视觉逻辑的思考中。

我的 AI 工作流并不是为了替代设计，而是为了释放设计。通过 AI，我将原本耗费在重复性执行工作（如抠图、修图、找素材）上的时间，转移到了品牌视觉逻辑的构建和用户心理的洞察上。这使得我能够以更低的成本、更快的速度，产出更具商业竞争力的视觉内容。`,
  },
  {
    keys: [
      "未来的规划",
      "未来规划",
      "你的未来规划",
      "what are your future plans",
      "future plans",
    ],
    answer: `我希望自己不仅是一个「做设计的人」，更是一个「解决问题的人」。
短期内，我会继续在视觉设计和内容落地上积累经验，提升项目执行效率和输出质量；中长期则希望在品牌视觉、商业转化和用户沟通方面形成更系统的方法论，成长为能够带领团队推动项目结果的设计师。
我希望自己的设计能力，不只是停留在表现层面，而是能够真正服务于品牌成长和产品价值传达。通过将 AI 工具深度融入产品拍摄、平面制作、视频剪辑等工作流，提升效率与创意产出质量，将设计流程标准化、高效化。让设计成为公司核心竞争力的重要组成部分。`,
  },
  {
    keys: [
      "为什么从上家公司离职",
      "为什么从上一家公司离职",
      "为什么离职",
      "离职原因",
      "why did you leave your last company",
      "why leave last company",
    ],
    answer: `在上一家公司积累了扎实的全链路落地经验后，我意识到设计不仅是执行，更需要深厚的审美积淀与全球化的视野。为了突破现有的职业瓶颈，我选择前往韩国深造设计学硕士。这段经历不仅让我系统性地提升了设计理论与审美高度，更让我学会了如何从国际化的视角去审视品牌与市场，从而为后续回国后的实战工作打下了更坚实的理论基础。`,
  },
  {
    keys: [
      "目前在哪里",
      "你在哪里",
      "你在哪",
      "where are you now",
      "where are you",
    ],
    answer: `Cooper 的家乡在浙江，但是喜欢探索地球，有可能刷新在山野中，小coo 建议您与本人联系哦。
邮箱：liangshicheng303@126.com
微信：llqsc1122`,
  },
  {
    keys: [
      "爱伦阀门",
      "爱伦阀门经历",
      "上家公司做什么",
      "ellen valve",
    ],
    answer: `核心职责：产品视觉设计师
负责品牌全链路视觉输出，通过视觉策略提升产品市场竞争力：
视觉营销与转化：负责亚马逊（Amazon）详情页设计，通过深度挖掘产品卖点，优化视觉转化路径，提升点击率与转化率。
品牌视觉体系：统筹产品拍摄、海报设计及展会物料制作，确保品牌在多渠道（线上电商+线下展会）的视觉呈现高度统一。
多媒体内容创作：负责工厂宣传视频的策划、拍摄与剪辑，通过动态视觉语言强化品牌背书，提升用户信任感。`,
  },
];

export function findCannedReply(question: string): string | null {
  const q = normalizeQuestion(question);
  if (!q) return null;
  for (const item of XIAOCOO_CANNED_REPLIES) {
    for (const key of item.keys) {
      const k = normalizeQuestion(key);
      if (!k) continue;
      if (q === k || q.includes(k) || k.includes(q)) return item.answer;
    }
  }
  return null;
}

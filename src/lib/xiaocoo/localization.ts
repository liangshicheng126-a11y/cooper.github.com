import type { Language } from "@/locales/config";

export type ChatErrorCode =
  | "QUOTA_EXCEEDED"
  | "RATE_LIMITED"
  | "SERVICE_UNAVAILABLE"
  | "INVALID_REQUEST"
  | "VISITOR_REQUIRED"
  | "UPSTREAM_ERROR"
  | "UNEXPECTED_ERROR"
  | "NETWORK_ERROR";

const languageInstructions: Record<Language, string> = {
  zh: "请使用简体中文回答。仅在用户明确要求其他语言时切换；知识库或历史消息的语言不应覆盖当前语言选择。",
  en: "Reply in English. Switch only if the user explicitly requests another language; the language of the knowledge base or earlier messages must not override this selection.",
  ja: "日本語で回答してください。ユーザーが明示的に別の言語を指定した場合のみ切り替え、知識ベースや過去のメッセージの言語で現在の選択を上書きしないでください。",
  ko: "한국어로 답변하세요. 사용자가 다른 언어를 명시적으로 요청할 때만 전환하고, 지식 베이스나 이전 메시지의 언어가 현재 선택을 덮어쓰지 않도록 하세요.",
};

const errorMessages: Record<Language, Record<ChatErrorCode, string>> = {
  zh: {
    QUOTA_EXCEEDED: "今天这台设备/该访客名的小coo 问答额度已用完（约 ¥1/天）。可通过其他渠道联系本人：邮箱 liangshicheng303@126.com · 微信 llqsc1122。",
    RATE_LIMITED: "提问太频繁了，请稍等片刻再试。",
    SERVICE_UNAVAILABLE: "小coo 暂时无法连接，请稍后重试，或通过页脚的联系方式联系我。",
    INVALID_REQUEST: "未能读取这次提问，请检查内容后重新发送。",
    VISITOR_REQUIRED: "请先填写访客称呼，再开始聊天。",
    UPSTREAM_ERROR: "这次回答暂时无法生成，请稍后重试。",
    UNEXPECTED_ERROR: "小coo 暂时遇到问题，请稍后重试。",
    NETWORK_ERROR: "连接中断，请检查网络后重新发送。",
  },
  en: {
    QUOTA_EXCEEDED: "Today's XiaoCoo chat quota for this device/name is used up (≈¥1/day). Please reach out directly: email liangshicheng303@126.com · WeChat llqsc1122.",
    RATE_LIMITED: "You're sending questions too quickly. Please wait a moment and try again.",
    SERVICE_UNAVAILABLE: "XiaoCoo is temporarily unavailable. Please try again later or use the contact details in the footer.",
    INVALID_REQUEST: "This question could not be read. Please check it and send it again.",
    VISITOR_REQUIRED: "Please enter a visitor name before starting the chat.",
    UPSTREAM_ERROR: "This reply could not be generated. Please try again shortly.",
    UNEXPECTED_ERROR: "XiaoCoo has encountered a temporary problem. Please try again later.",
    NETWORK_ERROR: "The connection was interrupted. Please check your network and send your question again.",
  },
  ja: {
    QUOTA_EXCEEDED: "この端末・訪問者名での本日の小cooの利用上限（約1人民元／日）に達しました。直接ご連絡ください：メール liangshicheng303@126.com · WeChat llqsc1122。",
    RATE_LIMITED: "質問の送信間隔が短すぎます。少し待ってから、もう一度お試しください。",
    SERVICE_UNAVAILABLE: "現在、小cooに接続できません。時間をおいて再度お試しいただくか、フッターの連絡先からご連絡ください。",
    INVALID_REQUEST: "質問を読み取れませんでした。内容を確認して、もう一度送信してください。",
    VISITOR_REQUIRED: "チャットを始める前に、お名前またはニックネームを入力してください。",
    UPSTREAM_ERROR: "回答を生成できませんでした。少し待ってから、もう一度お試しください。",
    UNEXPECTED_ERROR: "小cooで一時的な問題が発生しました。時間をおいて、もう一度お試しください。",
    NETWORK_ERROR: "接続が切れました。ネットワークを確認して、質問をもう一度送信してください。",
  },
  ko: {
    QUOTA_EXCEEDED: "이 기기와 방문자 이름의 오늘 XiaoCoo 이용 한도(하루 약 1위안)에 도달했습니다. 직접 연락해 주세요: 이메일 liangshicheng303@126.com · WeChat llqsc1122.",
    RATE_LIMITED: "질문을 너무 빠르게 보내고 있습니다. 잠시 기다린 후 다시 시도해 주세요.",
    SERVICE_UNAVAILABLE: "현재 XiaoCoo에 연결할 수 없습니다. 나중에 다시 시도하거나 페이지 하단의 연락처로 연락해 주세요.",
    INVALID_REQUEST: "질문을 읽을 수 없습니다. 내용을 확인한 후 다시 보내 주세요.",
    VISITOR_REQUIRED: "채팅을 시작하기 전에 이름이나 닉네임을 입력해 주세요.",
    UPSTREAM_ERROR: "답변을 생성하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    UNEXPECTED_ERROR: "XiaoCoo에 일시적인 문제가 발생했습니다. 나중에 다시 시도해 주세요.",
    NETWORK_ERROR: "연결이 끊겼습니다. 네트워크를 확인한 후 질문을 다시 보내 주세요.",
  },
};

export function chatLanguageInstruction(language: Language): string {
  return languageInstructions[language];
}

export function chatErrorMessage(language: Language, code: ChatErrorCode): string {
  return errorMessages[language][code];
}

/** Also handles older endpoints that do not yet provide a stable error code. */
export function chatErrorCode(status: number, code?: unknown): ChatErrorCode {
  if (typeof code === "string" && Object.prototype.hasOwnProperty.call(errorMessages.zh, code)) {
    return code as ChatErrorCode;
  }
  if (status === 429) return "RATE_LIMITED";
  if (status === 400) return "INVALID_REQUEST";
  if (status === 503 || status === 404) return "SERVICE_UNAVAILABLE";
  if (status === 502 || status === 504) return "UPSTREAM_ERROR";
  return "UNEXPECTED_ERROR";
}

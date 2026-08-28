import { getLanguageOption, type Language } from "./config";

export const mediaTranslations = {
  zh: {
    previousPhoto: "上一张照片", nextPhoto: "下一张照片",
    previousVideo: "上一个视频", nextVideo: "下一个视频",
    videoUnavailable: "当前视频源不支持站内播放，请使用下方链接在原平台观看。",
    videoTitles: ["恐惧是生物的本能", "色彩重启剪辑"],
    projectNotFound: "未找到项目", unknown: "未知",
    photoStackLabel: "拖动、点击或按 Enter 浏览 Cooper 的照片",
    aboutPhotos: ["Cooper 在雪山之中", "户外攀冰", "Cooper 手持双冰镐攀冰", "Cooper 身着户外装备面向山脊", "Cooper 在高山草甸中休息"],
  },
  en: {
    previousPhoto: "Previous photo", nextPhoto: "Next photo",
    previousVideo: "Previous video", nextVideo: "Next video",
    videoUnavailable: "This video cannot be played here. Use the link below to watch it on the original platform.",
    videoTitles: ["Fear Is a Biological Instinct", "Color Reboot Edit"],
    projectNotFound: "Project Not Found", unknown: "Unknown",
    photoStackLabel: "Drag, click, or press Enter to browse Cooper's photo stack",
    aboutPhotos: ["Cooper in a snowy mountain landscape", "Ice climbing outdoors", "Cooper ice climbing with two ice axes", "Cooper facing a mountain ridge in outdoor gear", "Cooper resting in a mountain meadow"],
  },
  ja: {
    previousPhoto: "前の写真", nextPhoto: "次の写真",
    previousVideo: "前の動画", nextVideo: "次の動画",
    videoUnavailable: "この動画はサイト内で再生できません。下のリンクから元のプラットフォームでご覧ください。",
    videoTitles: ["恐怖は生物の本能", "カラー・リブート — 動画編集"],
    projectNotFound: "プロジェクトが見つかりません", unknown: "不明",
    photoStackLabel: "ドラッグ、クリック、または Enter キーで Cooper の写真を切り替え",
    aboutPhotos: ["雪山の風景の中にいる Cooper", "屋外でのアイスクライミング", "2本のアイスアックスで氷壁を登る Cooper", "アウトドアウェアを着て山の稜線を見つめる Cooper", "山の草原で休憩する Cooper"],
  },
  ko: {
    previousPhoto: "이전 사진", nextPhoto: "다음 사진",
    previousVideo: "이전 영상", nextVideo: "다음 영상",
    videoUnavailable: "이 영상은 사이트 내에서 재생할 수 없습니다. 아래 링크로 원본 플랫폼에서 시청해 주세요.",
    videoTitles: ["두려움은 생물의 본능", "컬러 리부트 영상 편집"],
    projectNotFound: "프로젝트를 찾을 수 없습니다", unknown: "알 수 없음",
    photoStackLabel: "드래그, 클릭 또는 Enter 키로 Cooper의 사진을 넘겨보세요",
    aboutPhotos: ["눈 덮인 산에 있는 Cooper", "야외 빙벽 등반", "두 개의 아이스 액스로 빙벽을 오르는 Cooper", "아웃도어 장비를 입고 산 능선을 바라보는 Cooper", "산속 초원에서 쉬고 있는 Cooper"],
  },
};

const places: Record<string, Record<Language, string>> = {
  "wei hai": { zh: "威海", en: "Wei Hai", ja: "威海", ko: "웨이하이" },
  jeju: { zh: "济州", en: "Jeju", ja: "済州", ko: "제주" },
  orlando: { zh: "奥兰多", en: "Orlando", ja: "オーランド", ko: "올랜도" },
  malaysia: { zh: "马来西亚", en: "Malaysia", ja: "マレーシア", ko: "말레이시아" },
  arizona: { zh: "亚利桑那", en: "Arizona", ja: "アリゾナ", ko: "애리조나" },
  "xi ning": { zh: "西宁", en: "Xi Ning", ja: "西寧", ko: "시닝" },
};

export function formatGalleryLocation(value: string, language: Language) {
  const key = value.trim().toLowerCase();
  if (key === "unknown") return mediaTranslations[language].unknown;
  return places[key]?.[language] ?? value;
}

export function formatGalleryDate(value: string, language: Language) {
  if (value.toLowerCase() === "unknown") return mediaTranslations[language].unknown;
  const match = value.trim().match(/^([A-Za-z]{3})\s+(\d{1,2})$/);
  if (!match) return value;
  // Some original folder names use OTC; normalize its display without renaming media.
  const monthName = match[1].toUpperCase().replace(/^OTC$/, "OCT");
  const month = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"].indexOf(monthName);
  const day = Number(match[2]);
  if (month < 0 || day < 1 || day > 31) return value;
  const date = new Date(Date.UTC(2000, month, day));
  if (date.getUTCMonth() !== month) return value;
  return new Intl.DateTimeFormat(getLanguageOption(language).locale, {
    month: "short", day: "numeric", timeZone: "UTC",
  }).format(date);
}

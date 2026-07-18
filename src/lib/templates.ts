import type { EventType } from "./types";

export interface EventTypeTemplate {
  id: EventType;
  label: string;
  emoji: string;
  description: string;
  defaultCategories: { label: string; color: string; icon: string }[];
}

export const EVENT_TYPE_TEMPLATES: EventTypeTemplate[] = [
  {
    id: "matsuri",
    label: "祭り・夏祭り",
    emoji: "🎆",
    description: "盆踊り、屋台、花火大会など",
    defaultCategories: [
      { label: "屋台・出店", color: "#e2574c", icon: "🏮" },
      { label: "ステージ・催事", color: "#e08a2f", icon: "🎤" },
      { label: "トイレ", color: "#2f7de0", icon: "🚻" },
      { label: "救護・案内", color: "#2fa85a", icon: "🚑" },
    ],
  },
  {
    id: "marche",
    label: "マルシェ・フリーマーケット",
    emoji: "🧺",
    description: "地元マルシェ、朝市、フリマなど",
    defaultCategories: [
      { label: "飲食", color: "#e08a2f", icon: "🍽️" },
      { label: "野菜・食品", color: "#2fa85a", icon: "🥬" },
      { label: "雑貨・ハンドメイド", color: "#a24fd6", icon: "🎁" },
      { label: "キッズ・ワークショップ", color: "#2f7de0", icon: "🧸" },
    ],
  },
  {
    id: "frima",
    label: "フリーマーケット",
    emoji: "🛍️",
    description: "個人出店中心のフリマイベント",
    defaultCategories: [
      { label: "衣類・雑貨", color: "#a24fd6", icon: "👕" },
      { label: "本・おもちゃ", color: "#2f7de0", icon: "📚" },
      { label: "飲食", color: "#e08a2f", icon: "🍽️" },
    ],
  },
  {
    id: "bousai",
    label: "防災訓練・防災フェア",
    emoji: "🚒",
    description: "起震車体験、消火訓練、非常食配布など",
    defaultCategories: [
      { label: "体験・訓練", color: "#e2574c", icon: "🧯" },
      { label: "展示・配布", color: "#2fa85a", icon: "📦" },
      { label: "受付・案内", color: "#2f7de0", icon: "📍" },
    ],
  },
  {
    id: "other",
    label: "白紙から作成",
    emoji: "📝",
    description: "テンプレートを使わず自分でカテゴリを設定する",
    defaultCategories: [{ label: "その他", color: "#6b7280", icon: "📍" }],
  },
];

export function getTemplate(eventType: EventType): EventTypeTemplate {
  return (
    EVENT_TYPE_TEMPLATES.find((t) => t.id === eventType) ??
    EVENT_TYPE_TEMPLATES[EVENT_TYPE_TEMPLATES.length - 1]
  );
}

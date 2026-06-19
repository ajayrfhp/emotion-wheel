export type Emotion = {
  id: string;
  name: string;
  color: string;
  emoji?: string;
  defaultActionId: string; // references Action.id
};

export type Action = {
  id: string;
  label: string;
  emoji?: string;
};

export const NO_ACTION_ID = "none";
export const NO_ACTION: Action = { id: NO_ACTION_ID, label: "No action needed — just sharing.", emoji: "💬" };

export const DEFAULT_ACTIONS: Action[] = [
  NO_ACTION,
  { id: "space",       label: "Give me space",                    emoji: "🚪" },
  { id: "hug",         label: "Hug me",                           emoji: "🤗" },
  { id: "listen",      label: "Just listen, don't fix",           emoji: "👂" },
  { id: "checkin",     label: "Check in on me later",             emoji: "⏰" },
  { id: "celebrate",   label: "Celebrate with me",                emoji: "🎉" },
  { id: "reassure",    label: "Reassure me",                      emoji: "💛" },
  { id: "ask",         label: "Ask me what happened",             emoji: "❓" },
  { id: "be_present",  label: "Just be present with me",          emoji: "🪷" },
  { id: "comfort",     label: "Comfort me, no need to fix it",    emoji: "🫂" },
  { id: "share_joy",   label: "Share my excitement",              emoji: "✨" },
];

export const DEFAULT_EMOTIONS: Emotion[] = [
  { id: "joy",          name: "Joy",          color: "#FFD93D", emoji: "😊", defaultActionId: "celebrate" },
  { id: "trust",        name: "Trust",        color: "#6BCB77", emoji: "🤝", defaultActionId: "be_present" },
  { id: "fear",         name: "Fear",         color: "#9D4EDD", emoji: "😨", defaultActionId: "reassure" },
  { id: "surprise",     name: "Surprise",     color: "#4CC9F0", emoji: "😮", defaultActionId: "ask" },
  { id: "sadness",      name: "Sadness",      color: "#4895EF", emoji: "😢", defaultActionId: "comfort" },
  { id: "disgust",      name: "Disgust",      color: "#80B918", emoji: "🤢", defaultActionId: "checkin" },
  { id: "anger",        name: "Anger",        color: "#E63946", emoji: "😠", defaultActionId: "space" },
  { id: "anticipation", name: "Anticipation", color: "#FF9F1C", emoji: "🤩", defaultActionId: "share_joy" },
];

export const RESET_EMOTION: Emotion = {
  id: "reset",
  name: "I'm OK now",
  color: "#A0AEC0",
  emoji: "✅",
  defaultActionId: NO_ACTION_ID,
};

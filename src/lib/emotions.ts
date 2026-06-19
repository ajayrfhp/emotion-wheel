export type Emotion = {
  id: string;
  name: string;
  color: string;
  emoji?: string;
  defaultActionId: string; // references Action.id
  children?: Emotion[]; // optional sub-emotions for a 2-ring wheel
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

// Junto-style 48-emotion wheel: 6 core × 8 sub-emotions.
// Each sub-emotion inherits the parent's default action unless overridden.
function sub(parentId: string, parentAction: string, names: string[]): Emotion[] {
  // Generate a lighter tint by appending an alpha-free hex isn't possible, so
  // we just reuse the parent color — the wheel component will lighten the
  // outer ring visually.
  return names.map((name) => ({
    id: `${parentId}_${name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
    name,
    color: "",
    defaultActionId: parentAction,
  }));
}

export const DEFAULT_EMOTIONS_48: Emotion[] = [
  {
    id: "joy", name: "Joy", color: "#FFD93D", emoji: "😊", defaultActionId: "celebrate",
    children: sub("joy", "celebrate", [
      "Playful", "Content", "Interested", "Proud", "Accepted", "Powerful", "Peaceful", "Trusting",
    ]),
  },
  {
    id: "surprise", name: "Surprise", color: "#4CC9F0", emoji: "😮", defaultActionId: "ask",
    children: sub("surprise", "ask", [
      "Amazed", "Confused", "Startled", "Excited", "Astonished", "Energetic", "Eager", "Awe",
    ]),
  },
  {
    id: "sadness", name: "Sad", color: "#4895EF", emoji: "😢", defaultActionId: "comfort",
    children: sub("sadness", "comfort", [
      "Lonely", "Vulnerable", "Despair", "Guilty", "Depressed", "Hurt", "Disappointed", "Bored",
    ]),
  },
  {
    id: "disgust", name: "Disgust", color: "#80B918", emoji: "🤢", defaultActionId: "checkin",
    children: sub("disgust", "checkin", [
      "Disapproving", "Awful", "Avoidant", "Hesitant", "Judgmental", "Loathing", "Repelled", "Revolted",
    ]),
  },
  {
    id: "anger", name: "Anger", color: "#E63946", emoji: "😠", defaultActionId: "space",
    children: sub("anger", "space", [
      "Frustrated", "Critical", "Distant", "Aggressive", "Mad", "Bitter", "Humiliated", "Let down",
    ]),
  },
  {
    id: "fear", name: "Fear", color: "#9D4EDD", emoji: "😨", defaultActionId: "reassure",
    children: sub("fear", "reassure", [
      "Anxious", "Insecure", "Submissive", "Rejected", "Scared", "Helpless", "Worried", "Inadequate",
    ]),
  },
];

export const RESET_EMOTION: Emotion = {
  id: "reset",
  name: "I'm OK now",
  color: "#A0AEC0",
  emoji: "✅",
  defaultActionId: NO_ACTION_ID,
};

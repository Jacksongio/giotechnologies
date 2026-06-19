export type OccasionKey =
  | "Father's Day"
  | "Mother's Day"
  | "Christmas"
  | "Birthday"
  | "Summer"
  | "Thank You"
  | "Just Because"
  | "Easter"
  | "Valentine's Day"
  | "New Year"

export interface OccasionMeta {
  emoji: string
  colorClasses: string
  gradientClasses: string
  greeting: string
}

export const occasions: Record<OccasionKey, OccasionMeta> = {
  "Father's Day": {
    emoji: "👔",
    colorClasses: "text-blue-600 bg-blue-50",
    gradientClasses: "from-blue-600 to-blue-800",
    greeting: "Happy Father's Day!",
  },
  "Mother's Day": {
    emoji: "💐",
    colorClasses: "text-pink-600 bg-pink-50",
    gradientClasses: "from-pink-500 to-pink-700",
    greeting: "Happy Mother's Day!",
  },
  Christmas: {
    emoji: "🎄",
    colorClasses: "text-red-600 bg-red-50",
    gradientClasses: "from-red-600 to-green-800",
    greeting: "Merry Christmas!",
  },
  Birthday: {
    emoji: "🎂",
    colorClasses: "text-amber-600 bg-amber-50",
    gradientClasses: "from-amber-500 to-orange-600",
    greeting: "Happy Birthday!",
  },
  Summer: {
    emoji: "☀️",
    colorClasses: "text-yellow-600 bg-yellow-50",
    gradientClasses: "from-yellow-400 to-orange-500",
    greeting: "Happy Summer!",
  },
  "Thank You": {
    emoji: "🙏",
    colorClasses: "text-emerald-600 bg-emerald-50",
    gradientClasses: "from-emerald-500 to-teal-700",
    greeting: "Thank You!",
  },
  "Just Because": {
    emoji: "🎁",
    colorClasses: "text-purple-600 bg-purple-50",
    gradientClasses: "from-purple-500 to-violet-700",
    greeting: "Thinking of You!",
  },
  Easter: {
    emoji: "🐣",
    colorClasses: "text-lime-600 bg-lime-50",
    gradientClasses: "from-lime-400 to-emerald-600",
    greeting: "Happy Easter!",
  },
  "Valentine's Day": {
    emoji: "💝",
    colorClasses: "text-rose-600 bg-rose-50",
    gradientClasses: "from-rose-500 to-pink-700",
    greeting: "Happy Valentine's Day!",
  },
  "New Year": {
    emoji: "🎆",
    colorClasses: "text-indigo-600 bg-indigo-50",
    gradientClasses: "from-indigo-600 to-violet-800",
    greeting: "Happy New Year!",
  },
}

export const occasionKeys = Object.keys(occasions) as OccasionKey[]

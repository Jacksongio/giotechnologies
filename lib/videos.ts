import type { Doc } from "@/convex/_generated/dataModel";

export type FamilyVideo = Doc<"videos"> & {
  thumbnailUrl: string | null;
  videoUrl: string | null;
};

export const collectionMeta: Record<string, string> = {
  "Summer Trips": "Beaches, sprinklers & the open road",
  "Birthdays": "Candles, wishes & a little frosting",
  "Holidays": "Pajamas, pancakes & wrapping paper",
  "Celebrations": "Weddings, dances & questionable moves",
  "Everyday": "Porch stories & the spring garden",
};

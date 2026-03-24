import type { Member } from "./Member";
import type { Recommendation } from "./Recommendation";

export type InteractionState = 'UNSEEN' | 'SEEN' | 'SKIPPED';
export type InteractionType = 'PRIVATE' | 'PUBLIC';

export interface Interaction {
  id: string;
  response: string | null;
  rating: number | null;
  member: Member;
  recommendation: Recommendation;
  updatedAt: string;
  createdAt: string;
  state: InteractionState;
  type: InteractionType;
  number: number | null;
}

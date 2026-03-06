import type { Member } from "./Member";
import type { Recommendation } from "./Recommendation";

export interface Group {
  id: string;
  name: string;
  type: 'PRIVATE' | 'PUBLIC';
  imgUrl: string | null;
  created_at: string;
  members: Member[];
  recommendations: Recommendation[];
}

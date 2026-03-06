import type { User } from "./User";
import type {Recommendation} from "./Recommendation"
export interface Message {
  id: string;
  createdAt: string;
  message: string;
  user: User;
  recommendation: Recommendation;
}

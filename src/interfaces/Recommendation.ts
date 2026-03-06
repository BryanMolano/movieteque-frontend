import type { Message } from "react-hook-form";
import type { User } from "./User";
import type { Movie } from "./Movie";

export interface Recommendation {
  id: string;
  createdAt: string;
  priority: number;
  user: User;
  movie: Movie;
  firstMessage: Message | null;
}

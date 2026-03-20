import type { Message } from "react-hook-form";
import type { User } from "./User";
import type { Movie } from "./Movie";
import type { Group } from "./Group";

export interface RecommendationComplete {
  id: string;
  createdAt: string;
  priority: number;
  user: User;
  group: Group;
  movie: Movie;
  recommendationState: 'Active' | 'Inactive';
}

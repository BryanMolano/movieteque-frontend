import type { Message } from "react-hook-form";
import type { User } from "./User";
import type { Movie } from "./Movie";
import type { Group } from "./Group";
import type { Interaction } from "./Interaction";

export interface RecommendationComplete {
  id: string;
  createdAt: string;
  priority: number;
  movie: Movie;
  user: User;
  group: Group;
  recommendationState: 'Active' | 'Inactive';
  interactions: Interaction[];
  messages: Message[];

}

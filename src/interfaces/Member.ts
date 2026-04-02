import type { Group } from "./Group";
import type { User } from "./User";

export interface Member {
  id: string;
  entryDate: string;
  role: 'Admin' | 'User' | 'Invited';
  nickname: string | null;
  isBanned: boolean;
  user: User;
  group:Group;
}

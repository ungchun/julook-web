// iOS MakgeolliReactionRemote.swift / MakgeolliReactionCount 미러.
// Supabase 테이블: makgeolli_reactions, makgeolli_reaction_counts.

export type ReactionType = "like" | "dislike";

export type MakgeolliReaction = {
  id: string;
  user_id: string;
  makgeolli_id: string;
  reaction_type: ReactionType;
  created_at: string;
  updated_at: string;
};

export type MakgeolliReactionCount = {
  id: string;
  makgeolli_id: string;
  like_count: number;
  dislike_count: number;
  created_at: string;
  updated_at: string;
};

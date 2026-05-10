import type { ReactionType } from "@/shared/types";

// iOS DesignSystemAsset.Images.{circleLike, circleDislike, circleNone} 미러 자산 매핑.
// reaction 미존재 → circleNone (회색 동그라미). null/undefined 모두 동일 처리.
export function reactionCircleIconSrc(
  type: ReactionType | null | undefined,
): string {
  if (type === "like") return "/assets/reaction/circle_like.svg";
  if (type === "dislike") return "/assets/reaction/circle_dislike.svg";
  return "/assets/reaction/circle_none.svg";
}

import type { UserProfile } from "@/services/user.service";

export function getLinkedStudentIds(
  profile: Pick<UserProfile, "linkedStudentId" | "linkedStudentIds"> | null | undefined,
): string[] {
  if (!profile) return [];
  if (profile.linkedStudentIds?.length) {
    return [...new Set(profile.linkedStudentIds)];
  }
  if (profile.linkedStudentId) {
    return [profile.linkedStudentId];
  }
  return [];
}

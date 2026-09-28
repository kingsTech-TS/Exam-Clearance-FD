import type { StaffProfileResponse } from "@/types/user";

export type StaffAsset = "passport" | "signature" | "seal";

/**
 * Mirrors the backend's StaffService.is_profile_complete: completion is derived from the
 * upload flags (passport + signature, plus seal for Bursar/Auditor), not the stored
 * profile_completed value, which can be stale.
 */
export function getMissingStaffAssets(profile?: StaffProfileResponse | null): StaffAsset[] {
  if (!profile) return ["passport", "signature"];
  const required: StaffAsset[] = ["passport", "signature"];
  if (profile.sub_role === "BURSAR" || profile.sub_role === "AUDITOR") required.push("seal");
  return required.filter((asset) => !profile[`${asset}_uploaded`]);
}

export function isStaffProfileComplete(profile?: StaffProfileResponse | null): boolean {
  return getMissingStaffAssets(profile).length === 0;
}

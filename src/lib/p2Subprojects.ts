export const P2_SUB_IDS = ["personal-website", "smart-glasses"] as const;
export type P2SubId = (typeof P2_SUB_IDS)[number];

export function isP2SubId(value: string): value is P2SubId {
  return (P2_SUB_IDS as readonly string[]).includes(value);
}

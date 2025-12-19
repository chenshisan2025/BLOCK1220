import sponsorsJson from "../../content/sponsor/sponsors_v1.json";
import campaignsJson from "../../content/sponsor/sponsor_campaigns_v1.json";
import boxesJson from "../../content/sponsor/sponsor_boxes_v1.json";

type Sponsor = { sponsorId: string; name: string; logo: string; website?: string; twitter?: string; token?: { symbol: string; decimals: number } };
type Campaign = {
  campaignId: string;
  sponsorId: string;
  type: "Collect";
  startAt: string;
  endAt: string;
  collect: { targetType: number; requiredCount: number };
  reward: { type: "Token"; symbol: string; amount: string };
};
type BoxReward = { type: "Token"; symbol: string; amount: string; weight: number };
type Box = { boxId: string; sponsorId: string; chapter: number; rewards: BoxReward[] };

let sponsors: Map<string, Sponsor> | null = null;
let campaigns: Map<string, Campaign> | null = null;
let boxes: Map<string, Box> | null = null;

export function getSponsor(id: string): Sponsor | null {
  if (!sponsors) {
    sponsors = new Map<string, Sponsor>();
    for (const s of (sponsorsJson as any).sponsors || []) sponsors.set(s.sponsorId, s);
  }
  return sponsors.get(id) || null;
}

export function getCampaign(id: string): Campaign | null {
  if (!campaigns) {
    campaigns = new Map<string, Campaign>();
    for (const c of (campaignsJson as any).campaigns || []) campaigns.set(c.campaignId, c);
  }
  return campaigns.get(id) || null;
}

export function getBox(id: string): Box | null {
  if (!boxes) {
    boxes = new Map<string, Box>();
    for (const b of (boxesJson as any).boxes || []) boxes.set(b.boxId, b);
  }
  return boxes.get(id) || null;
}

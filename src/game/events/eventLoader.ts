import type { EventCampaign, EventCampaignFile } from "./eventTypes";
import json from "@/src/content/events/event_campaigns_v1.json";

let cache: EventCampaign[] | null = null;

export function loadEventCampaigns(): EventCampaign[] {
  if (cache) return cache;
  const file = json as unknown as EventCampaignFile;
  cache = file.campaigns || [];
  return cache;
}

export function getActiveCampaigns(now = Date.now()): EventCampaign[] {
  const all = loadEventCampaigns();
  return all.filter((c) => {
    const start = Date.parse(c.startAt);
    const end = Date.parse(c.endAt);
    return now >= start && now <= end;
  });
}

export function getCampaign(eventId: string): EventCampaign | undefined {
  return loadEventCampaigns().find((c) => c.eventId === eventId);
}

type SponsorBoxReward = { type: "Token"; sponsorId: string; symbol: string; amount: string };
type SponsorCollectReward = { type: "Token"; sponsorId: string; symbol: string; amount: string; campaignId: string };

const boxRewardsByAddress = new Map<string, SponsorBoxReward[]>();
const collectRewardsByAddress = new Map<string, SponsorCollectReward[]>();
const completedCampaigns = new Map<string, Set<string>>();

export function addBoxReward(address: string, reward: SponsorBoxReward) {
  const arr = boxRewardsByAddress.get(address) || [];
  arr.push(reward);
  boxRewardsByAddress.set(address, arr);
}

export function addCollectReward(address: string, reward: SponsorCollectReward) {
  const done = completedCampaigns.get(address) || new Set<string>();
  if (done.has(reward.campaignId)) {
    completedCampaigns.set(address, done);
    return;
  }
  done.add(reward.campaignId);
  completedCampaigns.set(address, done);
  const arr = collectRewardsByAddress.get(address) || [];
  arr.push(reward);
  collectRewardsByAddress.set(address, arr);
}

export function listSponsorRewards(address: string): { box: SponsorBoxReward[]; collect: SponsorCollectReward[] } {
  return {
    box: (boxRewardsByAddress.get(address) || []).slice(),
    collect: (collectRewardsByAddress.get(address) || []).slice(),
  };
}

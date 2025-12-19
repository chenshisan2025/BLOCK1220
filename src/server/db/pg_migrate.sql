-- PostgreSQL schema for BlockWorld Sponsor/Admin/Claimables/Leaderboard

CREATE TABLE IF NOT EXISTS sponsors (
  sponsor_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo TEXT,
  website TEXT,
  twitter TEXT,
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS sponsor_campaigns (
  campaign_id TEXT PRIMARY KEY,
  sponsor_id TEXT NOT NULL REFERENCES sponsors(sponsor_id),
  type TEXT NOT NULL,
  start_at BIGINT NOT NULL,
  end_at BIGINT NOT NULL,
  target_type INT,
  required_count INT,
  reward_symbol TEXT,
  reward_amount TEXT,
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS sponsor_boxes (
  box_id TEXT PRIMARY KEY,
  sponsor_id TEXT NOT NULL REFERENCES sponsors(sponsor_id),
  chapter INT,
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS sponsor_box_rewards (
  id BIGSERIAL PRIMARY KEY,
  box_id TEXT NOT NULL REFERENCES sponsor_boxes(box_id),
  reward_type TEXT NOT NULL,
  symbol TEXT NOT NULL,
  amount TEXT NOT NULL,
  weight INT NOT NULL
);

CREATE TABLE IF NOT EXISTS sponsor_campaign_completions (
  id BIGSERIAL PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES sponsor_campaigns(campaign_id),
  address TEXT NOT NULL,
  ts BIGINT NOT NULL,
  UNIQUE (campaign_id, address)
);

CREATE TABLE IF NOT EXISTS sponsor_box_opens (
  id BIGSERIAL PRIMARY KEY,
  box_id TEXT NOT NULL REFERENCES sponsor_boxes(box_id),
  address TEXT NOT NULL,
  reward_symbol TEXT NOT NULL,
  reward_amount TEXT NOT NULL,
  ts BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS issued_rewards (
  id BIGSERIAL PRIMARY KEY,
  address TEXT NOT NULL,
  reward_type TEXT NOT NULL,  -- DailyRank | SponsorCollect | SponsorBox
  ref_id TEXT NOT NULL,       -- dayId/campaignId/boxId
  symbol TEXT NOT NULL,
  amount TEXT NOT NULL,
  ts BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rewards_addr_ts ON issued_rewards(address, ts);
CREATE INDEX IF NOT EXISTS idx_box_open_box_ts ON sponsor_box_opens(box_id, ts);
CREATE INDEX IF NOT EXISTS idx_campaign_comp_campaign_ts ON sponsor_campaign_completions(campaign_id, ts);

-- Leaderboard
CREATE TABLE IF NOT EXISTS leaderboard_runs (
  id BIGSERIAL PRIMARY KEY,
  day TEXT NOT NULL,        -- YYYY-MM-DD (UTC+8)
  address TEXT NOT NULL,
  raw_score INT NOT NULL,
  effective_time_sec INT NOT NULL,
  rank_score INT NOT NULL,
  ts BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_runs_day_rank ON leaderboard_runs(day, rank_score DESC, raw_score DESC, effective_time_sec ASC);

CREATE TABLE IF NOT EXISTS leaderboard_settlements (
  day TEXT PRIMARY KEY,
  merkle_root TEXT NOT NULL,
  total_reward TEXT NOT NULL,
  ts BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS event_progress (
  address TEXT NOT NULL,
  event_id TEXT NOT NULL,
  current INT NOT NULL,
  required INT NOT NULL,
  updated_at BIGINT NOT NULL,
  PRIMARY KEY(address, event_id)
);

CREATE TABLE IF NOT EXISTS event_completions (
  event_id TEXT NOT NULL,
  address TEXT NOT NULL,
  ts BIGINT NOT NULL,
  PRIMARY KEY(event_id, address)
);

CREATE INDEX IF NOT EXISTS idx_event_progress_updated ON event_progress(updated_at);

-- Admin-configurable Event Campaigns
CREATE TABLE IF NOT EXISTS event_campaigns (
  event_id TEXT PRIMARY KEY,
  title_key TEXT NOT NULL,
  desc_key TEXT NOT NULL,
  type TEXT NOT NULL,
  rules JSONB NOT NULL,
  reward JSONB NOT NULL,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'inactive',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_campaigns_active ON event_campaigns (status, start_at, end_at);

-- 14-R: anti-cheat / risk control
CREATE TABLE IF NOT EXISTS anti_cheat_runs (
  run_id TEXT PRIMARY KEY,
  ts BIGINT NOT NULL,
  day TEXT NOT NULL,
  mode TEXT NOT NULL,
  level_id INT,
  address TEXT NOT NULL,
  raw_score INT NOT NULL,
  effective_time_sec INT NOT NULL,
  rank_score INT NOT NULL,
  revives_used INT NOT NULL,
  swaps_total INT NOT NULL,
  swaps_valid INT NOT NULL,
  cascades_total INT NOT NULL,
  specials_total INT NOT NULL,
  specials_color INT NOT NULL,
  specials_bomb INT NOT NULL,
  specials_line INT NOT NULL,
  boss_type TEXT,
  boss_flags JSONB,
  client_meta JSONB,
  server_meta JSONB,
  risk_score INT NOT NULL,
  risk_reasons JSONB NOT NULL,
  decision TEXT NOT NULL,
  decision_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_anti_cheat_runs_day_score ON anti_cheat_runs(day, risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_anti_cheat_runs_addr_ts ON anti_cheat_runs(address, ts DESC);

CREATE TABLE IF NOT EXISTS anti_cheat_addresses (
  address TEXT PRIMARY KEY,
  first_seen BIGINT NOT NULL,
  last_seen BIGINT NOT NULL,
  runs_total INT NOT NULL,
  runs_endless INT NOT NULL,
  runs_story INT NOT NULL,
  risk_avg INT NOT NULL,
  risk_max INT NOT NULL,
  decisions JSONB NOT NULL,
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS anti_cheat_reviews (
  id BIGSERIAL PRIMARY KEY,
  run_id TEXT NOT NULL,
  address TEXT NOT NULL,
  created_ts BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  resolution TEXT,
  reviewer TEXT,
  note TEXT
);

-- 14-R.1: pending reward issuance for REVIEW decisions
CREATE TABLE IF NOT EXISTS pending_rewards (
  id BIGSERIAL PRIMARY KEY,
  source TEXT NOT NULL,
  ref_id TEXT NOT NULL,
  address TEXT NOT NULL,
  symbol TEXT NOT NULL,
  amount_wei TEXT NOT NULL,
  decimals INT NOT NULL DEFAULT 18,
  created_ts BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  decision_note TEXT,
  issued_reward_id BIGINT,
  resolved_by TEXT,
  resolved_ts BIGINT
);
CREATE INDEX IF NOT EXISTS idx_pending_rewards_status_ts ON pending_rewards(status, created_ts DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_pending_rewards_once ON pending_rewards(source, ref_id, address);

-- 14-R.3: DB-first risk policy + audit
CREATE TABLE IF NOT EXISTS risk_policies (
  policy_id TEXT PRIMARY KEY,
  version INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  config JSONB NOT NULL,
  updated_by TEXT,
  updated_ts BIGINT NOT NULL,
  created_ts BIGINT NOT NULL
);
CREATE TABLE IF NOT EXISTS risk_policy_audit (
  id BIGSERIAL PRIMARY KEY,
  policy_id TEXT NOT NULL,
  action TEXT NOT NULL,
  before JSONB,
  after JSONB,
  actor TEXT NOT NULL,
  ts BIGINT NOT NULL,
  note TEXT
);
CREATE INDEX IF NOT EXISTS idx_risk_policy_audit_ts ON risk_policy_audit(ts DESC);

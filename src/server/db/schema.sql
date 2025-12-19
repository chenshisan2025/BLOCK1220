PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS sponsors (
  sponsor_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo TEXT,
  website TEXT,
  twitter TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sponsor_campaigns (
  campaign_id TEXT PRIMARY KEY,
  sponsor_id TEXT NOT NULL,
  type TEXT NOT NULL,
  start_at INTEGER NOT NULL,
  end_at INTEGER NOT NULL,
  target_type INTEGER,
  required_count INTEGER,
  reward_symbol TEXT,
  reward_amount TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (sponsor_id) REFERENCES sponsors(sponsor_id)
);

CREATE TABLE IF NOT EXISTS sponsor_boxes (
  box_id TEXT PRIMARY KEY,
  sponsor_id TEXT NOT NULL,
  chapter INTEGER,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (sponsor_id) REFERENCES sponsors(sponsor_id)
);

CREATE TABLE IF NOT EXISTS sponsor_box_rewards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  box_id TEXT NOT NULL,
  reward_type TEXT NOT NULL,
  symbol TEXT NOT NULL,
  amount TEXT NOT NULL,
  weight INTEGER NOT NULL,
  FOREIGN KEY (box_id) REFERENCES sponsor_boxes(box_id)
);

CREATE TABLE IF NOT EXISTS sponsor_campaign_completions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id TEXT NOT NULL,
  address TEXT NOT NULL,
  ts INTEGER NOT NULL,
  UNIQUE(campaign_id, address),
  FOREIGN KEY (campaign_id) REFERENCES sponsor_campaigns(campaign_id)
);

CREATE TABLE IF NOT EXISTS sponsor_box_opens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  box_id TEXT NOT NULL,
  address TEXT NOT NULL,
  reward_symbol TEXT NOT NULL,
  reward_amount TEXT NOT NULL,
  ts INTEGER NOT NULL,
  FOREIGN KEY (box_id) REFERENCES sponsor_boxes(box_id)
);

CREATE TABLE IF NOT EXISTS issued_rewards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  address TEXT NOT NULL,
  reward_type TEXT NOT NULL,
  ref_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  amount TEXT NOT NULL,
  ts INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rewards_addr_ts ON issued_rewards(address, ts);
CREATE INDEX IF NOT EXISTS idx_box_open_box_ts ON sponsor_box_opens(box_id, ts);
CREATE INDEX IF NOT EXISTS idx_campaign_comp_campaign_ts ON sponsor_campaign_completions(campaign_id, ts);

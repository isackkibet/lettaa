-- LETAA Database Migrations
-- Run these in Supabase SQL Editor

-- 1. Add wallet_address to riders table
alter table if exists riders
add column if not exists wallet_address text unique;

create index if not exists idx_riders_wallet_address on riders(wallet_address);

-- 2. Create reward_transactions audit table
create table if not exists reward_transactions (
  id uuid primary key default gen_random_uuid(),
  rider_id uuid not null references riders(id) on delete cascade,
  amount numeric not null,
  reason text not null,
  tx_hash text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'failed', 'pending_retry')),
  created_at timestamptz not null default now()
);

create index if not exists idx_reward_tx_rider on reward_transactions(rider_id);
create index if not exists idx_reward_tx_status on reward_transactions(status);
create index if not exists idx_reward_tx_created on reward_transactions(created_at desc);

-- Unique constraint for idempotency (prevents duplicate rewards for same milestone)
create unique index if not exists idx_reward_tx_idempotent
  on reward_transactions(rider_id, reason)
  where status in ('pending', 'confirmed');

-- 3. RLS Policies (adjust based on your auth setup)
alter table reward_transactions enable row level security;

-- Riders can view their own rewards
create policy "Riders can view own rewards"
  on reward_transactions for select
  using (auth.uid() = rider_id);

-- Service role can insert/update (for backend)
create policy "Service role full access"
  on reward_transactions for all
  using (auth.role() = 'service_role');

-- 4. Optional: Add balance view for quick queries
create or replace view rider_rewards_summary as
select
  r.id as rider_id,
  r.wallet_address,
  coalesce(sum(rt.amount) filter (where rt.status = 'confirmed'), 0) as total_rxp_earned,
  count(rt.id) filter (where rt.status = 'confirmed') as confirmed_rewards_count,
  count(rt.id) filter (where rt.status = 'pending') as pending_rewards_count,
  max(rt.created_at) as last_reward_at
from riders r
left join reward_transactions rt on r.id = rt.rider_id
group by r.id, r.wallet_address;

grant select on rider_rewards_summary to anon, authenticated, service_role;
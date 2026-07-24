-- Migration: Add wallet_address to riders table and create reward_transactions table
-- Run this in Supabase SQL Editor

-- 1. Add wallet_address column to riders table
alter table riders
add column if not exists wallet_address text unique;

-- 2. Create reward_transactions table
create table if not exists reward_transactions (
  id uuid primary key default gen_random_uuid(),
  rider_id uuid not null references riders(id) on delete cascade,
  amount numeric not null check (amount > 0),
  reason text not null,
  tx_hash text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'failed', 'pending_retry')),
  created_at timestamptz not null default now()
);

-- 3. Create indexes for performance
create index if not exists idx_reward_tx_rider on reward_transactions(rider_id);
create index if not exists idx_reward_tx_status on reward_transactions(status);
create index if not exists idx_reward_tx_created_at on reward_transactions(created_at desc);

-- 4. Create unique index for idempotency (prevents duplicate rewards for same rider + reason)
create unique index if not exists idx_reward_tx_idempotent
  on reward_transactions(rider_id, reason)
  where status in ('pending', 'confirmed');

-- 5. Enable Row Level Security (optional - adjust policies as needed)
alter table reward_transactions enable row level security;

-- Policy: Riders can only see their own reward transactions
create policy "Riders can view own rewards" on reward_transactions
  for select using (auth.uid() = rider_id);

-- Policy: Service role can insert/update (for backend)
create policy "Service role full access" on reward_transactions
  for all using (auth.role() = 'service_role');

-- 6. Add updated_at trigger for riders (if not exists)
create or replace function update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists update_riders_updated_at on riders;
create trigger update_riders_updated_at
  before update on riders
  for each row execute function update_updated_at_column();
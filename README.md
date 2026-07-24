# Leta

Backend database for the Leta delivery rider platform.

## Quick Start (for new devs)

1. Install PostgreSQL:
   ```bash
   sudo apt install postgresql -y
   sudo pg_ctlcluster 18 main start
   ```

2. Clone and run setup:
   ```bash
   git clone https://github.com/IanMugwe/letaa.git
   cd letaa
   ./setup.sh
   ```

3. Create your PostgreSQL role (one-time):
   ```bash
   sudo -u postgres psql -c "CREATE ROLE <your_linux_username> WITH LOGIN SUPERUSER;"
   ```

That's it. Database `leta_db` is ready.

## Database Tables

| Table | Purpose |
|-------|---------|
| letaa_riders | Rider profiles, XP, level, streak |
| letaa_deliveries | Delivery tracking |
| letaa_xp_history | XP change log |
| letaa_levels | Level definitions |
| letaa_missions | Mission templates |
| letaa_rider_missions | Per-rider mission progress |
| letaa_feedback | Delivery performance feedback |
| letaa_rewards | Reward records |
| letaa_blockchain_transactions | On-chain reward payouts |
| letaa_achievements | Achievement badge definitions |
| letaa_rider_achievements | Unlocked badges per rider |
| letaa_leaderboard | View: ranked riders |

## Connection

```
postgresql://<your_user>@localhost:5432/leta_db
```

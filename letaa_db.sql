-- ============================================================
-- LETA DATABASE — FULLY BLOCKCHAIN-INTEGRATED GAMIFICATION
-- All enums in letaa_core to avoid cross-schema dependency
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- SCHEMAS
-- ============================================================

CREATE SCHEMA IF NOT EXISTS letaa_core;
CREATE SCHEMA IF NOT EXISTS letaa_delivery;
CREATE SCHEMA IF NOT EXISTS letaa_gamification;
CREATE SCHEMA IF NOT EXISTS letaa_rewards;
CREATE SCHEMA IF NOT EXISTS letaa_analytics;

-- ============================================================
-- ENUM TYPES (all in letaa_core)
-- ============================================================

CREATE TYPE letaa_core.user_role AS ENUM ('RIDER', 'CUSTOMER', 'BOTH', 'ADMIN');
CREATE TYPE letaa_core.account_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED');
CREATE TYPE letaa_core.rider_role AS ENUM (
    'NEW_RIDER', 'ACTIVE_RIDER', 'VERIFIED_RIDER', 'SENIOR_RIDER',
    'MENTOR_RIDER', 'TEAM_LEADER', 'REGIONAL_AMBASSADOR', 'COMMUNITY_CHAMPION'
);
CREATE TYPE letaa_core.performance_grade AS ENUM ('S', 'A', 'B', 'C', 'D', 'F');
CREATE TYPE letaa_core.delivery_status AS ENUM (
    'ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT',
    'DELIVERED', 'FAILED', 'CANCELLED'
);
CREATE TYPE letaa_core.delivery_category AS ENUM (
    'FOOD', 'GROCERY', 'PHARMACY', 'ELECTRONICS',
    'PARCEL', 'DOCUMENT', 'SAME_DAY', 'SCHEDULED', 'EXPRESS'
);
CREATE TYPE letaa_core.payment_method AS ENUM (
    'WALLET', 'CASH', 'CARD', 'CRYPTO', 'TOKEN'
);
CREATE TYPE letaa_core.mission_category AS ENUM (
    'DAILY', 'WEEKLY', 'MONTHLY', 'SEASONAL',
    'HOLIDAY_EVENT', 'TEAM_CHALLENGE', 'REFERRAL',
    'COMMUNITY_CHALLENGE', 'EMERGENCY', 'TUTORIAL'
);
CREATE TYPE letaa_core.reward_category AS ENUM ('DIGITAL', 'BUSINESS', 'EXCLUSIVE');
CREATE TYPE letaa_core.reward_item AS ENUM (
    'XP', 'COINS', 'GEMS', 'TOKENS', 'NFT', 'BADGE',
    'CASH_BONUS', 'FUEL_ALLOWANCE', 'SHOPPING_VOUCHER', 'AIRTIME',
    'MEAL_COUPON', 'PRIORITY_ALLOCATION', 'PREMIUM_STATUS',
    'VIP_SUPPORT', 'EXCLUSIVE_ZONE', 'EARLY_ACCESS',
    'LIMITED_NFT', 'EVENT_INVITE'
);
CREATE TYPE letaa_core.nft_category AS ENUM (
    'ACHIEVEMENT', 'MILESTONE', 'SEASONAL', 'LIMITED_EDITION',
    'EVENT', 'CHAMPION', 'LOYALTY', 'ANNIVERSARY'
);
CREATE TYPE letaa_core.achievement_category AS ENUM (
    'DELIVERY_MILESTONE', 'SPEED', 'CUSTOMER_SERVICE',
    'RELIABILITY', 'SPECIAL_EVENT'
);
CREATE TYPE letaa_core.blockchain_network AS ENUM ('AVALANCHE', 'ETHEREUM', 'POLYGON', 'BSC');
CREATE TYPE letaa_core.tx_status AS ENUM ('PENDING', 'CONFIRMED', 'FAILED', 'REVERSED');
CREATE TYPE letaa_core.tx_type AS ENUM (
    'ORDER_PAYMENT', 'DELIVERY_FEE', 'TIP', 'REWARD_PAYOUT',
    'NFT_MINT', 'TOKEN_SWAP', 'STAKE', 'REFERRAL_BONUS', 'QUEST_REWARD'
);

-- ============================================================
-- SCHEMA: letaa_core
-- ============================================================

CREATE TABLE letaa_core.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) NOT NULL,
    full_name VARCHAR(150),
    email VARCHAR(150) UNIQUE,
    phone VARCHAR(20),
    password_hash TEXT,
    avatar TEXT,
    wallet_address TEXT UNIQUE NOT NULL,
    wallet_network letaa_core.blockchain_network DEFAULT 'AVALANCHE',
    wallet_verified BOOLEAN DEFAULT FALSE,
    role letaa_core.user_role DEFAULT 'CUSTOMER',
    status letaa_core.account_status DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE letaa_core.riders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES letaa_core.users(id) ON DELETE CASCADE,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    coins NUMERIC(18,2) DEFAULT 0,
    gems NUMERIC(18,2) DEFAULT 0,
    tokens NUMERIC(18,2) DEFAULT 0,
    rider_role letaa_core.rider_role DEFAULT 'NEW_RIDER',
    performance_grade letaa_core.performance_grade DEFAULT 'D',
    reputation_score DECIMAL(5,2) DEFAULT 0,
    status letaa_core.account_status DEFAULT 'ACTIVE',
    total_deliveries INTEGER DEFAULT 0,
    successful_deliveries INTEGER DEFAULT 0,
    failed_deliveries INTEGER DEFAULT 0,
    acceptance_rate DECIMAL(5,2) DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0,
    ontime_rate DECIMAL(5,2) DEFAULT 0,
    avg_delivery_time INTEGER DEFAULT 0,
    avg_customer_rating DECIMAL(3,2) DEFAULT 0,
    total_distance_km DECIMAL(12,2) DEFAULT 0,
    total_active_hours DECIMAL(10,2) DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    weekly_rank INTEGER,
    monthly_rank INTEGER,
    lifetime_rank INTEGER,
    total_rewards_earned NUMERIC(18,2) DEFAULT 0,
    total_badges INTEGER DEFAULT 0,
    total_nfts INTEGER DEFAULT 0,
    total_coins_earned NUMERIC(18,2) DEFAULT 0,
    total_coins_redeemed NUMERIC(18,2) DEFAULT 0,
    total_tokens_earned NUMERIC(18,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE letaa_core.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES letaa_core.users(id) ON DELETE CASCADE,
    coins NUMERIC(18,2) DEFAULT 0,
    tokens NUMERIC(18,2) DEFAULT 0,
    status letaa_core.account_status DEFAULT 'ACTIVE',
    total_orders INTEGER DEFAULT 0,
    total_spent NUMERIC(18,2) DEFAULT 0,
    avg_rating_given DECIMAL(3,2) DEFAULT 0,
    loyalty_points INTEGER DEFAULT 0,
    default_address TEXT,
    default_payment_method letaa_core.payment_method DEFAULT 'WALLET',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE letaa_core.levels (
    id SERIAL PRIMARY KEY,
    level_number INTEGER UNIQUE NOT NULL,
    title VARCHAR(100) NOT NULL,
    required_xp INTEGER NOT NULL,
    reward_tokens DECIMAL(18,2) DEFAULT 0,
    description TEXT,
    badge TEXT
);

CREATE TABLE letaa_core.reputation_tiers (
    id SERIAL PRIMARY KEY,
    tier_name VARCHAR(50) UNIQUE NOT NULL,
    min_score DECIMAL(5,2) NOT NULL,
    max_score DECIMAL(5,2) NOT NULL,
    description TEXT
);

-- ============================================================
-- SCHEMA: letaa_delivery
-- ============================================================

CREATE TABLE letaa_delivery.categories (
    id SERIAL PRIMARY KEY,
    name letaa_core.delivery_category UNIQUE NOT NULL,
    description TEXT,
    base_xp INTEGER DEFAULT 50,
    multiplier DECIMAL(3,2) DEFAULT 1.00
);

CREATE TABLE letaa_delivery.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES letaa_core.customers(id) ON DELETE CASCADE,
    rider_id UUID REFERENCES letaa_core.riders(id),
    category letaa_core.delivery_category DEFAULT 'FOOD',
    pickup_location TEXT,
    dropoff_location TEXT,
    special_instructions TEXT,
    payment_method letaa_core.payment_method DEFAULT 'WALLET',
    customer_wallet_address TEXT NOT NULL,
    rider_wallet_address TEXT,
    delivery_fee DECIMAL(10,2),
    tip_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2),
    token_amount NUMERIC(18,8) DEFAULT 0,
    payment_tx_hash TEXT,
    payment_status letaa_core.tx_status DEFAULT 'PENDING',
    status letaa_core.delivery_status DEFAULT 'ASSIGNED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE letaa_delivery.deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES letaa_delivery.orders(id) ON DELETE CASCADE,
    rider_id UUID NOT NULL REFERENCES letaa_core.riders(id) ON DELETE CASCADE,
    category letaa_core.delivery_category DEFAULT 'FOOD',
    pickup_location TEXT,
    dropoff_location TEXT,
    expected_duration INTEGER,
    actual_duration INTEGER,
    distance DECIMAL(10,2),
    delivery_fee DECIMAL(10,2),
    rider_wallet_address TEXT,
    payout_tx_hash TEXT,
    payout_status letaa_core.tx_status DEFAULT 'PENDING',
    status letaa_core.delivery_status DEFAULT 'ASSIGNED',
    is_early BOOLEAN DEFAULT FALSE,
    is_peak_hour BOOLEAN DEFAULT FALSE,
    customer_rating DECIMAL(3,2),
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SCHEMA: letaa_gamification
-- ============================================================

CREATE TABLE letaa_gamification.xp_actions (
    id SERIAL PRIMARY KEY,
    action_name VARCHAR(100) UNIQUE NOT NULL,
    xp_value INTEGER NOT NULL,
    description TEXT
);

CREATE TABLE letaa_gamification.xp_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rider_id UUID REFERENCES letaa_core.riders(id) ON DELETE CASCADE,
    xp INTEGER NOT NULL,
    action VARCHAR(100),
    reason TEXT,
    delivery_id UUID REFERENCES letaa_delivery.deliveries(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE letaa_gamification.achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(150) NOT NULL,
    description TEXT,
    category letaa_core.achievement_category NOT NULL,
    badge_icon TEXT,
    xp_reward INTEGER DEFAULT 100,
    coin_reward DECIMAL(18,2) DEFAULT 0,
    token_reward DECIMAL(18,8) DEFAULT 0,
    target_value INTEGER DEFAULT 1,
    nft_reward BOOLEAN DEFAULT FALSE,
    nft_category letaa_core.nft_category,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE letaa_gamification.rider_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rider_id UUID REFERENCES letaa_core.riders(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES letaa_gamification.achievements(id) ON DELETE CASCADE,
    nft_minted BOOLEAN DEFAULT FALSE,
    nft_tx_hash TEXT,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(rider_id, achievement_id)
);

CREATE TABLE letaa_gamification.quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category letaa_core.mission_category NOT NULL,
    target_value INTEGER NOT NULL,
    reward_xp INTEGER DEFAULT 0,
    reward_coins DECIMAL(18,2) DEFAULT 0,
    reward_gems DECIMAL(18,2) DEFAULT 0,
    reward_tokens DECIMAL(18,8) DEFAULT 0,
    reward_item letaa_core.reward_item,
    reward_item_qty INTEGER DEFAULT 1,
    reward_tx_hash TEXT,
    active BOOLEAN DEFAULT TRUE,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE letaa_gamification.rider_quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rider_id UUID REFERENCES letaa_core.riders(id) ON DELETE CASCADE,
    quest_id UUID REFERENCES letaa_gamification.quests(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    claimed BOOLEAN DEFAULT FALSE,
    claimed_at TIMESTAMP,
    claim_tx_hash TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(rider_id, quest_id)
);

CREATE TABLE letaa_gamification.streaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rider_id UUID REFERENCES letaa_core.riders(id) ON DELETE CASCADE,
    streak_type VARCHAR(50) NOT NULL,
    current_count INTEGER DEFAULT 0,
    best_count INTEGER DEFAULT 0,
    last_active_date DATE,
    reward_claimed BOOLEAN DEFAULT FALSE,
    reward_tx_hash TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(rider_id, streak_type)
);

CREATE TABLE letaa_gamification.feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rider_id UUID REFERENCES letaa_core.riders(id),
    delivery_id UUID REFERENCES letaa_delivery.deliveries(id),
    customer_id UUID REFERENCES letaa_core.customers(id),
    performance_score DECIMAL(5,2),
    performance_grade letaa_core.performance_grade,
    feedback_message TEXT,
    improvement_tip TEXT,
    rating DECIMAL(3,2),
    earned_xp INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SCHEMA: letaa_rewards
-- ============================================================

CREATE TABLE letaa_rewards.rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rider_id UUID REFERENCES letaa_core.riders(id),
    customer_id UUID REFERENCES letaa_core.customers(id),
    wallet_address TEXT NOT NULL,
    category letaa_core.reward_category NOT NULL,
    item letaa_core.reward_item NOT NULL,
    amount DECIMAL(18,2) DEFAULT 1,
    token_amount NUMERIC(18,8) DEFAULT 0,
    reason TEXT,
    source_id UUID,
    source_type VARCHAR(50),
    tx_hash TEXT,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE letaa_rewards.nfts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rider_id UUID REFERENCES letaa_core.riders(id),
    wallet_address TEXT NOT NULL,
    category letaa_core.nft_category NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    image_url TEXT,
    token_id VARCHAR(100),
    contract_address TEXT,
    network letaa_core.blockchain_network DEFAULT 'AVALANCHE',
    achievement_id UUID REFERENCES letaa_gamification.achievements(id),
    quest_id UUID REFERENCES letaa_gamification.quests(id),
    mint_tx_hash TEXT,
    minted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE letaa_rewards.blockchain_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tx_type letaa_core.tx_type NOT NULL,
    from_wallet TEXT NOT NULL,
    to_wallet TEXT NOT NULL,
    from_user_id UUID,
    to_user_id UUID,
    order_id UUID,
    delivery_id UUID,
    reward_id UUID,
    nft_id UUID,
    amount DECIMAL(18,2) DEFAULT 0,
    token_amount NUMERIC(18,8) DEFAULT 0,
    network letaa_core.blockchain_network DEFAULT 'AVALANCHE',
    transaction_hash TEXT,
    block_number BIGINT,
    gas_used NUMERIC(18,8),
    gas_price NUMERIC(18,8),
    status letaa_core.tx_status DEFAULT 'PENDING',
    confirmed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE letaa_rewards.wallet_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address TEXT NOT NULL,
    user_id UUID REFERENCES letaa_core.users(id),
    network letaa_core.blockchain_network DEFAULT 'AVALANCHE',
    token_symbol VARCHAR(20) DEFAULT 'LETAA',
    balance NUMERIC(18,8) DEFAULT 0,
    staked NUMERIC(18,8) DEFAULT 0,
    earned NUMERIC(18,8) DEFAULT 0,
    redeemed NUMERIC(18,8) DEFAULT 0,
    last_synced_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(wallet_address, network, token_symbol)
);

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO letaa_core.levels (level_number, title, required_xp, reward_tokens, description) VALUES
(1,  'Rookie Rider',      0,     0,   'New rider onboarding'),
(2,  'Courier',           200,   2,   'Completed first deliveries'),
(3,  'Street Navigator',  500,   5,   'Consistently completes deliveries'),
(4,  'Route Specialist',  1000,  10,  'Demonstrates efficient routing'),
(5,  'City Explorer',     1800,  15,  'Covers multiple delivery zones'),
(6,  'Express Rider',     3000,  20,  'Maintains high delivery speed'),
(7,  'Elite Courier',     5000,  30,  'Reliable with excellent ratings'),
(8,  'Delivery Champion', 8000,  50,  'Top-performing rider'),
(9,  'Logistics Master',  12000, 80,  'Exceptional consistency'),
(10, 'Avalanche Legend',  20000, 150, 'Highest lifetime achievement');

INSERT INTO letaa_core.reputation_tiers (tier_name, min_score, max_score, description) VALUES
('Beginner',       0,   20,  'Just getting started'),
('Trusted Rider',  21,  40,  'Building trust with deliveries'),
('Verified Rider', 41,  60,  'Consistent and verified performance'),
('Premium Rider',  61,  80,  'Premium tier rider'),
('Elite Rider',    81,  100, 'Top-tier elite rider');

INSERT INTO letaa_delivery.categories (name, description, base_xp, multiplier) VALUES
('FOOD',         'Restaurant and meal deliveries',       50, 1.00),
('GROCERY',      'Grocery and supermarket orders',      50, 1.10),
('PHARMACY',     'Pharmacy and medical deliveries',     50, 1.20),
('ELECTRONICS',  'High-value electronics',               50, 1.30),
('PARCEL',       'General parcel delivery',              50, 1.00),
('DOCUMENT',     'Document and paper delivery',          50, 0.80),
('SAME_DAY',     'Same-day delivery',                    50, 1.15),
('SCHEDULED',    'Pre-scheduled delivery',               50, 1.00),
('EXPRESS',      'Urgent express delivery',              50, 1.50);

INSERT INTO letaa_gamification.xp_actions (action_name, xp_value, description) VALUES
('ACCEPT_DELIVERY',              5,   'Accept an assigned delivery'),
('COMPLETE_DELIVERY',            50,  'Successfully complete a delivery'),
('EARLY_DELIVERY',               30,  'Deliver before expected time'),
('FIVE_STAR_RATING',             40,  'Receive a 5-star customer rating'),
('CONSECUTIVE_DELIVERIES',       25,  'Complete consecutive deliveries'),
('DAILY_LOGIN',                  10,  'Log in daily'),
('WEEKLY_GOAL_COMPLETED',        150, 'Complete weekly delivery goal'),
('MONTHLY_CHALLENGE_COMPLETED',  500, 'Complete monthly challenge'),
('REFERRAL_BONUS',               200, 'Refer a new rider'),
('ACHIEVEMENT_UNLOCKED',         100, 'Unlock an achievement badge'),
('LEVEL_UP',                     75,  'Reach a new level'),
('PERFECT_WEEK',                 300, 'Complete a perfect week'),
('PERFECT_MONTH',                800, 'Complete a perfect month');

INSERT INTO letaa_gamification.achievements (title, description, category, badge_icon, xp_reward, coin_reward, token_reward, target_value) VALUES
('First Delivery',       'Complete your first delivery',     'DELIVERY_MILESTONE', 'badge_first_delivery.png',     100, 10,   0.5,  1),
('10 Deliveries',        'Complete 10 deliveries',           'DELIVERY_MILESTONE', 'badge_10_deliveries.png',      200, 25,   1.0,  10),
('50 Deliveries',        'Complete 50 deliveries',           'DELIVERY_MILESTONE', 'badge_50_deliveries.png',      500, 100,  5.0,  50),
('100 Deliveries',       'Complete 100 deliveries',          'DELIVERY_MILESTONE', 'badge_100_deliveries.png',     800, 250,  10.0, 100),
('500 Deliveries',       'Complete 500 deliveries',          'DELIVERY_MILESTONE', 'badge_500_deliveries.png',     2000, 1000, 50.0, 500),
('1000 Deliveries',      'Complete 1000 deliveries',         'DELIVERY_MILESTONE', 'badge_1000_deliveries.png',    5000, 5000, 100.0, 1000),
('5000 Deliveries',      'Complete 5000 deliveries',         'DELIVERY_MILESTONE', 'badge_5000_deliveries.png',    10000, 25000, 500.0, 5000),
('Speed Starter',        'Complete a delivery under 15 min', 'SPEED', 'badge_speed_starter.png',     100, 10,  0.5,  1),
('Quick Wheels',         'Complete 10 fast deliveries',      'SPEED', 'badge_quick_wheels.png',      250, 25,  1.0,  10),
('Lightning Rider',      'Complete 50 fast deliveries',      'SPEED', 'badge_lightning_rider.png',   500, 100, 5.0,  50),
('Turbo Courier',        'Complete 100 fast deliveries',     'SPEED', 'badge_turbo_courier.png',     1000, 250, 10.0, 100),
('Flash Delivery',       'Complete 250 fast deliveries',     'SPEED', 'badge_flash_delivery.png',    2000, 500, 25.0, 250),
('First 5-Star Rating',  'Receive your first 5-star rating', 'CUSTOMER_SERVICE', 'badge_first_5star.png',        150, 15,  0.5,  1),
('Customer Favorite',    'Receive 25 five-star ratings',     'CUSTOMER_SERVICE', 'badge_customer_favorite.png',  400, 50,  2.0,  25),
('Peoples Choice',       'Receive 100 five-star ratings',    'CUSTOMER_SERVICE', 'badge_peoples_choice.png',     800, 200, 8.0,  100),
('Service Excellence',   'Reach 4.9+ avg rating',            'CUSTOMER_SERVICE', 'badge_service_excellence.png', 1200, 300, 12.0, 1),
('Customer Hero',        'Receive 500 five-star ratings',    'CUSTOMER_SERVICE', 'badge_customer_hero.png',      3000, 1000, 50.0, 500),
('Never Late',              '100% on-time for 30 deliveries', 'RELIABILITY', 'badge_never_late.png',         300, 30,  1.0,  30),
('Seven Day Streak',        '7-day delivery streak',          'RELIABILITY', 'badge_7day_streak.png',        400, 40,  2.0,  7),
('Perfect Attendance',      'Deliver every day for 30 days',  'RELIABILITY', 'badge_perfect_attendance.png',  800, 200, 10.0, 30),
('Zero Cancellations',     '50 deliveries with no cancel',   'RELIABILITY', 'badge_zero_cancel.png',        500, 50,  2.0,  50),
('Reliable Professional',  '100 deliveries no cancel',       'RELIABILITY', 'badge_reliable_pro.png',       1500, 500, 20.0, 100),
('Weekend Warrior',       'Deliver 20 on weekends',          'SPECIAL_EVENT', 'badge_weekend_warrior.png',   300, 30,  1.0,  20),
('Holiday Hero',          'Deliver on a public holiday',     'SPECIAL_EVENT', 'badge_holiday_hero.png',      250, 25,  1.0,  1),
('Rain Rider',            'Deliver in the rain',             'SPECIAL_EVENT', 'badge_rain_rider.png',        200, 20,  0.5,  1),
('Midnight Courier',      'Deliver past midnight',           'SPECIAL_EVENT', 'badge_midnight_courier.png',  200, 20,  0.5,  1),
('Peak Hour Champion',    '50 peak-hour deliveries',         'SPECIAL_EVENT', 'badge_peak_champion.png',     600, 100, 5.0,  50);

INSERT INTO letaa_gamification.quests (title, description, category, target_value, reward_xp, reward_coins, reward_tokens) VALUES
('Complete 5 Deliveries',           'Finish 5 deliveries today',           'DAILY', 5,  50,  5,  0.1),
('On-Time Delivery',                'Deliver every order on time today',   'DAILY', 1,  40,  3,  0.05),
('Three 5-Star Reviews',            'Earn three 5-star ratings today',     'DAILY', 3,  60,  5,  0.1),
('Travel 40 km',                    'Cover 40 km of distance today',       'DAILY', 40, 30,  3,  0.05),
('Accept Every Assigned Order',     'Accept all assigned orders today',    'DAILY', 1,  35,  4,  0.05),
('Three Before Noon',               'Complete 3 deliveries before noon',   'DAILY', 3,  70,  6,  0.1),
('Three Different Zones',           'Deliver in 3 different zones today',  'DAILY', 3,  55,  5,  0.1),
('Peak Hour Shift',                 'Work during peak hours today',        'DAILY', 1,  45,  4,  0.05),
('Complete 50 Deliveries',          'Finish 50 deliveries this week',       'WEEKLY', 50,  300,  30,  1.0),
('95% On-Time Rate',                'Maintain 95% on-time delivery rate',   'WEEKLY', 95,  250,  25,  0.8),
('Twenty 5-Star Ratings',           'Earn twenty 5-star ratings this week', 'WEEKLY', 20,  350,  35,  1.2),
('Five Different Regions',          'Deliver in 5 different regions',       'WEEKLY', 5,   200,  20,  0.6),
('Work Every Day',                  'Deliver every day this week',          'WEEKLY', 7,   400,  40,  1.5),
('Zero Cancellations',              'Finish the week with no cancellations', 'WEEKLY', 1,   300,  30,  1.0),
('Complete 300 Deliveries',         'Finish 300 deliveries this month',       'MONTHLY', 300, 1000, 100, 5.0),
('4.9+ Customer Rating',            'Maintain 4.9+ customer rating',          'MONTHLY', 49,  800,  80,  4.0),
('Reach Next Level',                'Level up this month',                    'MONTHLY', 1,   500,  50,  2.0),
('Earn 5 Badges',                   'Unlock 5 achievement badges this month', 'MONTHLY', 5,   600,  60,  3.0),
('Top 10 Leaderboard',              'Finish in the Top 10 leaderboard',       'MONTHLY', 10,  1200, 120, 6.0),
('Refer 3 Riders',                  'Refer 3 new riders this month',          'MONTHLY', 3,   700,  70,  3.5),
('Summer Sprint',                   'Complete 1000 deliveries in summer',     'SEASONAL', 1000, 3000, 300, 15.0),
('Holiday Rush',                    'Complete 200 deliveries in holiday week', 'HOLIDAY_EVENT', 200, 1500, 150, 8.0),
('Referral Wave',                   'Refer 10 riders in one month',           'REFERRAL', 10, 2000, 200, 10.0),
('Community Clean-Up',              'Participate in community challenge',      'COMMUNITY_CHALLENGE', 1, 500, 50, 2.5),
('Emergency Response',              'Complete 5 emergency deliveries',         'EMERGENCY', 5, 800, 80, 4.0);

-- ============================================================
-- SCHEMA: letaa_analytics (views)
-- ============================================================

CREATE VIEW letaa_analytics.leaderboard_overall AS
SELECT r.id, u.username, u.wallet_address, r.level, r.xp, r.total_deliveries, r.reputation_score, r.performance_grade, r.total_rewards_earned
FROM letaa_core.riders r JOIN letaa_core.users u ON u.id = r.user_id
WHERE r.status = 'ACTIVE'
ORDER BY r.level DESC, r.xp DESC, r.total_deliveries DESC;

CREATE VIEW letaa_analytics.leaderboard_weekly AS
SELECT r.id, u.username, u.wallet_address, r.level, SUM(xh.xp) AS weekly_xp,
    COUNT(d.id) FILTER (WHERE d.created_at >= date_trunc('week', CURRENT_DATE)) AS weekly_deliveries
FROM letaa_core.riders r
JOIN letaa_core.users u ON u.id = r.user_id
LEFT JOIN letaa_gamification.xp_history xh ON xh.rider_id = r.id AND xh.created_at >= date_trunc('week', CURRENT_DATE)
LEFT JOIN letaa_delivery.deliveries d ON d.rider_id = r.id AND d.status = 'DELIVERED' AND d.created_at >= date_trunc('week', CURRENT_DATE)
WHERE r.status = 'ACTIVE'
GROUP BY r.id, u.username, u.wallet_address, r.level ORDER BY weekly_xp DESC;

CREATE VIEW letaa_analytics.leaderboard_monthly AS
SELECT r.id, u.username, u.wallet_address, r.level, SUM(xh.xp) AS monthly_xp,
    COUNT(d.id) FILTER (WHERE d.created_at >= date_trunc('month', CURRENT_DATE)) AS monthly_deliveries
FROM letaa_core.riders r
JOIN letaa_core.users u ON u.id = r.user_id
LEFT JOIN letaa_gamification.xp_history xh ON xh.rider_id = r.id AND xh.created_at >= date_trunc('month', CURRENT_DATE)
LEFT JOIN letaa_delivery.deliveries d ON d.rider_id = r.id AND d.status = 'DELIVERED' AND d.created_at >= date_trunc('month', CURRENT_DATE)
WHERE r.status = 'ACTIVE'
GROUP BY r.id, u.username, u.wallet_address, r.level ORDER BY monthly_xp DESC;

CREATE VIEW letaa_analytics.leaderboard_fastest AS
SELECT r.id, u.username, u.wallet_address, r.level, d.actual_duration, d.distance, d.category, d.completed_at
FROM letaa_core.riders r JOIN letaa_core.users u ON u.id = r.user_id
JOIN letaa_delivery.deliveries d ON d.rider_id = r.id
WHERE d.status = 'DELIVERED' AND d.actual_duration IS NOT NULL
ORDER BY d.actual_duration ASC LIMIT 100;

CREATE VIEW letaa_analytics.leaderboard_rating AS
SELECT r.id, u.username, u.wallet_address, r.level, r.avg_customer_rating, r.total_deliveries, r.reputation_score
FROM letaa_core.riders r JOIN letaa_core.users u ON u.id = r.user_id
WHERE r.status = 'ACTIVE' AND r.total_deliveries >= 10
ORDER BY r.avg_customer_rating DESC, r.total_deliveries DESC;

CREATE VIEW letaa_analytics.leaderboard_deliveries AS
SELECT r.id, u.username, u.wallet_address, r.level, r.total_deliveries, r.successful_deliveries, r.completion_rate, r.ontime_rate
FROM letaa_core.riders r JOIN letaa_core.users u ON u.id = r.user_id
WHERE r.status = 'ACTIVE' ORDER BY r.total_deliveries DESC;

CREATE VIEW letaa_analytics.leaderboard_streaks AS
SELECT r.id, u.username, u.wallet_address, r.level, r.longest_streak, r.current_streak
FROM letaa_core.riders r JOIN letaa_core.users u ON u.id = r.user_id
WHERE r.status = 'ACTIVE' ORDER BY r.longest_streak DESC, r.current_streak DESC;

CREATE VIEW letaa_analytics.leaderboard_reliable AS
SELECT r.id, u.username, u.wallet_address, r.level, r.ontime_rate, r.completion_rate, r.acceptance_rate, r.reputation_score
FROM letaa_core.riders r JOIN letaa_core.users u ON u.id = r.user_id
WHERE r.status = 'ACTIVE' AND r.total_deliveries >= 20
ORDER BY r.reputation_score DESC, r.ontime_rate DESC;

CREATE VIEW letaa_analytics.leaderboard_peak_hours AS
SELECT r.id, u.username, u.wallet_address, r.level, COUNT(d.id) AS peak_deliveries, AVG(d.customer_rating) AS avg_peak_rating
FROM letaa_core.riders r JOIN letaa_core.users u ON u.id = r.user_id
JOIN letaa_delivery.deliveries d ON d.rider_id = r.id
WHERE d.is_peak_hour = TRUE AND d.status = 'DELIVERED'
GROUP BY r.id, u.username, u.wallet_address, r.level ORDER BY peak_deliveries DESC;

CREATE VIEW letaa_analytics.leaderboard_regional AS
SELECT r.id, u.username, u.wallet_address, r.level, d.pickup_location AS region, COUNT(d.id) AS region_deliveries, AVG(d.customer_rating) AS avg_rating
FROM letaa_core.riders r JOIN letaa_core.users u ON u.id = r.user_id
JOIN letaa_delivery.deliveries d ON d.rider_id = r.id
WHERE d.status = 'DELIVERED'
GROUP BY r.id, u.username, u.wallet_address, r.level, d.pickup_location ORDER BY region_deliveries DESC;

CREATE VIEW letaa_analytics.rider_statistics AS
SELECT
    r.id AS rider_id, u.username, u.full_name, u.email, u.phone,
    u.wallet_address, u.wallet_network,
    r.level, r.xp, r.coins, r.gems, r.tokens,
    r.reputation_score, r.performance_grade, r.rider_role, r.status,
    r.total_deliveries, r.successful_deliveries, r.failed_deliveries,
    r.acceptance_rate, r.completion_rate, r.ontime_rate,
    r.avg_delivery_time, r.avg_customer_rating,
    r.total_distance_km, r.total_active_hours,
    r.current_streak, r.longest_streak,
    r.weekly_rank, r.monthly_rank, r.lifetime_rank,
    (SELECT COUNT(*) FROM letaa_gamification.rider_achievements ra WHERE ra.rider_id = r.id) AS total_badges,
    (SELECT COUNT(*) FROM letaa_rewards.nfts n WHERE n.rider_id = r.id) AS total_nfts,
    r.total_coins_earned, r.total_coins_redeemed, r.total_tokens_earned, r.total_rewards_earned,
    rt.tier_name AS reputation_tier, l.title AS level_title
FROM letaa_core.riders r
JOIN letaa_core.users u ON u.id = r.user_id
LEFT JOIN letaa_core.levels l ON l.level_number = r.level
LEFT JOIN letaa_core.reputation_tiers rt ON r.reputation_score BETWEEN rt.min_score AND rt.max_score;

CREATE VIEW letaa_analytics.customer_statistics AS
SELECT
    c.id AS customer_id, u.username, u.full_name, u.email, u.wallet_address,
    c.total_orders, c.total_spent, c.loyalty_points, c.avg_rating_given,
    (SELECT COUNT(*) FROM letaa_delivery.deliveries d JOIN letaa_delivery.orders o ON d.order_id = o.id WHERE o.customer_id = c.id AND d.status = 'DELIVERED') AS completed_orders,
    (SELECT AVG(d.customer_rating) FROM letaa_delivery.deliveries d JOIN letaa_delivery.orders o ON d.order_id = o.id WHERE o.customer_id = c.id AND d.customer_rating IS NOT NULL) AS avg_rating_received
FROM letaa_core.customers c JOIN letaa_core.users u ON u.id = c.user_id;

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_letaa_users_wallet ON letaa_core.users(wallet_address);
CREATE INDEX idx_letaa_users_email ON letaa_core.users(email);
CREATE INDEX idx_letaa_users_role ON letaa_core.users(role);
CREATE INDEX idx_letaa_riders_user ON letaa_core.riders(user_id);
CREATE INDEX idx_letaa_riders_status ON letaa_core.riders(status);
CREATE INDEX idx_letaa_riders_level ON letaa_core.riders(level DESC);
CREATE INDEX idx_letaa_riders_xp ON letaa_core.riders(xp DESC);
CREATE INDEX idx_letaa_riders_reputation ON letaa_core.riders(reputation_score DESC);
CREATE INDEX idx_letaa_customers_user ON letaa_core.customers(user_id);
CREATE INDEX idx_letaa_customers_status ON letaa_core.customers(status);

CREATE INDEX idx_letaa_delivery_order ON letaa_delivery.deliveries(order_id);
CREATE INDEX idx_letaa_delivery_rider ON letaa_delivery.deliveries(rider_id);
CREATE INDEX idx_letaa_delivery_status ON letaa_delivery.deliveries(status);
CREATE INDEX idx_letaa_delivery_category ON letaa_delivery.deliveries(category);
CREATE INDEX idx_letaa_delivery_created ON letaa_delivery.deliveries(created_at DESC);
CREATE INDEX idx_letaa_delivery_peak ON letaa_delivery.deliveries(is_peak_hour) WHERE is_peak_hour = TRUE;
CREATE INDEX idx_letaa_delivery_rider_wallet ON letaa_delivery.deliveries(rider_wallet_address);
CREATE INDEX idx_letaa_delivery_payout_status ON letaa_delivery.deliveries(payout_status);
CREATE INDEX idx_letaa_orders_customer ON letaa_delivery.orders(customer_id);
CREATE INDEX idx_letaa_orders_rider ON letaa_delivery.orders(rider_id);
CREATE INDEX idx_letaa_orders_status ON letaa_delivery.orders(status);
CREATE INDEX idx_letaa_orders_customer_wallet ON letaa_delivery.orders(customer_wallet_address);
CREATE INDEX idx_letaa_orders_rider_wallet ON letaa_delivery.orders(rider_wallet_address);
CREATE INDEX idx_letaa_orders_payment_status ON letaa_delivery.orders(payment_status);
CREATE INDEX idx_letaa_orders_payment_tx ON letaa_delivery.orders(payment_tx_hash);

CREATE INDEX idx_letaa_xp_rider ON letaa_gamification.xp_history(rider_id);
CREATE INDEX idx_letaa_xp_created ON letaa_gamification.xp_history(created_at DESC);
CREATE INDEX idx_letaa_achievements_category ON letaa_gamification.achievements(category);
CREATE INDEX idx_letaa_rider_achievements_rider ON letaa_gamification.rider_achievements(rider_id);
CREATE INDEX idx_letaa_rider_achievements_achievement ON letaa_gamification.rider_achievements(achievement_id);
CREATE INDEX idx_letaa_quests_category ON letaa_gamification.quests(category);
CREATE INDEX idx_letaa_quests_active ON letaa_gamification.quests(active) WHERE active = TRUE;
CREATE INDEX idx_letaa_rider_quests_rider ON letaa_gamification.rider_quests(rider_id);
CREATE INDEX idx_letaa_rider_quests_quest ON letaa_gamification.rider_quests(quest_id);
CREATE INDEX idx_letaa_rider_quests_active ON letaa_gamification.rider_quests(rider_id, completed) WHERE completed = FALSE;
CREATE INDEX idx_letaa_feedback_rider ON letaa_gamification.feedback(rider_id);
CREATE INDEX idx_letaa_feedback_delivery ON letaa_gamification.feedback(delivery_id);
CREATE INDEX idx_letaa_streaks_rider ON letaa_gamification.streaks(rider_id);

CREATE INDEX idx_letaa_rewards_rider ON letaa_rewards.rewards(rider_id);
CREATE INDEX idx_letaa_rewards_customer ON letaa_rewards.rewards(customer_id);
CREATE INDEX idx_letaa_rewards_wallet ON letaa_rewards.rewards(wallet_address);
CREATE INDEX idx_letaa_rewards_category ON letaa_rewards.rewards(category);
CREATE INDEX idx_letaa_rewards_status ON letaa_rewards.rewards(status);
CREATE INDEX idx_letaa_rewards_tx ON letaa_rewards.rewards(tx_hash);
CREATE INDEX idx_letaa_nfts_rider ON letaa_rewards.nfts(rider_id);
CREATE INDEX idx_letaa_nfts_wallet ON letaa_rewards.nfts(wallet_address);
CREATE INDEX idx_letaa_nfts_category ON letaa_rewards.nfts(category);
CREATE INDEX idx_letaa_nfts_mint_tx ON letaa_rewards.nfts(mint_tx_hash);
CREATE INDEX idx_letaa_tx_from_wallet ON letaa_rewards.blockchain_transactions(from_wallet);
CREATE INDEX idx_letaa_tx_to_wallet ON letaa_rewards.blockchain_transactions(to_wallet);
CREATE INDEX idx_letaa_tx_type ON letaa_rewards.blockchain_transactions(tx_type);
CREATE INDEX idx_letaa_tx_status ON letaa_rewards.blockchain_transactions(status);
CREATE INDEX idx_letaa_tx_hash ON letaa_rewards.blockchain_transactions(transaction_hash);
CREATE INDEX idx_letaa_tx_order ON letaa_rewards.blockchain_transactions(order_id);
CREATE INDEX idx_letaa_tx_created ON letaa_rewards.blockchain_transactions(created_at DESC);
CREATE INDEX idx_letaa_wallet_balance_address ON letaa_rewards.wallet_balances(wallet_address);
CREATE INDEX idx_letaa_wallet_balance_user ON letaa_rewards.wallet_balances(user_id);

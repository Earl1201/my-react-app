-- ============================================================
--  NeighborHub — Local Community Marketplace
--  Database Schema (MySQL)
--  April 4 Deliverable
-- ============================================================

CREATE DATABASE IF NOT EXISTS neighborhub;
USE neighborhub;

-- ──────────────────────────────────────────────────────────────
-- 1. USERS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE users (
  id           INT UNSIGNED     AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(100)     NOT NULL,
  email        VARCHAR(150)     NOT NULL UNIQUE,
  password     VARCHAR(255)     NOT NULL,       -- bcrypt hash
  avatar_url   VARCHAR(500)     DEFAULT NULL,
  phone        VARCHAR(20)      DEFAULT NULL,
  bio          TEXT             DEFAULT NULL,
  city         VARCHAR(100)     DEFAULT NULL,
  barangay     VARCHAR(100)     DEFAULT NULL,
  latitude     DECIMAL(10, 8)   DEFAULT NULL,   -- GPS
  longitude    DECIMAL(11, 8)   DEFAULT NULL,
  role         ENUM('buyer','seller','both','admin') DEFAULT 'both',
  is_verified  TINYINT(1)       DEFAULT 0,
  created_at   TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ──────────────────────────────────────────────────────────────
-- 2. CATEGORIES
-- ──────────────────────────────────────────────────────────────
CREATE TABLE categories (
  id          INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL UNIQUE,
  slug        VARCHAR(100)  NOT NULL UNIQUE,
  icon        VARCHAR(10)   DEFAULT NULL,   -- emoji icon
  parent_id   INT UNSIGNED  DEFAULT NULL,  -- for subcategories
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Seed categories
INSERT INTO categories (name, slug, icon) VALUES
  ('Home & Garden',  'home-garden',   '🏡'),
  ('Electronics',    'electronics',   '📱'),
  ('Vehicles',       'vehicles',      '🚗'),
  ('Fashion',        'fashion',       '👗'),
  ('Tutoring',       'tutoring',      '📚'),
  ('Home Repairs',   'home-repairs',  '🔧'),
  ('Delivery',       'delivery',      '📦'),
  ('Health & Beauty','health-beauty', '💊'),
  ('Food & Drinks',  'food-drinks',   '🍽️'),
  ('Sports',         'sports',        '⚽');

-- ──────────────────────────────────────────────────────────────
-- 3. LISTINGS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE listings (
  id            INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  user_id       INT UNSIGNED    NOT NULL,
  category_id   INT UNSIGNED    NOT NULL,
  title         VARCHAR(200)    NOT NULL,
  description   TEXT            NOT NULL,
  price         DECIMAL(10, 2)  NOT NULL,
  price_type    ENUM('fixed','negotiable','free','per_hour') DEFAULT 'fixed',
  listing_type  ENUM('product','service')                    NOT NULL,
  `condition`   ENUM('new','used','refurbished')             DEFAULT NULL,
  city          VARCHAR(100)    DEFAULT NULL,
  barangay      VARCHAR(100)    DEFAULT NULL,
  latitude      DECIMAL(10, 8)  DEFAULT NULL,
  longitude     DECIMAL(11, 8)  DEFAULT NULL,
  status        ENUM('active','inactive','sold','deleted')   DEFAULT 'active',
  view_count    INT UNSIGNED    DEFAULT 0,
  created_at    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)     REFERENCES users(id)      ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- ──────────────────────────────────────────────────────────────
-- 4. LISTING IMAGES
-- ──────────────────────────────────────────────────────────────
CREATE TABLE listing_images (
  id          INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  listing_id  INT UNSIGNED  NOT NULL,
  image_url   VARCHAR(500)  NOT NULL,
  is_primary  TINYINT(1)    DEFAULT 0,
  sort_order  INT UNSIGNED  DEFAULT 0,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

-- ──────────────────────────────────────────────────────────────
-- 5. REVIEWS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE reviews (
  id           INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  reviewer_id  INT UNSIGNED  NOT NULL,   -- who wrote it
  seller_id    INT UNSIGNED  NOT NULL,   -- who is reviewed
  listing_id   INT UNSIGNED  DEFAULT NULL,
  rating       TINYINT UNSIGNED NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment      TEXT          DEFAULT NULL,
  created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_review (reviewer_id, seller_id, listing_id),
  FOREIGN KEY (reviewer_id) REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (seller_id)   REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (listing_id)  REFERENCES listings(id) ON DELETE SET NULL
);

-- ──────────────────────────────────────────────────────────────
-- 6. CONVERSATIONS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE conversations (
  id          INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  listing_id  INT UNSIGNED  DEFAULT NULL,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE SET NULL
);

CREATE TABLE conversation_participants (
  conversation_id  INT UNSIGNED  NOT NULL,
  user_id          INT UNSIGNED  NOT NULL,
  PRIMARY KEY (conversation_id, user_id),
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)         REFERENCES users(id)         ON DELETE CASCADE
);

-- ──────────────────────────────────────────────────────────────
-- 7. MESSAGES
-- ──────────────────────────────────────────────────────────────
CREATE TABLE messages (
  id               INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  conversation_id  INT UNSIGNED  NOT NULL,
  sender_id        INT UNSIGNED  NOT NULL,
  content          TEXT          NOT NULL,
  is_read          TINYINT(1)    DEFAULT 0,
  created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id)       REFERENCES users(id)         ON DELETE CASCADE
);

-- ──────────────────────────────────────────────────────────────
-- 8. ORDERS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE orders (
  id           INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  buyer_id     INT UNSIGNED    NOT NULL,
  seller_id    INT UNSIGNED    NOT NULL,
  listing_id   INT UNSIGNED    NOT NULL,
  quantity     INT UNSIGNED    DEFAULT 1,
  total_price  DECIMAL(10, 2)  NOT NULL,
  status       ENUM('pending','confirmed','in_progress','completed','cancelled','refunded') DEFAULT 'pending',
  notes        TEXT            DEFAULT NULL,
  created_at   TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id)   REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (seller_id)  REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE RESTRICT
);

-- ──────────────────────────────────────────────────────────────
-- 9. NOTIFICATIONS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE notifications (
  id          INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED  NOT NULL,
  type        VARCHAR(50)   NOT NULL,       -- 'new_message', 'order_update', 'new_review'
  title       VARCHAR(200)  NOT NULL,
  body        TEXT          DEFAULT NULL,
  link        VARCHAR(500)  DEFAULT NULL,   -- e.g. /orders/12
  is_read     TINYINT(1)    DEFAULT 0,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ──────────────────────────────────────────────────────────────
-- 10. SAVED LISTINGS (Wishlist / Bookmarks)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE saved_listings (
  user_id     INT UNSIGNED  NOT NULL,
  listing_id  INT UNSIGNED  NOT NULL,
  saved_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, listing_id),
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

-- ============================================================
--  Entity Relationships Summary
-- ============================================================
--  users          (1) --< listings       (many)   user posts many listings
--  users          (1) --< reviews        (many)   as reviewer AND as seller
--  listings       (1) --< listing_images (many)
--  categories     (1) --< listings       (many)
--  listings       (1) --< orders         (many)
--  conversations  (many) >--< users      via conversation_participants
--  conversations  (1) --< messages       (many)
--  users          (1) --< notifications  (many)
--  users          (many) >--< listings   via saved_listings
-- ============================================================

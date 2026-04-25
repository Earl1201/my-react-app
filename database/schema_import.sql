-- NeighborHub — Local Community Marketplace
-- Database Schema (MySQL 5.5 compatible)

CREATE TABLE IF NOT EXISTS users (
  id           INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(100)   NOT NULL,
  email        VARCHAR(150)   NOT NULL UNIQUE,
  password     VARCHAR(255)   NOT NULL,
  avatar_url   VARCHAR(500)   DEFAULT NULL,
  phone        VARCHAR(20)    DEFAULT NULL,
  bio          TEXT           DEFAULT NULL,
  city         VARCHAR(100)   DEFAULT NULL,
  barangay     VARCHAR(100)   DEFAULT NULL,
  latitude     DECIMAL(10,8)  DEFAULT NULL,
  longitude    DECIMAL(11,8)  DEFAULT NULL,
  role         ENUM('buyer','seller','both','admin') DEFAULT 'both',
  is_verified  TINYINT(1)     DEFAULT 0,
  created_at   TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME       DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id         INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100)  NOT NULL UNIQUE,
  slug       VARCHAR(100)  NOT NULL UNIQUE,
  icon       VARCHAR(20)   DEFAULT NULL,
  parent_id  INT UNSIGNED  DEFAULT NULL,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

INSERT IGNORE INTO categories (name, slug, icon) VALUES
  ('Home & Garden',   'home-garden',   'Home'),
  ('Electronics',     'electronics',   'Electronics'),
  ('Vehicles',        'vehicles',      'Vehicles'),
  ('Fashion',         'fashion',       'Fashion'),
  ('Tutoring',        'tutoring',      'Tutoring'),
  ('Home Repairs',    'home-repairs',  'Repairs'),
  ('Delivery',        'delivery',      'Delivery'),
  ('Health & Beauty', 'health-beauty', 'Health'),
  ('Food & Drinks',   'food-drinks',   'Food'),
  ('Sports',          'sports',        'Sports');

CREATE TABLE IF NOT EXISTS listings (
  id            INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  user_id       INT UNSIGNED   NOT NULL,
  category_id   INT UNSIGNED   NOT NULL,
  title         VARCHAR(200)   NOT NULL,
  description   TEXT           NOT NULL,
  price         DECIMAL(10,2)  NOT NULL,
  price_type    ENUM('fixed','negotiable','free','per_hour') DEFAULT 'fixed',
  listing_type  ENUM('product','service') NOT NULL,
  `condition`   ENUM('new','used','refurbished') DEFAULT NULL,
  city          VARCHAR(100)   DEFAULT NULL,
  barangay      VARCHAR(100)   DEFAULT NULL,
  latitude      DECIMAL(10,8)  DEFAULT NULL,
  longitude     DECIMAL(11,8)  DEFAULT NULL,
  status        ENUM('active','inactive','sold','deleted') DEFAULT 'active',
  view_count    INT UNSIGNED   DEFAULT 0,
  created_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME       DEFAULT NULL,
  FOREIGN KEY (user_id)     REFERENCES users(id)      ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS listing_images (
  id          INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  listing_id  INT UNSIGNED  NOT NULL,
  image_url   VARCHAR(500)  NOT NULL,
  is_primary  TINYINT(1)    DEFAULT 0,
  sort_order  INT UNSIGNED  DEFAULT 0,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
  id           INT UNSIGNED     AUTO_INCREMENT PRIMARY KEY,
  reviewer_id  INT UNSIGNED     NOT NULL,
  seller_id    INT UNSIGNED     NOT NULL,
  listing_id   INT UNSIGNED     DEFAULT NULL,
  rating       TINYINT UNSIGNED NOT NULL,
  comment      TEXT             DEFAULT NULL,
  created_at   TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_review (reviewer_id, seller_id, listing_id),
  FOREIGN KEY (reviewer_id) REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (seller_id)   REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (listing_id)  REFERENCES listings(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS conversations (
  id          INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  listing_id  INT UNSIGNED  DEFAULT NULL,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS conversation_participants (
  conversation_id  INT UNSIGNED  NOT NULL,
  user_id          INT UNSIGNED  NOT NULL,
  PRIMARY KEY (conversation_id, user_id),
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)         REFERENCES users(id)         ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
  id               INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  conversation_id  INT UNSIGNED  NOT NULL,
  sender_id        INT UNSIGNED  NOT NULL,
  content          TEXT          NOT NULL,
  is_read          TINYINT(1)    DEFAULT 0,
  created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id)       REFERENCES users(id)         ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  id           INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  buyer_id     INT UNSIGNED   NOT NULL,
  seller_id    INT UNSIGNED   NOT NULL,
  listing_id   INT UNSIGNED   NOT NULL,
  quantity     INT UNSIGNED   DEFAULT 1,
  total_price  DECIMAL(10,2)  NOT NULL,
  status       ENUM('pending','confirmed','in_progress','completed','cancelled','refunded') DEFAULT 'pending',
  notes        TEXT           DEFAULT NULL,
  created_at   TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME       DEFAULT NULL,
  FOREIGN KEY (buyer_id)   REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (seller_id)  REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS notifications (
  id          INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED  NOT NULL,
  type        VARCHAR(50)   NOT NULL,
  title       VARCHAR(200)  NOT NULL,
  body        TEXT          DEFAULT NULL,
  link        VARCHAR(500)  DEFAULT NULL,
  is_read     TINYINT(1)    DEFAULT 0,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS saved_listings (
  user_id     INT UNSIGNED  NOT NULL,
  listing_id  INT UNSIGNED  NOT NULL,
  saved_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, listing_id),
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

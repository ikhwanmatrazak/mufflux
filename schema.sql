-- ============================================================
-- Mufflux Exhaust System — MySQL 8.0 Database Schema
-- CHARSET=utf8mb4, ENGINE=InnoDB
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- ============================================================
-- USERS & AUTH
-- ============================================================

CREATE TABLE IF NOT EXISTS `users` (
  `id`              INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  `name`            VARCHAR(120)      NOT NULL,
  `email`           VARCHAR(180)      NOT NULL,
  `password_hash`   VARCHAR(255)      NOT NULL,
  `phone`           VARCHAR(20)       DEFAULT NULL,
  `role`            ENUM('customer','admin') NOT NULL DEFAULT 'customer',
  `loyalty_points`  INT               NOT NULL DEFAULT 0,
  `is_active`       TINYINT(1)        NOT NULL DEFAULT 1,
  `created_at`      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `addresses` (
  `id`            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `user_id`       INT UNSIGNED  NOT NULL,
  `label`         VARCHAR(80)   NOT NULL DEFAULT 'Home',
  `address_line1` VARCHAR(255)  NOT NULL,
  `address_line2` VARCHAR(255)  DEFAULT NULL,
  `city`          VARCHAR(100)  NOT NULL,
  `state`         VARCHAR(100)  NOT NULL,
  `postcode`      VARCHAR(10)   NOT NULL,
  `is_default`    TINYINT(1)    NOT NULL DEFAULT 0,
  `created_at`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_addresses_user_id` (`user_id`),
  CONSTRAINT `fk_addresses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- MOTORCYCLES (FITMENT FILTER)
-- ============================================================

CREATE TABLE IF NOT EXISTS `motorcycle_brands` (
  `id`         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(100)  NOT NULL,
  `logo_url`   VARCHAR(500)  DEFAULT NULL,
  `created_at` DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_moto_brand_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `motorcycle_models` (
  `id`        INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `brand_id`  INT UNSIGNED  NOT NULL,
  `name`      VARCHAR(120)  NOT NULL,
  `year_from` INT           NOT NULL,
  `year_to`   INT           DEFAULT NULL,
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_moto_models_brand_id` (`brand_id`),
  CONSTRAINT `fk_moto_models_brand` FOREIGN KEY (`brand_id`) REFERENCES `motorcycle_brands` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `engine_sizes` (
  `id`    INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `cc`    INT           NOT NULL,
  `label` VARCHAR(20)   NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_engine_cc` (`cc`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- PRODUCTS & CATALOG
-- ============================================================

CREATE TABLE IF NOT EXISTS `categories` (
  `id`         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `name_en`    VARCHAR(120)  NOT NULL,
  `name_bm`    VARCHAR(120)  NOT NULL,
  `slug`       VARCHAR(160)  NOT NULL,
  `image_url`  VARCHAR(500)  DEFAULT NULL,
  `parent_id`  INT UNSIGNED  DEFAULT NULL,
  `sort_order` INT           NOT NULL DEFAULT 0,
  `created_at` DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_categories_slug` (`slug`),
  INDEX `idx_categories_parent` (`parent_id`),
  CONSTRAINT `fk_categories_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `products` (
  `id`              INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  `name_en`         VARCHAR(255)      NOT NULL,
  `name_bm`         VARCHAR(255)      NOT NULL,
  `slug`            VARCHAR(300)      NOT NULL,
  `description_en`  TEXT              DEFAULT NULL,
  `description_bm`  TEXT              DEFAULT NULL,
  `price`           DECIMAL(10,2)     NOT NULL,
  `compare_price`   DECIMAL(10,2)     DEFAULT NULL,
  `sku`             VARCHAR(100)      NOT NULL,
  `stock_qty`       INT               NOT NULL DEFAULT 0,
  `weight_kg`       DECIMAL(5,2)      DEFAULT NULL,
  `is_active`       TINYINT(1)        NOT NULL DEFAULT 1,
  `category_id`     INT UNSIGNED      DEFAULT NULL,
  `created_at`      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_products_slug` (`slug`),
  UNIQUE KEY `uq_products_sku` (`sku`),
  INDEX `idx_products_category` (`category_id`),
  INDEX `idx_products_is_active` (`is_active`),
  INDEX `idx_products_price` (`price`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `product_images` (
  `id`         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `product_id` INT UNSIGNED  NOT NULL,
  `image_url`  VARCHAR(500)  NOT NULL,
  `public_id`  VARCHAR(255)  DEFAULT NULL,
  `is_primary` TINYINT(1)    NOT NULL DEFAULT 0,
  `sort_order` INT           NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `idx_product_images_product` (`product_id`),
  CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `product_variants` (
  `id`             INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  `product_id`     INT UNSIGNED   NOT NULL,
  `variant_name`   VARCHAR(100)   NOT NULL,
  `price_modifier` DECIMAL(10,2)  NOT NULL DEFAULT 0,
  `stock_qty`      INT            NOT NULL DEFAULT 0,
  `sku`            VARCHAR(100)   NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_variant_sku` (`sku`),
  INDEX `idx_variants_product` (`product_id`),
  CONSTRAINT `fk_variants_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `product_fitments` (
  `id`             INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `product_id`     INT UNSIGNED  NOT NULL,
  `brand_id`       INT UNSIGNED  NOT NULL,
  `model_id`       INT UNSIGNED  NOT NULL,
  `engine_size_id` INT UNSIGNED  DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_fitments_product` (`product_id`),
  INDEX `idx_fitments_brand` (`brand_id`),
  INDEX `idx_fitments_model` (`model_id`),
  CONSTRAINT `fk_fitments_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fitments_brand` FOREIGN KEY (`brand_id`) REFERENCES `motorcycle_brands` (`id`),
  CONSTRAINT `fk_fitments_model` FOREIGN KEY (`model_id`) REFERENCES `motorcycle_models` (`id`),
  CONSTRAINT `fk_fitments_engine` FOREIGN KEY (`engine_size_id`) REFERENCES `engine_sizes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `product_reviews` (
  `id`          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `product_id`  INT UNSIGNED  NOT NULL,
  `user_id`     INT UNSIGNED  NOT NULL,
  `rating`      TINYINT       NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
  `comment`     TEXT          DEFAULT NULL,
  `is_approved` TINYINT(1)    NOT NULL DEFAULT 0,
  `created_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_reviews_product` (`product_id`),
  INDEX `idx_reviews_user` (`user_id`),
  INDEX `idx_reviews_approved` (`is_approved`),
  CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `wishlists` (
  `id`         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `user_id`    INT UNSIGNED  NOT NULL,
  `product_id` INT UNSIGNED  NOT NULL,
  `created_at` DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_wishlist_user_product` (`user_id`, `product_id`),
  INDEX `idx_wishlist_user` (`user_id`),
  CONSTRAINT `fk_wishlist_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_wishlist_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- ORDERS
-- ============================================================

CREATE TABLE IF NOT EXISTS `orders` (
  `id`               INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `user_id`          INT UNSIGNED    NOT NULL,
  `status`           ENUM('pending','paid','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  `subtotal`         DECIMAL(10,2)   NOT NULL,
  `shipping_fee`     DECIMAL(10,2)   NOT NULL DEFAULT 0,
  `discount_amount`  DECIMAL(10,2)   NOT NULL DEFAULT 0,
  `loyalty_discount` DECIMAL(10,2)   NOT NULL DEFAULT 0,
  `total_amount`     DECIMAL(10,2)   NOT NULL,
  `payment_method`   VARCHAR(50)     DEFAULT NULL,
  `payment_ref`      VARCHAR(255)    DEFAULT NULL,
  `shipping_type`    ENUM('delivery','pickup','installation') NOT NULL DEFAULT 'delivery',
  `courier`          VARCHAR(50)     DEFAULT NULL,
  `tracking_number`  VARCHAR(100)    DEFAULT NULL,
  `notes`            TEXT            DEFAULT NULL,
  `created_at`       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_orders_user` (`user_id`),
  INDEX `idx_orders_status` (`status`),
  INDEX `idx_orders_created_at` (`created_at`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `order_items` (
  `id`         INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  `order_id`   INT UNSIGNED   NOT NULL,
  `product_id` INT UNSIGNED   NOT NULL,
  `variant_id` INT UNSIGNED   DEFAULT NULL,
  `qty`        INT            NOT NULL,
  `unit_price` DECIMAL(10,2)  NOT NULL,
  `subtotal`   DECIMAL(10,2)  NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_order_items_order` (`order_id`),
  INDEX `idx_order_items_product` (`product_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `fk_order_items_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `order_addresses` (
  `id`            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `order_id`      INT UNSIGNED  NOT NULL,
  `name`          VARCHAR(120)  NOT NULL,
  `phone`         VARCHAR(20)   NOT NULL,
  `address_line1` VARCHAR(255)  NOT NULL,
  `address_line2` VARCHAR(255)  DEFAULT NULL,
  `city`          VARCHAR(100)  NOT NULL,
  `state`         VARCHAR(100)  NOT NULL,
  `postcode`      VARCHAR(10)   NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_order_address` (`order_id`),
  CONSTRAINT `fk_order_addresses_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SHIPPING & INSTALLATION
-- ============================================================

CREATE TABLE IF NOT EXISTS `shipping_rates` (
  `id`         INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  `courier`    ENUM('poslaju','jnt','dhl','flat') NOT NULL,
  `zone`       VARCHAR(50)    NOT NULL,
  `min_weight` DECIMAL(5,2)   NOT NULL DEFAULT 0,
  `max_weight` DECIMAL(5,2)   NOT NULL,
  `rate_myr`   DECIMAL(10,2)  NOT NULL,
  `is_active`  TINYINT(1)     NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  INDEX `idx_shipping_courier` (`courier`),
  INDEX `idx_shipping_zone` (`zone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `installation_bookings` (
  `id`                INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `order_id`          INT UNSIGNED  DEFAULT NULL,
  `user_id`           INT UNSIGNED  NOT NULL,
  `preferred_date`    DATE          NOT NULL,
  `preferred_time`    TIME          NOT NULL,
  `workshop_location` VARCHAR(255)  DEFAULT NULL,
  `status`            ENUM('pending','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending',
  `notes`             TEXT          DEFAULT NULL,
  `created_at`        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_bookings_order` (`order_id`),
  INDEX `idx_bookings_user` (`user_id`),
  INDEX `idx_bookings_date` (`preferred_date`),
  INDEX `idx_bookings_status` (`status`),
  CONSTRAINT `fk_bookings_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_bookings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- PAYMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS `payments` (
  `id`              INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  `order_id`        INT UNSIGNED   NOT NULL,
  `gateway`         ENUM('billplz') NOT NULL DEFAULT 'billplz',
  `billplz_bill_id` VARCHAR(255)   DEFAULT NULL,
  `billplz_url`     VARCHAR(500)   DEFAULT NULL,
  `amount_myr`      DECIMAL(10,2)  NOT NULL,
  `status`          ENUM('pending','paid','failed') NOT NULL DEFAULT 'pending',
  `paid_at`         DATETIME       DEFAULT NULL,
  `callback_data`   JSON           DEFAULT NULL,
  `created_at`      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_payments_order` (`order_id`),
  INDEX `idx_payments_status` (`status`),
  CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- PROMOTIONS & LOYALTY
-- ============================================================

CREATE TABLE IF NOT EXISTS `discount_codes` (
  `id`            INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  `code`          VARCHAR(50)    NOT NULL,
  `type`          ENUM('percent','fixed') NOT NULL,
  `value`         DECIMAL(10,2)  NOT NULL,
  `min_order_myr` DECIMAL(10,2)  NOT NULL DEFAULT 0,
  `max_uses`      INT            DEFAULT NULL,
  `used_count`    INT            NOT NULL DEFAULT 0,
  `expires_at`    DATETIME       DEFAULT NULL,
  `is_active`     TINYINT(1)     NOT NULL DEFAULT 1,
  `created_at`    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_discount_code` (`code`),
  INDEX `idx_discount_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `loyalty_transactions` (
  `id`        INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `user_id`   INT UNSIGNED  NOT NULL,
  `points`    INT           NOT NULL,
  `type`      ENUM('earn','redeem') NOT NULL,
  `reference` VARCHAR(255)  DEFAULT NULL,
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_loyalty_user` (`user_id`),
  CONSTRAINT `fk_loyalty_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- BLOG
-- ============================================================

CREATE TABLE IF NOT EXISTS `blog_posts` (
  `id`              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `title_en`        VARCHAR(255)  NOT NULL,
  `title_bm`        VARCHAR(255)  NOT NULL,
  `slug`            VARCHAR(300)  NOT NULL,
  `body_en`         LONGTEXT      DEFAULT NULL,
  `body_bm`         LONGTEXT      DEFAULT NULL,
  `cover_image_url` VARCHAR(500)  DEFAULT NULL,
  `author_id`       INT UNSIGNED  NOT NULL,
  `is_published`    TINYINT(1)    NOT NULL DEFAULT 0,
  `published_at`    DATETIME      DEFAULT NULL,
  `created_at`      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_blog_slug` (`slug`),
  INDEX `idx_blog_author` (`author_id`),
  INDEX `idx_blog_published` (`is_published`),
  INDEX `idx_blog_published_at` (`published_at`),
  CONSTRAINT `fk_blog_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO `engine_sizes` (`cc`, `label`) VALUES
  (110, '110cc'), (115, '115cc'), (125, '125cc'), (150, '150cc'),
  (155, '155cc'), (250, '250cc'), (300, '300cc'), (400, '400cc');

INSERT INTO `motorcycle_brands` (`name`) VALUES
  ('Honda'), ('Yamaha'), ('Kawasaki'), ('Suzuki'), ('Modenas'),
  ('Benelli'), ('SYM'), ('Demak'), ('Kriss'), ('Lagenda');

INSERT INTO `categories` (`name_en`, `name_bm`, `slug`, `sort_order`) VALUES
  ('Full System Exhaust', 'Ekzos Sistem Penuh', 'full-system-exhaust', 1),
  ('Slip-On Exhaust', 'Ekzos Slip-On', 'slip-on-exhaust', 2),
  ('Mid Pipe', 'Paip Tengah', 'mid-pipe', 3),
  ('Headers', 'Pengepala Ekzos', 'headers', 4),
  ('End Can', 'Hujung Silinder', 'end-can', 5);

SET FOREIGN_KEY_CHECKS = 1;

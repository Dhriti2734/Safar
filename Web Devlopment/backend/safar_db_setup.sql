CREATE DATABASE IF NOT EXISTS safar;
USE safar;

-- ── users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100)  NOT NULL,
    email      VARCHAR(100)  NOT NULL UNIQUE,
    password   VARCHAR(255)  NOT NULL,
    role       ENUM('user','owner') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── trips ────────────────────────────────────────────────────
--  Organizer/owner can add travel packages / trips
CREATE TABLE IF NOT EXISTS trips (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    title        VARCHAR(150) NOT NULL,
    location     VARCHAR(150) NOT NULL,
    price        DECIMAL(10,2) NOT NULL,
    image        VARCHAR(255) DEFAULT '',
    organizer_id INT,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ── hotel_bookings ───────────────────────────────────────────
--  User sends a booking / bargain request for a hotel
CREATE TABLE IF NOT EXISTS hotel_bookings (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    user_id        INT NOT NULL,
    property_name  VARCHAR(150) NOT NULL,
    original_price DECIMAL(10,2),
    offered_price  DECIMAL(10,2),
    owner_email    VARCHAR(100),
    checkin        DATE NOT NULL,
    checkout       DATE NOT NULL,
    guests         INT DEFAULT 1,
    city           VARCHAR(100) DEFAULT '',
    status         ENUM('Pending','Accepted','Rejected','Paid & Confirmed') DEFAULT 'Pending',
    booked_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── activity_bookings ────────────────────────────────────────
--  User books a tourist activity
CREATE TABLE IF NOT EXISTS activity_bookings (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    user_id          INT NOT NULL,
    activity_name    VARCHAR(150) NOT NULL,
    city             VARCHAR(100) DEFAULT '',
    date             DATE NOT NULL,
    people           INT DEFAULT 1,
    price_per_person DECIMAL(10,2),
    total            DECIMAL(10,2),
    contact_name     VARCHAR(100),
    phone            VARCHAR(20),
    special          TEXT,
    status           ENUM('Confirmed','Cancelled') DEFAULT 'Confirmed',
    booked_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT IGNORE INTO users (name, email, password, role) VALUES
  ('Test User',  'user@safar.com',  '123456', 'user'),
  ('Test Owner', 'owner@safar.com', '123456', 'owner'),
  ('Owner One',  'owner1@gmail.com','123456', 'owner'),
  ('Owner Two',  'owner2@gmail.com','123456', 'owner');

INSERT IGNORE INTO trips (title, location, price, image, organizer_id) VALUES
  ('Chopta Weekend Escape',   'Chopta',     6999,  'chopta.webp',   2),
  ('Rishikesh Adventure',     'Rishikesh',  4500,  'rishikesh.jpg', 2),
  ('Mussoorie Hill Retreat',  'Mussoorie',  6500,  'mussorie.jpg',  2);

SELECT 'Database setup complete ✅' AS status;

-- Create database
CREATE DATABASE IF NOT EXISTS adreport;
USE adreport;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ads table
CREATE TABLE IF NOT EXISTS ads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  campaign_name VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  ad_type VARCHAR(50) NOT NULL,
  budget DECIMAL(10, 2) NOT NULL,
  target_audience TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  status ENUM('draft', 'active', 'paused', 'completed') DEFAULT 'draft',
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  conversions INT DEFAULT 0,
  cost DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Analytics table for daily stats
CREATE TABLE IF NOT EXISTS ad_analytics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ad_id INT NOT NULL,
  date DATE NOT NULL,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  conversions INT DEFAULT 0,
  cost DECIMAL(10, 2) DEFAULT 0,
  FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE,
  UNIQUE KEY unique_ad_date (ad_id, date)
);

-- Insert demo user
INSERT INTO users (username, email, password) 
VALUES ('demo', 'demo@adreport.com', '$2b$10$.8DYPZxgvPDwu8tqjz4FAudqsvECMymzQ2awDc/ooq3TEa4ft9Clu')
ON DUPLICATE KEY UPDATE username=username;

-- Insert sample ads data
INSERT INTO ads (user_id, campaign_name, platform, ad_type, budget, target_audience, start_date, status, impressions, clicks, conversions, cost)
SELECT 1, 'Summer Sale 2026', 'Facebook', 'Image', 5000.00, 'Age 25-40, Interested in fashion', '2026-06-01', 'active', 125000, 3250, 180, 2150.00
WHERE NOT EXISTS (SELECT 1 FROM ads WHERE campaign_name = 'Summer Sale 2026');

INSERT INTO ads (user_id, campaign_name, platform, ad_type, budget, target_audience, start_date, status, impressions, clicks, conversions, cost)
SELECT 1, 'Tech Launch', 'Google', 'Video', 10000.00, 'Tech enthusiasts, Age 20-35', '2026-02-01', 'active', 250000, 8500, 420, 4800.00
WHERE NOT EXISTS (SELECT 1 FROM ads WHERE campaign_name = 'Tech Launch');

INSERT INTO ads (user_id, campaign_name, platform, ad_type, budget, target_audience, start_date, status, impressions, clicks, conversions, cost)
SELECT 1, 'Holiday Special', 'Instagram', 'Carousel', 3000.00, 'Parents, Age 30-50', '2025-12-01', 'completed', 98000, 2100, 95, 1850.00
WHERE NOT EXISTS (SELECT 1 FROM ads WHERE campaign_name = 'Holiday Special');

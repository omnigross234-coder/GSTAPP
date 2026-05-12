-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: gst_app
-- ------------------------------------------------------
-- Server version	8.4.3

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ad_spends`
--

DROP TABLE IF EXISTS `ad_spends`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ad_spends` (
  `id` int NOT NULL AUTO_INCREMENT,
  `campaign_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `client_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `platform` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `daily_budget` decimal(10,2) DEFAULT NULL,
  `total_spend` decimal(10,2) DEFAULT NULL,
  `campaign_start` date DEFAULT NULL,
  `campaign_end` date DEFAULT NULL,
  `roi_notes` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ad_spends`
--

LOCK TABLES `ad_spends` WRITE;
/*!40000 ALTER TABLE `ad_spends` DISABLE KEYS */;
/*!40000 ALTER TABLE `ad_spends` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `backups`
--

DROP TABLE IF EXISTS `backups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `backups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `type` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `backups_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `backups`
--

LOCK TABLES `backups` WRITE;
/*!40000 ALTER TABLE `backups` DISABLE KEYS */;
/*!40000 ALTER TABLE `backups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `business_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `gst_number` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_general_ci,
  `state` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `customers_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,'user1',NULL,NULL,NULL,NULL,NULL,'Maharashtra',NULL,'2026-05-04 10:56:09'),(3,'prasad',NULL,NULL,NULL,NULL,NULL,'Maharashtra',NULL,'2026-05-04 10:56:09'),(5,'mulchand mill',NULL,NULL,NULL,NULL,NULL,'Maharashtra',NULL,'2026-05-04 10:56:09'),(7,'balaji ',NULL,NULL,NULL,NULL,NULL,'Maharashtra',NULL,'2026-05-04 10:56:09'),(20,'Sugandha','BD','Sugandha@gmail.com','1122334555',NULL,NULL,'Maharashtra',NULL,'2026-05-07 11:46:33'),(21,'Gaurav',NULL,'omnigross128@gmail.com',NULL,NULL,NULL,'Maharashtra',NULL,'2026-05-07 13:11:42'),(22,'Gauri',NULL,NULL,NULL,NULL,NULL,'Maharashtra',NULL,'2026-05-08 05:46:48'),(23,'Vidya','Vidya Fashions','omnigross235@gmail.com',NULL,NULL,'Aundhgaon , Pune','Maharashtra',NULL,'2026-05-08 06:18:19');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_logs`
--

DROP TABLE IF EXISTS `email_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoice_id` int NOT NULL,
  `sent_to` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `email_type` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `sent_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `invoice_id` (`invoice_id`),
  CONSTRAINT `email_logs_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_logs`
--

LOCK TABLES `email_logs` WRITE;
/*!40000 ALTER TABLE `email_logs` DISABLE KEYS */;
INSERT INTO `email_logs` VALUES (1,31,'omnigross123@gmail.com','invoice','sent','2026-05-07 13:04:44'),(2,30,'omnigross123@gmail.com','reminder','sent','2026-05-07 13:08:17'),(3,33,'omnigross128@gmail.com','invoice','sent','2026-05-07 13:13:22'),(4,33,'omnigross128@gmail.com','reminder','sent','2026-05-07 13:32:02'),(5,35,'omnigross129@gmail.com','invoice','sent','2026-05-08 05:47:49'),(6,35,'omnigross129@gmail.com','invoice','sent','2026-05-08 05:49:14'),(7,21,'omnigross129@gmail.com','reminder','sent','2026-05-08 06:02:28'),(11,34,'prasadkotewar001@gmail.com','invoice','sent','2026-05-08 06:35:53'),(12,34,'prasadkotewar001@gmail.com','invoice','sent','2026-05-08 06:38:56'),(13,34,'prasadkotewar001@gmail.com','invoice','sent','2026-05-08 06:39:21'),(14,34,'prasadkotewar001@gmail.com','reminder','sent','2026-05-08 06:39:33'),(15,34,'prasadkotewar001@gmail.com','invoice','sent','2026-05-08 06:43:37'),(16,34,'prasadkotewar001@gmail.com','reminder','sent','2026-05-08 06:43:49'),(17,34,'prasadkotewar001@gmail.com','reminder','sent','2026-05-08 06:45:35'),(18,34,'prasadkotewar001@gmail.com','reminder','sent','2026-05-08 06:46:49'),(19,34,'prasadkotewar001@gmail.com','invoice','sent','2026-05-08 06:59:57'),(20,6,'prasadkotewar001@gmail.com','invoice','failed','2026-05-08 10:26:11'),(21,6,'prasadkotewar001@gmail.com','invoice','sent','2026-05-08 10:33:01'),(22,19,'prasadkotewar001@gmail.com','invoice','sent','2026-05-08 10:52:29'),(23,6,'prasadkotewar001@gmail.com','invoice','sent','2026-05-08 11:14:05'),(24,18,'omnigross128@gmail.com','invoice','sent','2026-05-08 11:18:36'),(25,14,'omnigross128@gmail.com','reminder','sent','2026-05-08 11:18:49'),(26,6,'prasadkotewar001@gmail.com','invoice','sent','2026-05-08 11:30:39'),(27,22,'prasadkotewar001@gmail.com','invoice','sent','2026-05-08 11:47:04'),(28,14,'prasadkotewar001@gmail.com','reminder','sent','2026-05-08 11:48:36'),(29,14,'prasadkotewar001@gmail.com','reminder','sent','2026-05-08 11:49:08'),(30,6,'prasadkotewar001@gmail.com','invoice','sent','2026-05-08 12:05:27'),(31,21,'prasadkotewar001@gmail.com','reminder','sent','2026-05-08 12:06:30'),(32,6,'prasadkotewar001@gmail.com','invoice','sent','2026-05-08 12:20:22'),(33,6,'prasadkotewar001@gmail.com','invoice','sent','2026-05-08 12:22:52'),(34,33,'omnigross128@gmail.com','invoice','sent','2026-05-08 12:24:49'),(35,34,'omnigross234@gmail.com','invoice','failed','2026-05-08 12:49:03'),(36,34,'omnigross234@gmail.com','invoice','sent','2026-05-08 12:50:40'),(37,34,'omnigross234@gmail.com','invoice','sent','2026-05-08 12:54:10'),(38,34,'omnigross234@gmail.com','invoice','sent','2026-05-08 12:55:47'),(39,6,'omnigross234@gmail.com','invoice','sent','2026-05-08 12:57:33'),(40,6,'omnigross234@gmail.com','invoice','sent','2026-05-08 12:59:01'),(41,22,'omnigross234@gmail.com','invoice','sent','2026-05-08 12:59:42'),(42,6,'omnigross234@gmail.com','invoice','sent','2026-05-08 13:01:53'),(43,6,'omnigross234@gmail.com','invoice','sent','2026-05-08 13:14:54'),(44,13,'omnigross234@gmail.com','invoice','sent','2026-05-08 13:16:40'),(45,14,'omnigross234@gmail.com','invoice','sent','2026-05-08 13:30:28'),(46,14,'omnigross234@gmail.com','invoice','sent','2026-05-08 13:31:34');
/*!40000 ALTER TABLE `email_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expense_categories`
--

DROP TABLE IF EXISTS `expense_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expense_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expense_categories`
--

LOCK TABLES `expense_categories` WRITE;
/*!40000 ALTER TABLE `expense_categories` DISABLE KEYS */;
INSERT INTO `expense_categories` VALUES (1,'Facebook Ads',NULL,1,'2026-05-06 05:31:26'),(2,'Google Ads',NULL,1,'2026-05-06 05:31:26'),(4,'Employee Salary',NULL,1,'2026-05-06 05:31:26'),(5,'Freelancer Payment',NULL,1,'2026-05-06 05:31:26'),(6,'Office Rent',NULL,1,'2026-05-06 05:31:26'),(7,'Internet Bill',NULL,1,'2026-05-06 05:31:26'),(8,'Hosting & Domain',NULL,1,'2026-05-06 05:31:26'),(9,'Software Subscription',NULL,1,'2026-05-06 05:31:26'),(10,'Video Production',NULL,1,'2026-05-06 05:31:26'),(11,'Travel Expense',NULL,1,'2026-05-06 05:31:26'),(12,'Printing & Stationary',NULL,1,'2026-05-06 05:31:26'),(13,'Miscellaneous',NULL,1,'2026-05-06 05:31:26'),(19,'Tea Pay`s','Office',1,'2026-05-07 08:08:37');
/*!40000 ALTER TABLE `expense_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expense_payments`
--

DROP TABLE IF EXISTS `expense_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expense_payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `expense_id` int NOT NULL,
  `amount_paid` decimal(10,2) NOT NULL,
  `payment_mode` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `notes` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `expense_id` (`expense_id`),
  CONSTRAINT `expense_payments_ibfk_1` FOREIGN KEY (`expense_id`) REFERENCES `expenses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expense_payments`
--

LOCK TABLES `expense_payments` WRITE;
/*!40000 ALTER TABLE `expense_payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `expense_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expenses`
--

DROP TABLE IF EXISTS `expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expenses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `expense_number` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `expense_date` date NOT NULL,
  `vendor_id` int DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `client_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `project_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `gst_percent` decimal(5,2) DEFAULT '0.00',
  `gst_amount` decimal(10,2) DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL,
  `gst_type` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `payment_mode` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `payment_status` varchar(20) COLLATE utf8mb4_general_ci DEFAULT 'unpaid',
  `due_date` date DEFAULT NULL,
  `notes` text COLLATE utf8mb4_general_ci,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `expense_number` (`expense_number`),
  KEY `vendor_id` (`vendor_id`),
  KEY `category_id` (`category_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `expenses_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `expense_categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expenses`
--

LOCK TABLES `expenses` WRITE;
/*!40000 ALTER TABLE `expenses` DISABLE KEYS */;
INSERT INTO `expenses` VALUES (1,'EXP-2026-0001','2026-04-30',NULL,1,NULL,NULL,27999.00,0.00,0.00,27999.00,'none','bank_transfer','paid','2026-05-05',NULL,1,'2026-05-06 06:27:58'),(2,'EXP-2026-0002','2026-05-01',NULL,4,NULL,NULL,10000.00,0.00,0.00,10000.00,'none','upi','paid','2026-05-05','all emp salary',1,'2026-05-06 06:31:55'),(3,'EXP-2026-0003','2026-05-05',NULL,4,'employe','motivate employes',40000.00,0.00,0.00,40000.00,'none','bank_transfer','paid','2026-05-05',NULL,1,'2026-05-06 07:00:23'),(4,'EXP-2026-0004','2026-01-10',NULL,1,NULL,NULL,5000.00,18.00,900.00,5900.00,'cgst_sgst','upi','paid','2026-01-10','Test January expense',1,'2026-05-06 07:59:11'),(5,'EXP-2026-0005','2026-02-15',NULL,4,NULL,NULL,12000.00,18.00,2160.00,14160.00,'cgst_sgst','bank_transfer','paid','2026-02-15','Test February expense',1,'2026-05-06 07:59:11'),(6,'EXP-2026-0006','2026-03-20',NULL,1,NULL,NULL,8000.00,0.00,0.00,8000.00,'none','cash','paid','2026-03-20','Test March expense',1,'2026-05-06 07:59:11'),(7,'EXP-2026-0007','2026-04-11',NULL,4,NULL,NULL,22000.00,18.00,3960.00,25960.00,'cgst_sgst','upi','pending','2026-04-19','Test April expense',1,'2026-05-06 07:59:11'),(8,'EXP-2026-0008','2026-05-13',NULL,1,NULL,NULL,15000.00,0.00,0.00,15000.00,'none','bank_transfer','paid','2026-05-13','Test May expense',1,'2026-05-06 07:59:11'),(9,'EXP-2026-0009','2026-05-04',2,2,'Om Sai Agency','Marketing Campaign',5000.00,12.00,600.00,5600.00,'cgst_sgst','credit_card','paid','2026-05-05',NULL,1,'2026-05-06 11:24:37'),(10,'EXP-2026-0010','2026-05-07',3,6,'We',NULL,20000.00,0.00,0.00,20000.00,'none','upi','paid','2026-05-07','Rent Done',1,'2026-05-07 07:26:13'),(11,'EXP-2026-0011','2026-05-03',4,19,NULL,NULL,2000.00,0.00,0.00,2000.00,'none','upi','paid','2026-05-06',NULL,1,'2026-05-07 07:51:55'),(12,'EXP-2026-0012','2026-05-04',5,19,NULL,NULL,2000.00,0.00,0.00,2000.00,'none','bank_transfer','partial',NULL,'1000 need to pay ',1,'2026-05-07 08:06:27');
/*!40000 ALTER TABLE `expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice_items`
--

DROP TABLE IF EXISTS `invoice_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoice_id` int DEFAULT NULL,
  `service_id` int DEFAULT NULL,
  `description` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `sac_code` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `unit_price` decimal(10,2) DEFAULT NULL,
  `line_total` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `invoice_id` (`invoice_id`),
  KEY `service_id` (`service_id`),
  CONSTRAINT `invoice_items_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE,
  CONSTRAINT `invoice_items_ibfk_3` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=80 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice_items`
--

LOCK TABLES `invoice_items` WRITE;
/*!40000 ALTER TABLE `invoice_items` DISABLE KEYS */;
INSERT INTO `invoice_items` VALUES (14,13,NULL,'Graphic Design','998386',1,7500.00,7500.00),(15,13,NULL,'Local SEO','998361',1,8000.00,8000.00),(16,14,NULL,'Landing Page Design','998314',1,18000.00,18000.00),(17,14,NULL,'Local SEO','998361',1,8000.00,8000.00),(18,14,NULL,'Website Design','998314',2,25000.00,50000.00),(19,14,NULL,'Social Media Marketing','998367',5,12000.00,60000.00),(32,18,NULL,'Google Ads Management','998361',1,10000.00,10000.00),(33,18,NULL,'SEO Services','998361',1,15000.00,15000.00),(40,21,NULL,'Content Marketing','998363',1,8000.00,8000.00),(41,21,NULL,'Landing Page Design','998314',1,15000.00,15000.00),(42,6,NULL,'SEO Services','998361',1,15000.00,15000.00),(43,6,NULL,'Graphic Design','998386',1,7500.00,7500.00),(44,6,NULL,'Social Media Marketing','998367',1,12000.00,12000.00),(45,6,NULL,'Email Marketing','998367',1,6000.00,6000.00),(46,22,NULL,'Local SEO','998361',1,8000.00,8000.00),(47,22,NULL,'Social Media Marketing','998367',1,12000.00,12000.00),(57,30,NULL,'SEO Services','998361',1,15000.00,15000.00),(58,31,NULL,'Landing Page Design','998314',1,15000.00,15000.00),(60,33,NULL,'Local SEO','998361',1,8000.00,8000.00),(61,33,NULL,'Landing Page Design','998314',1,15000.00,15000.00),(62,33,NULL,'Google Ads Management','998361',1,10000.00,10000.00),(63,33,NULL,'Landing Page Design','998314',1,15000.00,15000.00),(64,33,NULL,'Content Marketing','998363',1,8000.00,8000.00),(65,33,NULL,'Website Development','998314',1,50000.00,50000.00),(66,34,NULL,'lead generation','121223',1,15000.00,15000.00),(67,35,NULL,'Website Development','998314',1,50000.00,50000.00),(68,35,NULL,'Local SEO','998361',1,8000.00,8000.00),(69,35,NULL,'Content Marketing','998363',1,8000.00,8000.00),(70,35,NULL,'Website Design','998314',1,25000.00,25000.00),(75,19,NULL,'Local SEO','998361',1,8000.00,8000.00),(76,19,NULL,'Meta Ads Management','998361',1,10000.00,10000.00),(77,19,NULL,'SEO Services','998361',1,15000.00,15000.00),(78,19,NULL,'Website Design','998314',1,25000.00,25000.00),(79,19,NULL,'Content Marketing','998363',1,8000.00,8000.00);
/*!40000 ALTER TABLE `invoice_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoice_number` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `customer_id` int DEFAULT NULL,
  `customer_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `state` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL,
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `cgst_amount` decimal(10,2) DEFAULT NULL,
  `sgst_amount` decimal(10,2) DEFAULT NULL,
  `igst_amount` decimal(10,2) DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `tax_type` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `due_date` date DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_general_ci DEFAULT 'draft',
  `notes` text COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoice_number` (`invoice_number`),
  KEY `customer_id` (`customer_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  CONSTRAINT `invoices_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
INSERT INTO `invoices` VALUES (6,'INV-2026-0006',NULL,'prasad','Maharashtra',40500.00,0.00,3645.00,3645.00,0.00,47790.00,'cgst_sgst',2,'2026-04-29 09:25:01','2026-04-28','overdue','best customer'),(13,'INV-2026-0007',NULL,'prasad','maharashtra',15500.00,0.00,1395.00,1395.00,0.00,18290.00,'cgst_sgst',2,'2026-05-02 05:01:50','2026-05-02','paid','na'),(14,'INV-2026-0008',NULL,'sugandha','Maharashtra',136000.00,0.00,12240.00,12240.00,0.00,160480.00,'cgst_sgst',2,'2026-05-02 05:03:11','2026-05-02','paid',''),(18,'INV-2026-0011',NULL,'tata motars','Maharashtra',25000.00,0.00,2250.00,2250.00,0.00,29500.00,'cgst_sgst',3,'2026-05-02 10:12:56','2026-05-07','overdue','good dealer'),(19,'INV-2026-0012',NULL,'balaji ','Maharashtra',66000.00,0.00,5940.00,5940.00,0.00,77880.00,'cgst_sgst',6,'2026-05-04 06:43:37','2026-05-03','paid',''),(21,'INV-2026-0014',NULL,'mulchand mill','Maharashtra',23000.00,0.00,2070.00,2070.00,0.00,27140.00,'cgst_sgst',2,'2026-05-04 11:15:19','2026-05-04','sent',''),(22,'INV-2026-0015',NULL,'shivaji','Maharashtra',20000.00,0.00,1800.00,1800.00,0.00,23600.00,'cgst_sgst',2,'2026-05-04 11:20:42','2026-05-04','paid',''),(30,'INV-2026-0019',NULL,'prasad','Maharashtra',15000.00,0.00,1350.00,1350.00,0.00,17700.00,'cgst_sgst',2,'2026-05-07 11:51:56','2026-05-07','draft',''),(31,'INV-2026-0020',NULL,'Sugandha','Maharashtra',15000.00,0.00,1350.00,1350.00,0.00,17700.00,'cgst_sgst',2,'2026-05-07 11:58:45','2026-05-07','draft',''),(33,'INV-2026-0022',NULL,'Gaurav','Maharashtra',106000.00,0.00,9540.00,9540.00,0.00,125080.00,'cgst_sgst',2,'2026-05-07 13:13:01','2026-05-07','draft',''),(34,'INV-2026-0023',NULL,'prasad','Maharashtra',15000.00,0.00,1350.00,1350.00,0.00,17700.00,'cgst_sgst',2,'2026-05-07 13:30:25','2026-05-08','draft',''),(35,'INV-2026-0024',NULL,'Gauri','Maharashtra',91000.00,0.00,8190.00,8190.00,0.00,107380.00,'cgst_sgst',2,'2026-05-08 05:46:48','2026-05-08','draft','');
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `services` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `sac_code` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `default_price` decimal(10,2) NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
INSERT INTO `services` VALUES (1,'Website Design','998314',25000.00,'Custom UI/UX design for websites',1,'2026-04-29 07:04:48'),(2,'Website Development','998314',50000.00,'Full-stack web development',1,'2026-04-29 07:04:48'),(3,'SEO Services','998361',15000.00,'Search engine optimisation (monthly)',1,'2026-04-29 07:04:48'),(4,'Google Ads Management','998361',10000.00,'PPC campaign management',1,'2026-04-29 07:04:48'),(5,'Meta Ads Management','998361',10000.00,'Facebook & Instagram ad management',1,'2026-04-29 07:04:48'),(6,'Social Media Marketing','998367',12000.00,'Organic social media management',1,'2026-04-29 07:04:48'),(7,'Content Marketing','998363',8000.00,'Blog, article, and content creation',1,'2026-04-29 07:04:48'),(8,'Graphic Design','998386',7500.00,'Creative design assets',1,'2026-04-29 07:04:48'),(9,'Landing Page Design','998314',15000.00,'Conversion-focused landing pages',1,'2026-04-29 07:04:48'),(10,'Email Marketing','998367',6000.00,'Email campaigns and automation',1,'2026-04-29 07:04:48'),(11,'Local SEO','998361',8000.00,'Google Business Profile optimisation',1,'2026-04-29 07:04:48'),(12,'Content Creation','998318',15000.00,'We will create the content for your bussiness',1,'2026-05-07 10:07:12'),(14,'xyz','321321',1111.00,NULL,1,'2026-05-07 11:15:24'),(15,'lead generation','121223',15000.00,'Office',1,'2026-05-07 11:28:13');
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `role` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin',NULL,'1234','admin',1,'2026-04-29 07:03:46'),(2,'user1',NULL,'1234','user',1,'2026-04-29 07:03:46'),(3,'prasad','prs@gmail.com','12345','user',1,'2026-05-02 07:14:14'),(4,'admin2','admin@gmail.com','pass1234','admin',1,'2026-05-02 07:16:04'),(5,'Bharati','Bharati@gmail.com','1234','admin',1,'2026-05-02 10:25:42'),(6,'vidya','vidya@gmal.com','1234','user',1,'2026-05-04 06:41:01');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendors`
--

DROP TABLE IF EXISTS `vendors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `gst_number` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `contact_person` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `mobile` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_general_ci,
  `payment_terms` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendors`
--

LOCK TABLES `vendors` WRITE;
/*!40000 ALTER TABLE `vendors` DISABLE KEYS */;
INSERT INTO `vendors` VALUES (1,'Facebook',NULL,NULL,NULL,NULL,NULL,'immediate','2026-05-06 11:19:43'),(2,'Google Ads',NULL,NULL,NULL,NULL,NULL,'immediate','2026-05-06 11:26:20'),(3,'Sagar Complex',NULL,NULL,NULL,NULL,'Nashik Phata, Pune','immediate','2026-05-07 07:24:31'),(4,'Chai Wall 1',NULL,NULL,NULL,NULL,'Sagar Complex , Nashik Phata, Pune','net_30','2026-05-07 07:49:27'),(5,'Chai Wall 2',NULL,NULL,NULL,NULL,'Sagar Complex , Nashik Phata, Pune','net_30','2026-05-07 07:50:14');
/*!40000 ALTER TABLE `vendors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'gst_app'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-09 17:45:04

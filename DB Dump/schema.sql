-- MySQL dump 10.13  Distrib 9.0.1, for macos14.7 (x86_64)
--
-- Host: localhost    Database: visual_app_design
-- ------------------------------------------------------
-- Server version       8.0.40

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
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('2fc2986f-5def-4310-b117-16a97a5386d0','ffc90a05e70aa41ba54bba03768ab29fbe772b35e0a979506cf7d3c1df429847','2025-07-09 10:56:07.796','20250709105607_init',NULL,NULL,'2025-07-09 10:56:07.690',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Application`
--

DROP TABLE IF EXISTS `Application`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Application` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Application_userId_fkey` (`userId`),
  CONSTRAINT `Application_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Application`
--

LOCK TABLES `Application` WRITE;
/*!40000 ALTER TABLE `Application` DISABLE KEYS */;
INSERT INTO `Application` VALUES (1,'4342f7de-fab5-401c-b534-2ef16d06b0fd','tempo','Description of the app','2025-07-09 10:58:49.822'),(2,'4342f7de-fab5-401c-b534-2ef16d06b0fd','a','Description of the app','2025-07-16 11:02:52.532');
/*!40000 ALTER TABLE `Application` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CustomComponent`
--

DROP TABLE IF EXISTS `CustomComponent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CustomComponent` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `componentName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `componentContent` json NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `CustomComponent_componentName_key` (`componentName`),
  KEY `CustomComponent_userId_fkey` (`userId`),
  CONSTRAINT `CustomComponent_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CustomComponent`
--

LOCK TABLES `CustomComponent` WRITE;
/*!40000 ALTER TABLE `CustomComponent` DISABLE KEYS */;
/*!40000 ALTER TABLE `CustomComponent` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Enum`
--

DROP TABLE IF EXISTS `Enum`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Enum` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `applicationName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `enumName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `enums` json NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Enum_userId_fkey` (`userId`),
  CONSTRAINT `Enum_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Enum`
--

LOCK TABLES `Enum` WRITE;
/*!40000 ALTER TABLE `Enum` DISABLE KEYS */;
INSERT INTO `Enum` VALUES (1,'4342f7de-fab5-401c-b534-2ef16d06b0fd','a','Meal_type','{\"enum_name\": \"Meal_type\", \"fieldValues\": [{\"name\": \"Breakfast\"}, {\"name\": \"Lunch\"}, {\"name\": \"Snacks\"}, {\"name\": \"Dinner\"}]}','2025-07-16 10:45:48.053'),(2,'4342f7de-fab5-401c-b534-2ef16d06b0fd','a','Dish_type','{\"enum_name\": \"Dish_type\", \"fieldValues\": [{\"name\": \"Veg\"}, {\"name\": \"Egg\"}, {\"name\": \"Chicken\"}]}','2025-07-16 10:49:43.652'),(4,'4342f7de-fab5-401c-b534-2ef16d06b0fd','a','User_type','{\"enum_name\": \"User_type\", \"fieldValues\": [{\"name\": \"Admin\"}, {\"name\": \"User\"}]}','2025-07-16 14:57:48.040');
/*!40000 ALTER TABLE `Enum` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Page`
--

DROP TABLE IF EXISTS `Page`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Page` (
  `id` int NOT NULL AUTO_INCREMENT,
  `applicationId` int NOT NULL,
  `pageName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pageContent` json NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Page_applicationId_fkey` (`applicationId`),
  CONSTRAINT `Page_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `Application` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Page`
--

LOCK TABLES `Page` WRITE;
/*!40000 ALTER TABLE `Page` DISABLE KEYS */;
INSERT INTO `Page` VALUES (1,1,'Page1','{\"apis\": {}, \"cssData\": {\"id-1\": {}}, \"htmlContent\": {\"root\": [\"{\\\"styles\\\":\\\"{}\\\",\\\"classes\\\":\\\"d-flex flex-column border border-2 h-50\\\",\\\"type\\\":\\\"resource\\\",\\\"path\\\":\\\"root\\\",\\\"uniqueId\\\":\\\"id-1\\\",\\\"componentName\\\":\\\"resource\\\",\\\"resourceName\\\":\\\"User\\\",\\\"selectedOp\\\":\\\"Create\\\"}\"]}, \"loginPageId\": 1, \"resourceMap\": {\"id-1\": \"User\"}, \"componentMap\": {\"id-1\": \"resource\"}, \"operationMap\": {\"id-1\": \"Create\"}}','2025-07-09 10:58:49.832'),(2,1,'Page2','{\"apis\": {}, \"cssData\": {\"id-3\": {}}, \"htmlContent\": {\"root\": [\"{\\\"styles\\\":\\\"{}\\\",\\\"classes\\\":\\\"d-flex flex-column border border-2 h-50\\\",\\\"type\\\":\\\"resource\\\",\\\"path\\\":\\\"root\\\",\\\"uniqueId\\\":\\\"id-3\\\",\\\"componentName\\\":\\\"resource\\\",\\\"resourceName\\\":\\\"User\\\",\\\"selectedOp\\\":\\\"Read\\\"}\"]}, \"loginPageId\": 1, \"resourceMap\": {\"id-3\": \"User\"}, \"componentMap\": {\"id-3\": \"resource\"}, \"operationMap\": {\"id-3\": \"Read\"}}','2025-07-09 10:58:49.837'),(3,1,'Page3','{\"apis\": {}, \"cssData\": {\"id-5\": {}}, \"htmlContent\": {\"root\": [\"{\\\"styles\\\":\\\"{}\\\",\\\"classes\\\":\\\"d-flex flex-column border border-2 h-50\\\",\\\"type\\\":\\\"resource\\\",\\\"path\\\":\\\"root\\\",\\\"uniqueId\\\":\\\"id-5\\\",\\\"componentName\\\":\\\"resource\\\",\\\"resourceName\\\":\\\"User\\\",\\\"selectedOp\\\":\\\"Update\\\"}\"]}, \"loginPageId\": 1, \"resourceMap\": {\"id-5\": \"User\"}, \"componentMap\": {\"id-5\": \"resource\"}, \"operationMap\": {\"id-5\": \"Update\"}}','2025-07-09 10:58:49.839'),(4,2,'Page1','{\"apis\": {}, \"cssData\": {\"id-P\": {}, \"id-R\": {}, \"id-T\": {}}, \"htmlContent\": {\"root\": [\"{\\\"styles\\\":\\\"{}\\\",\\\"classes\\\":\\\"d-flex flex-column border border-2 h-50\\\",\\\"type\\\":\\\"resource\\\",\\\"path\\\":\\\"root\\\",\\\"uniqueId\\\":\\\"id-P\\\",\\\"componentName\\\":\\\"resource\\\",\\\"resourceName\\\":\\\"Meal\\\",\\\"selectedOp\\\":\\\"Create\\\"}\", \"{\\\"styles\\\":\\\"{}\\\",\\\"classes\\\":\\\"d-flex flex-column border border-2 h-50\\\",\\\"type\\\":\\\"resource\\\",\\\"path\\\":\\\"root\\\",\\\"uniqueId\\\":\\\"id-R\\\",\\\"componentName\\\":\\\"resource\\\",\\\"resourceName\\\":\\\"Meal\\\",\\\"selectedOp\\\":\\\"Read\\\"}\", \"{\\\"styles\\\":\\\"{}\\\",\\\"classes\\\":\\\"d-flex flex-column border border-2 h-50\\\",\\\"type\\\":\\\"resource\\\",\\\"path\\\":\\\"root\\\",\\\"uniqueId\\\":\\\"id-T\\\",\\\"componentName\\\":\\\"resource\\\",\\\"resourceName\\\":\\\"Meal\\\",\\\"selectedOp\\\":\\\"Update\\\"}\"]}, \"loginPageId\": 1, \"resourceMap\": {\"id-P\": \"Meal\", \"id-R\": \"Meal\", \"id-T\": \"Meal\"}, \"componentMap\": {\"id-P\": \"resource\", \"id-R\": \"resource\", \"id-T\": \"resource\"}, \"operationMap\": {\"id-P\": \"Create\", \"id-R\": \"Read\", \"id-T\": \"Update\"}}','2025-07-16 11:02:52.549'),(5,2,'Page2','{\"apis\": {}, \"cssData\": {\"id-V\": {}, \"id-X\": {}, \"id-Z\": {}}, \"htmlContent\": {\"root\": [\"{\\\"styles\\\":\\\"{}\\\",\\\"classes\\\":\\\"d-flex flex-column border border-2 h-50\\\",\\\"type\\\":\\\"resource\\\",\\\"path\\\":\\\"root\\\",\\\"uniqueId\\\":\\\"id-V\\\",\\\"componentName\\\":\\\"resource\\\",\\\"resourceName\\\":\\\"Menu_item\\\",\\\"selectedOp\\\":\\\"Create\\\"}\", \"{\\\"styles\\\":\\\"{}\\\",\\\"classes\\\":\\\"d-flex flex-column border border-2 h-50\\\",\\\"type\\\":\\\"resource\\\",\\\"path\\\":\\\"root\\\",\\\"uniqueId\\\":\\\"id-X\\\",\\\"componentName\\\":\\\"resource\\\",\\\"resourceName\\\":\\\"Menu_item\\\",\\\"selectedOp\\\":\\\"Read\\\"}\", \"{\\\"styles\\\":\\\"{}\\\",\\\"classes\\\":\\\"d-flex flex-column border border-2 h-50\\\",\\\"type\\\":\\\"resource\\\",\\\"path\\\":\\\"root\\\",\\\"uniqueId\\\":\\\"id-Z\\\",\\\"componentName\\\":\\\"resource\\\",\\\"resourceName\\\":\\\"Menu_item\\\",\\\"selectedOp\\\":\\\"Update\\\"}\"]}, \"loginPageId\": 1, \"resourceMap\": {\"id-V\": \"Menu_item\", \"id-X\": \"Menu_item\", \"id-Z\": \"Menu_item\"}, \"componentMap\": {\"id-V\": \"resource\", \"id-X\": \"resource\", \"id-Z\": \"resource\"}, \"operationMap\": {\"id-V\": \"Create\", \"id-X\": \"Read\", \"id-Z\": \"Update\"}}','2025-07-16 11:02:52.553'),(6,2,'Page3','{\"apis\": {}, \"cssData\": {\"id-11\": {}, \"id-13\": {}, \"id-15\": {}}, \"htmlContent\": {\"root\": [\"{\\\"styles\\\":\\\"{}\\\",\\\"classes\\\":\\\"d-flex flex-column border border-2 h-50\\\",\\\"type\\\":\\\"resource\\\",\\\"path\\\":\\\"root\\\",\\\"uniqueId\\\":\\\"id-11\\\",\\\"componentName\\\":\\\"resource\\\",\\\"resourceName\\\":\\\"User\\\",\\\"selectedOp\\\":\\\"Create\\\"}\", \"{\\\"styles\\\":\\\"{}\\\",\\\"classes\\\":\\\"d-flex flex-column border border-2 h-50\\\",\\\"type\\\":\\\"resource\\\",\\\"path\\\":\\\"root\\\",\\\"uniqueId\\\":\\\"id-13\\\",\\\"componentName\\\":\\\"resource\\\",\\\"resourceName\\\":\\\"User\\\",\\\"selectedOp\\\":\\\"Read\\\"}\", \"{\\\"styles\\\":\\\"{}\\\",\\\"classes\\\":\\\"d-flex flex-column border border-2 h-50\\\",\\\"type\\\":\\\"resource\\\",\\\"path\\\":\\\"root\\\",\\\"uniqueId\\\":\\\"id-15\\\",\\\"componentName\\\":\\\"resource\\\",\\\"resourceName\\\":\\\"User\\\",\\\"selectedOp\\\":\\\"Update\\\"}\"]}, \"loginPageId\": 1, \"resourceMap\": {\"id-11\": \"User\", \"id-13\": \"User\", \"id-15\": \"User\"}, \"componentMap\": {\"id-11\": \"resource\", \"id-13\": \"resource\", \"id-15\": \"resource\"}, \"operationMap\": {\"id-11\": \"Create\", \"id-13\": \"Read\", \"id-15\": \"Update\"}}','2025-07-16 13:59:05.386'),(7,2,'Page4','{\"apis\": {}, \"cssData\": {\"id-17\": {}, \"id-19\": {}, \"id-1B\": {}}, \"htmlContent\": {\"root\": [\"{\\\"styles\\\":\\\"{}\\\",\\\"classes\\\":\\\"d-flex flex-column border border-2 h-50\\\",\\\"type\\\":\\\"resource\\\",\\\"path\\\":\\\"root\\\",\\\"uniqueId\\\":\\\"id-17\\\",\\\"componentName\\\":\\\"resource\\\",\\\"resourceName\\\":\\\"Sick_meal\\\",\\\"selectedOp\\\":\\\"Create\\\"}\", \"{\\\"styles\\\":\\\"{}\\\",\\\"classes\\\":\\\"d-flex flex-column border border-2 h-50\\\",\\\"type\\\":\\\"resource\\\",\\\"path\\\":\\\"root\\\",\\\"uniqueId\\\":\\\"id-19\\\",\\\"componentName\\\":\\\"resource\\\",\\\"resourceName\\\":\\\"Sick_meal\\\",\\\"selectedOp\\\":\\\"Read\\\"}\", \"{\\\"styles\\\":\\\"{}\\\",\\\"classes\\\":\\\"d-flex flex-column border border-2 h-50\\\",\\\"type\\\":\\\"resource\\\",\\\"path\\\":\\\"root\\\",\\\"uniqueId\\\":\\\"id-1B\\\",\\\"componentName\\\":\\\"resource\\\",\\\"resourceName\\\":\\\"Sick_meal\\\",\\\"selectedOp\\\":\\\"Update\\\"}\"]}, \"loginPageId\": 1, \"resourceMap\": {\"id-17\": \"Sick_meal\", \"id-19\": \"Sick_meal\", \"id-1B\": \"Sick_meal\"}, \"componentMap\": {\"id-17\": \"resource\", \"id-19\": \"resource\", \"id-1B\": \"resource\"}, \"operationMap\": {\"id-17\": \"Create\", \"id-19\": \"Read\", \"id-1B\": \"Update\"}}','2025-07-16 13:59:24.347'),(8,2,'Page5','{\"apis\": {}, \"cssData\": {\"id-1D\": {}, \"id-1F\": {}, \"id-1H\": {}}, \"htmlContent\": {\"root\": [\"{\\\"styles\\\":\\\"{}\\\",\\\"classes\\\":\\\"d-flex flex-column border border-2 h-50\\\",\\\"type\\\":\\\"resource\\\",\\\"path\\\":\\\"root\\\",\\\"uniqueId\\\":\\\"id-1D\\\",\\\"componentName\\\":\\\"resource\\\",\\\"resourceName\\\":\\\"Review\\\",\\\"selectedOp\\\":\\\"Create\\\"}\", \"{\\\"styles\\\":\\\"{}\\\",\\\"classes\\\":\\\"d-flex flex-column border border-2 h-50\\\",\\\"type\\\":\\\"resource\\\",\\\"path\\\":\\\"root\\\",\\\"uniqueId\\\":\\\"id-1F\\\",\\\"componentName\\\":\\\"resource\\\",\\\"resourceName\\\":\\\"Review\\\",\\\"selectedOp\\\":\\\"Read\\\"}\", \"{\\\"styles\\\":\\\"{}\\\",\\\"classes\\\":\\\"d-flex flex-column border border-2 h-50\\\",\\\"type\\\":\\\"resource\\\",\\\"path\\\":\\\"root\\\",\\\"uniqueId\\\":\\\"id-1H\\\",\\\"componentName\\\":\\\"resource\\\",\\\"resourceName\\\":\\\"Review\\\",\\\"selectedOp\\\":\\\"Update\\\"}\"]}, \"loginPageId\": 1, \"resourceMap\": {\"id-1D\": \"Review\", \"id-1F\": \"Review\", \"id-1H\": \"Review\"}, \"componentMap\": {\"id-1D\": \"resource\", \"id-1F\": \"resource\", \"id-1H\": \"resource\"}, \"operationMap\": {\"id-1D\": \"Create\", \"id-1F\": \"Read\", \"id-1H\": \"Update\"}}','2025-07-16 13:59:45.128'),(9,2,'Page6','{\"apis\": {}, \"cssData\": {\"id-1J\": {}, \"id-1L\": {}, \"id-1N\": {}}, \"htmlContent\": {\"root\": [\"{\\\"styles\\\":\\\"{}\\\",\\\"classes\\\":\\\"d-flex flex-column border border-2 h-50\\\",\\\"type\\\":\\\"resource\\\",\\\"path\\\":\\\"root\\\",\\\"uniqueId\\\":\\\"id-1J\\\",\\\"componentName\\\":\\\"resource\\\",\\\"resourceName\\\":\\\"Feedback\\\",\\\"selectedOp\\\":\\\"Create\\\"}\", \"{\\\"styles\\\":\\\"{}\\\",\\\"classes\\\":\\\"d-flex flex-column border border-2 h-50\\\",\\\"type\\\":\\\"resource\\\",\\\"path\\\":\\\"root\\\",\\\"uniqueId\\\":\\\"id-1L\\\",\\\"componentName\\\":\\\"resource\\\",\\\"resourceName\\\":\\\"Feedback\\\",\\\"selectedOp\\\":\\\"Read\\\"}\", \"{\\\"styles\\\":\\\"{}\\\",\\\"classes\\\":\\\"d-flex flex-column border border-2 h-50\\\",\\\"type\\\":\\\"resource\\\",\\\"path\\\":\\\"root\\\",\\\"uniqueId\\\":\\\"id-1N\\\",\\\"componentName\\\":\\\"resource\\\",\\\"resourceName\\\":\\\"Feedback\\\",\\\"selectedOp\\\":\\\"Update\\\"}\"]}, \"loginPageId\": 1, \"resourceMap\": {\"id-1J\": \"Feedback\", \"id-1L\": \"Feedback\", \"id-1N\": \"Feedback\"}, \"componentMap\": {\"id-1J\": \"resource\", \"id-1L\": \"resource\", \"id-1N\": \"resource\"}, \"operationMap\": {\"id-1J\": \"Create\", \"id-1L\": \"Read\", \"id-1N\": \"Update\"}}','2025-07-16 14:00:03.617');
/*!40000 ALTER TABLE `Page` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Resource`
--

DROP TABLE IF EXISTS `Resource`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Resource` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `resourceName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resources` json NOT NULL,
  `applicationName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Resource_userId_fkey` (`userId`),
  CONSTRAINT `Resource_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Resource`
--

LOCK TABLES `Resource` WRITE;
/*!40000 ALTER TABLE `Resource` DISABLE KEYS */;
INSERT INTO `Resource` VALUES (2,'4342f7de-fab5-401c-b534-2ef16d06b0fd','2025-07-16 10:46:59.677','Meal','{\"resource\": \"Meal\", \"fieldValues\": [{\"name\": \"id\", \"type\": \"String\", \"is_enum\": false, \"required\": true, \"foreign_field\": \"\"}, {\"name\": \"meal_type\", \"type\": \"String\", \"is_enum\": true, \"required\": true, \"foreign_field\": \"\", \"possible_value\": \"Meal_type\"}, {\"name\": \"date\", \"type\": \"Date\", \"is_enum\": false, \"required\": true, \"foreign_field\": \"\"}, {\"name\": \"isfeast\", \"type\": \"String\", \"is_enum\": false, \"required\": true, \"foreign_field\": \"\"}]}','a'),(3,'4342f7de-fab5-401c-b534-2ef16d06b0fd','2025-07-16 10:47:47.290','Menu_item','{\"resource\": \"Menu_item\", \"fieldValues\": [{\"name\": \"id\", \"type\": \"String\", \"is_enum\": false, \"required\": true, \"foreign_field\": \"\"}, {\"name\": \"meal_id\", \"type\": \"String\", \"foreign\": \"Meal\", \"is_enum\": false, \"required\": true, \"foreign_field\": \"id\"}, {\"name\": \"dish_name\", \"type\": \"String\", \"is_enum\": false, \"required\": true, \"foreign_field\": \"\"}, {\"name\": \"dish_type\", \"type\": \"String\", \"is_enum\": true, \"required\": true, \"foreign_field\": \"\", \"possible_value\": \"Dish_type\"}]}','a'),(4,'4342f7de-fab5-401c-b534-2ef16d06b0fd','2025-07-16 13:51:48.155','User','{\"resource\": \"User\", \"fieldValues\": [{\"name\": \"id\", \"type\": \"String\", \"is_enum\": false, \"required\": true, \"foreign_field\": \"\"}, {\"name\": \"name\", \"type\": \"String\", \"is_enum\": false, \"required\": true, \"foreign_field\": \"\"}, {\"name\": \"email\", \"type\": \"String\", \"is_enum\": false, \"required\": true, \"foreign_field\": \"\"}, {\"name\": \"room_no\", \"type\": \"String\", \"is_enum\": false, \"required\": false, \"foreign_field\": \"\"}, {\"name\": \"user_type\", \"type\": \"String\", \"is_enum\": true, \"required\": true, \"foreign_field\": \"\", \"possible_value\": \"User_type\"}]}','a'),(5,'4342f7de-fab5-401c-b534-2ef16d06b0fd','2025-07-16 13:53:07.036','Sick_meal','{\"resource\": \"Sick_meal\", \"fieldValues\": [{\"name\": \"id\", \"type\": \"String\", \"is_enum\": false, \"required\": true, \"foreign_field\": \"\"}, {\"name\": \"user_id\", \"type\": \"String\", \"foreign\": \"User\", \"is_enum\": false, \"required\": true, \"foreign_field\": \"\"}, {\"name\": \"meal_id\", \"type\": \"String\", \"foreign\": \"Meal\", \"is_enum\": false, \"required\": true, \"foreign_field\": \"\"}, {\"name\": \"instruction\", \"type\": \"String\", \"is_enum\": false, \"required\": false, \"foreign_field\": \"\"}]}','a'),(6,'4342f7de-fab5-401c-b534-2ef16d06b0fd','2025-07-16 13:56:42.985','Review','{\"resource\": \"Review\", \"fieldValues\": [{\"name\": \"id\", \"type\": \"String\", \"is_enum\": false, \"required\": true, \"foreign_field\": \"\"}, {\"name\": \"user_id\", \"type\": \"String\", \"foreign\": \"User\", \"is_enum\": false, \"required\": true, \"foreign_field\": \"id\"}, {\"name\": \"menu_item_id\", \"type\": \"String\", \"foreign\": \"Menu_item\", \"is_enum\": false, \"required\": true, \"foreign_field\": \"id\"}, {\"name\": \"ratings\", \"type\": \"String\", \"is_enum\": false, \"required\": true, \"foreign_field\": \"\"}]}','a'),(7,'4342f7de-fab5-401c-b534-2ef16d06b0fd','2025-07-16 13:58:10.057','Feedback','{\"resource\": \"Feedback\", \"fieldValues\": [{\"name\": \"id\", \"type\": \"String\", \"is_enum\": false, \"required\": true, \"foreign_field\": \"\"}, {\"name\": \"user_id\", \"type\": \"String\", \"foreign\": \"User\", \"is_enum\": false, \"required\": true, \"foreign_field\": \"id\"}, {\"name\": \"description\", \"type\": \"String\", \"is_enum\": false, \"required\": true, \"foreign_field\": \"\"}, {\"name\": \"date\", \"type\": \"Date\", \"is_enum\": false, \"required\": true, \"foreign_field\": \"\"}, {\"name\": \"image\", \"type\": \"String\", \"is_enum\": false, \"required\": false, \"foreign_field\": \"\"}]}','a');
/*!40000 ALTER TABLE `Resource` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `User` (
  `username` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`userId`),
  UNIQUE KEY `User_username_key` (`username`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` VALUES ('naman04','pandyanaman2@gmail.com','2025-07-09 10:57:05.211','4342f7de-fab5-401c-b534-2ef16d06b0fd');
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-29 16:02:09
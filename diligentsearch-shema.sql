-- MySQL dump 10.13  Distrib 5.7.17, for Linux (x86_64)
--
-- Host: localhost    Database: diligent_search
-- ------------------------------------------------------
-- Server version	5.7.17-0ubuntu0.16.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Block`
--

DROP TABLE IF EXISTS `Block`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Block` (
  `id` int(4) NOT NULL AUTO_INCREMENT,
  `workId` int(3) NOT NULL,
  `json` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `blockWorkId` (`workId`),
  CONSTRAINT `blockWorkId` FOREIGN KEY (`workId`) REFERENCES `Work` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Country`
--

DROP TABLE IF EXISTS `Country`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Country` (
  `id` int(2) NOT NULL AUTO_INCREMENT,
  `code` varchar(3) NOT NULL,
  `name` varchar(30) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `DecisionTree`
--

DROP TABLE IF EXISTS `DecisionTree`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `DecisionTree` (
  `id` int(3) NOT NULL AUTO_INCREMENT,
  `workId` int(3) NOT NULL,
  `json` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `DecisionTreeWorkConstraint` (`workId`),
  CONSTRAINT `DecisionTreeWorkConstraint` FOREIGN KEY (`workId`) REFERENCES `Work` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Form`
--

DROP TABLE IF EXISTS `Form`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Form` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `workId` int(3) NOT NULL,
  `hook` text NOT NULL,
  `version` int(3) NOT NULL DEFAULT '0',
  `json` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `formWorkConstraint` (`workId`),
  CONSTRAINT `formWorkConstraint` FOREIGN KEY (`workId`) REFERENCES `Work` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`phpmyadmin`@`localhost`*/ /*!50003 TRIGGER `FormVersioning` BEFORE INSERT ON `Form` FOR EACH ROW BEGIN
	DECLARE c INT;
    SET c = (SELECT COUNT(*) FROM Form WHERE hook = NEW.hook);
    IF c=0 THEN
        SET NEW.version = 1;
    ELSE
    	SET NEW.version = (SELECT (MAX(version)+1) FROM Form WHERE hook = NEW.hook);
	END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `Question`
--

DROP TABLE IF EXISTS `Question`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Question` (
  `id` int(4) NOT NULL AUTO_INCREMENT,
  `workId` int(3) NOT NULL,
  `json` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `QuestionWorkId` (`workId`),
  CONSTRAINT `QuestionWorkId` FOREIGN KEY (`workId`) REFERENCES `Work` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Result`
--

DROP TABLE IF EXISTS `Result`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Result` (
  `id` int(4) NOT NULL AUTO_INCREMENT,
  `workId` int(3) NOT NULL,
  `json` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ResultWorkId` (`workId`),
  CONSTRAINT `ResultWorkId` FOREIGN KEY (`workId`) REFERENCES `Work` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `SharedRefValue`
--

DROP TABLE IF EXISTS `SharedRefValue`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `SharedRefValue` (
  `id` int(3) NOT NULL AUTO_INCREMENT,
  `countryId` int(2) NOT NULL,
  `json` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `RefValuesCountry` (`countryId`),
  CONSTRAINT `RefValuesCountry` FOREIGN KEY (`countryId`) REFERENCES `Country` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `SharedUserInput`
--

DROP TABLE IF EXISTS `SharedUserInput`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `SharedUserInput` (
  `id` int(3) NOT NULL AUTO_INCREMENT,
  `countryId` int(2) NOT NULL,
  `json` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `UserInputsCountry` (`countryId`),
  CONSTRAINT `UserInputsCountry` FOREIGN KEY (`countryId`) REFERENCES `Country` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Work`
--

DROP TABLE IF EXISTS `Work`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Work` (
  `id` int(3) NOT NULL AUTO_INCREMENT,
  `countryId` int(2) NOT NULL,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `countryId` (`countryId`) USING BTREE,
  CONSTRAINT `WorkCountry#` FOREIGN KEY (`countryId`) REFERENCES `Country` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-01-31 14:00:13

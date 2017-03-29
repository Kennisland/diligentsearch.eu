-- phpMyAdmin SQL Dump
-- version 4.6.6deb1+deb.cihar.com~xenial.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Feb 24, 2017 at 10:24 AM
-- Server version: 5.7.17-0ubuntu0.16.04.1
-- PHP Version: 7.0.13-0ubuntu0.16.04.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `diligent_search`
--
CREATE DATABASE IF NOT EXISTS `diligent_search` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `diligent_search`;

-- --------------------------------------------------------

--
-- Table structure for table `Block`
--

CREATE TABLE `Block` (
  `id` int(4) NOT NULL,
  `workId` int(3) NOT NULL,
  `value` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `Country`
--

CREATE TABLE `Country` (
  `id` int(2) NOT NULL,
  `code` varchar(3) NOT NULL,
  `name` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `DecisionTree`
--

CREATE TABLE `DecisionTree` (
  `id` int(3) NOT NULL,
  `workId` int(3) NOT NULL,
  `value` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `Form`
--

CREATE TABLE `Form` (
  `id` int(5) NOT NULL,
  `workId` int(3) NOT NULL,
  `hook` text NOT NULL,
  `version` int(3) NOT NULL DEFAULT '0',
  `value` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Triggers `Form`
--
DELIMITER $$
CREATE TRIGGER `FormVersioning` BEFORE INSERT ON `Form` FOR EACH ROW BEGIN
  DECLARE c INT;
    SET c = (SELECT COUNT(*) FROM Form WHERE hook = NEW.hook);
    IF c=0 THEN
        SET NEW.version = 1;
    ELSE
      SET NEW.version = (SELECT (MAX(version)+1) FROM Form WHERE hook = NEW.hook);
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `Question`
--

CREATE TABLE `Question` (
  `id` int(4) NOT NULL,
  `workId` int(3) NOT NULL,
  `value` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `Result`
--

CREATE TABLE `Result` (
  `id` int(4) NOT NULL,
  `workId` int(3) NOT NULL,
  `value` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `SharedRefValue`
--

CREATE TABLE `SharedRefValue` (
  `id` int(3) NOT NULL,
  `countryId` int(2) NOT NULL,
  `value` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `SharedUserInput`
--

CREATE TABLE `SharedUserInput` (
  `id` int(3) NOT NULL,
  `countryId` int(2) NOT NULL,
  `value` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `Work`
--

CREATE TABLE `Work` (
  `id` int(3) NOT NULL,
  `countryId` int(2) NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Block`
--
ALTER TABLE `Block`
  ADD PRIMARY KEY (`id`),
  ADD KEY `blockWorkId` (`workId`);

--
-- Indexes for table `Country`
--
ALTER TABLE `Country`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `DecisionTree`
--
ALTER TABLE `DecisionTree`
  ADD PRIMARY KEY (`id`),
  ADD KEY `DecisionTreeWorkConstraint` (`workId`);

--
-- Indexes for table `Form`
--
ALTER TABLE `Form`
  ADD PRIMARY KEY (`id`),
  ADD KEY `formWorkConstraint` (`workId`);

--
-- Indexes for table `Question`
--
ALTER TABLE `Question`
  ADD PRIMARY KEY (`id`),
  ADD KEY `QuestionWorkId` (`workId`);

--
-- Indexes for table `Result`
--
ALTER TABLE `Result`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ResultWorkId` (`workId`);

--
-- Indexes for table `SharedRefValue`
--
ALTER TABLE `SharedRefValue`
  ADD PRIMARY KEY (`id`),
  ADD KEY `RefValuesCountry` (`countryId`);

--
-- Indexes for table `SharedUserInput`
--
ALTER TABLE `SharedUserInput`
  ADD PRIMARY KEY (`id`),
  ADD KEY `UserInputsCountry` (`countryId`);

--
-- Indexes for table `Work`
--
ALTER TABLE `Work`
  ADD PRIMARY KEY (`id`),
  ADD KEY `countryId` (`countryId`) USING BTREE;

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Block`
--
ALTER TABLE `Block`
  MODIFY `id` int(4) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;
--
-- AUTO_INCREMENT for table `Country`
--
ALTER TABLE `Country`
  MODIFY `id` int(2) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
--
-- AUTO_INCREMENT for table `DecisionTree`
--
ALTER TABLE `DecisionTree`
  MODIFY `id` int(3) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;
--
-- AUTO_INCREMENT for table `Form`
--
ALTER TABLE `Form`
  MODIFY `id` int(5) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;
--
-- AUTO_INCREMENT for table `Question`
--
ALTER TABLE `Question`
  MODIFY `id` int(4) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=162;
--
-- AUTO_INCREMENT for table `Result`
--
ALTER TABLE `Result`
  MODIFY `id` int(4) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;
--
-- AUTO_INCREMENT for table `SharedRefValue`
--
ALTER TABLE `SharedRefValue`
  MODIFY `id` int(3) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;
--
-- AUTO_INCREMENT for table `SharedUserInput`
--
ALTER TABLE `SharedUserInput`
  MODIFY `id` int(3) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;
--
-- AUTO_INCREMENT for table `Work`
--
ALTER TABLE `Work`
  MODIFY `id` int(3) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `Block`
--
ALTER TABLE `Block`
  ADD CONSTRAINT `blockWorkId` FOREIGN KEY (`workId`) REFERENCES `Work` (`id`);

--
-- Constraints for table `DecisionTree`
--
ALTER TABLE `DecisionTree`
  ADD CONSTRAINT `DecisionTreeWorkConstraint` FOREIGN KEY (`workId`) REFERENCES `Work` (`id`);

--
-- Constraints for table `Form`
--
ALTER TABLE `Form`
  ADD CONSTRAINT `formWorkConstraint` FOREIGN KEY (`workId`) REFERENCES `Work` (`id`);

--
-- Constraints for table `Question`
--
ALTER TABLE `Question`
  ADD CONSTRAINT `QuestionWorkId` FOREIGN KEY (`workId`) REFERENCES `Work` (`id`);

--
-- Constraints for table `Result`
--
ALTER TABLE `Result`
  ADD CONSTRAINT `ResultWorkId` FOREIGN KEY (`workId`) REFERENCES `Work` (`id`);

--
-- Constraints for table `SharedRefValue`
--
ALTER TABLE `SharedRefValue`
  ADD CONSTRAINT `RefValuesCountry` FOREIGN KEY (`countryId`) REFERENCES `Country` (`id`);

--
-- Constraints for table `SharedUserInput`
--
ALTER TABLE `SharedUserInput`
  ADD CONSTRAINT `UserInputsCountry` FOREIGN KEY (`countryId`) REFERENCES `Country` (`id`);

--
-- Constraints for table `Work`
--
ALTER TABLE `Work`
  ADD CONSTRAINT `WorkCountry#` FOREIGN KEY (`countryId`) REFERENCES `Country` (`id`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

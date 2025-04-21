-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 12, 2025 at 10:40 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `restaurante`
--

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `entryid` int(11) NOT NULL,
  `userid` int(20) NOT NULL,
  `action` varchar(20) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `layout`
--

CREATE TABLE `layout` (
  `componentid` int(11) NOT NULL,
  `top` smallint(5) NOT NULL,
  `left` smallint(5) NOT NULL DEFAULT 0,
  `width` int(10) NOT NULL,
  `height` int(10) NOT NULL,
  `type` varchar(100) NOT NULL,
  `status` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `layout`
--

INSERT INTO `layout` (`componentid`, `top`, `left`, `width`, `height`, `type`, `status`) VALUES
(120, 60, 25, 10, 10, 'Table', ''),
(121, 30, 65, 15, 25, 'Table', ''),
(122, 60, 45, 10, 10, 'Table', ''),
(123, 10, 15, 10, 10, 'Table', '');

-- --------------------------------------------------------

--
-- Table structure for table `menu`
--

CREATE TABLE `menu` (
  `product_id` int(11) NOT NULL,
  `product` varchar(100) NOT NULL,
  `price` double NOT NULL,
  `category` varchar(100) NOT NULL,
  `image_path` varchar(100) NOT NULL,
  `active` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `menu`
--

INSERT INTO `menu` (`product_id`, `product`, `price`, `category`, `image_path`, `active`) VALUES
(3, 'Hamburger', 12.5, 'Fast Food', '', 1),
(4, 'Salmon', 10, 'Dish', 'Salmon.png', 1),
(5, 'Coca-Cola', 2, 'Drink', 'Coca-Cola.png', 1),
(6, 'Stroganoff', 8, 'Dish', '', 1),
(7, 'Kids Steak', 10.5, 'Kids', '', 1),
(9, 'Teste', 5, 'Dish', '', 1),
(10, 'Teste2', 5, 'Dish', '1741647563135_coca-cola-png-41657.png', 1),
(11, 'Teste3', 3, 'Appetizer', '1741647789305_Nettspend.jpg', 1),
(12, 'Hamburger', 1, 'Drink', '1741689983142_coca-cola-png-41657.png', 1);

-- --------------------------------------------------------

--
-- Table structure for table `menu_categories`
--

CREATE TABLE `menu_categories` (
  `category_id` int(11) NOT NULL,
  `category` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `menu_categories`
--

INSERT INTO `menu_categories` (`category_id`, `category`) VALUES
(1, 'Dish'),
(2, 'Drink'),
(3, 'Kids'),
(4, 'Appetizer'),
(5, 'Desserts');

-- --------------------------------------------------------

--
-- Table structure for table `receipts`
--

CREATE TABLE `receipts` (
  `receipt_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `userid` int(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `receipt_items`
--

CREATE TABLE `receipt_items` (
  `product_id` int(11) NOT NULL,
  `receipt_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reservations`
--

CREATE TABLE `reservations` (
  `id` int(11) NOT NULL,
  `tableid` int(11) NOT NULL,
  `userid` int(20) NOT NULL,
  `reservation_time` datetime NOT NULL,
  `status` varchar(20) NOT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `userid` int(20) NOT NULL,
  `username` varchar(20) NOT NULL,
  `active` tinyint(1) NOT NULL,
  `email` varchar(254) NOT NULL,
  `phone` int(10) NOT NULL,
  `fullname` varchar(150) NOT NULL,
  `access_level` varchar(20) NOT NULL,
  `birthdate` date NOT NULL,
  `country` varchar(60) NOT NULL,
  `city` varchar(150) NOT NULL,
  `adress` varchar(150) NOT NULL,
  `postalcode` varchar(15) NOT NULL,
  `password` varchar(64) NOT NULL,
  `profile_icon` varchar(255) NOT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`userid`, `username`, `active`, `email`, `phone`, `fullname`, `access_level`, `birthdate`, `country`, `city`, `adress`, `postalcode`, `password`, `profile_icon`, `created`) VALUES
(13, 'gabs', 1, 'gabrielmonteiroferreira@gmail.com', 233223, 'Gabriel sdfsdfsdf', 'admin', '2000-05-05', 'Portugal', 'Coimbra', 'PraÃ§a AÃ§ores NÂº5', '3030-032', '123', '', '2024-12-12 14:47:36'),
(63, 'PhlanangeSystems', 1, 'gayahh@gmail.com', 9671221, 'Gabriel Monteiro Ferreira', '', '2011-12-07', 'Portugal', 'Coimbra', 'PraÃ§a AÃ§ores NÂº5', '3030-032', '123', '', '2024-12-12 14:47:36'),
(66, 'test', 1, 'test@gmail.com', 967342112, 'Gabriel Monteiro Fsdf', '', '2011-12-07', 'Portugal', 'Coimbra', 'PraÃ§a AÃ§ores NÂº5', '3030-032', '123', '', '2024-12-12 14:47:36'),
(67, 'teste2', 1, 'teste2@gmail.com', 967, 'Gabriel Monteiro Ferreira', '', '2000-02-11', 'Portugal', 'Coimbra', 'PraÃ§a AÃ§ores NÂº5', '3030-032', '123', '', '2024-12-12 14:47:36'),
(68, 'teste3', 0, 'teste3@gmail.com', 9673111, 'Gabriel monte de ferro', '', '2000-02-11', 'Portugal', 'Coimbra', 'PraÃ§a AÃ§ores NÂº5', '3030-032', '123', '', '2024-12-12 14:47:36'),
(69, 'test4', 1, 'test4@gmail.com', 967342198, 'Gabriel Monteiro a', '', '2000-10-11', 'Portugal', 'Coimbra', 'PraÃ§a AÃ§ores NÂº5', '3030-032', '123', '', '2024-12-12 14:47:36'),
(70, 'test5', 0, 'test5@gmail.com', 967342118, 'Gabriel Monteiro Ferreira', '', '2000-11-11', 'Portugal', 'Coimbra', 'PraÃ§a AÃ§ores NÂº5', '3030-032', '123', '', '2024-12-12 15:10:40'),
(73, 'test6', 0, 'test6@gmail.com', 96734266, 'Gabriel Monteiro Ferreira', '', '2000-11-11', 'Portugal', 'Coimbra', 'PraÃ§a AÃ§ores NÂº5', '3030-032', '123', '', '2024-12-12 15:12:04'),
(74, 'teste6', 1, 'audf@gmail.com', 96734212, 'Gabriel Monteiro Ferreira', '', '2000-02-10', 'Portugal', 'Coimbra', 'PraÃ§a AÃ§ores NÂº5', '3030-032', '123', '', '2024-12-12 15:33:42'),
(75, 'antonio', 1, 'antonio@gmail.com', 1111111, 'Gabriel Monteiro Ferreira', '', '2000-02-10', 'Portugal', 'Coimbra', 'PraÃ§a AÃ§ores NÂº5', '3030-032', '123', '', '2024-12-12 15:34:53'),
(185, 'Testesefunciona', 1, 'Testefuncional@gmail.com', 35345345, 'Gabriel Monteiro Ferreira', '', '2012-01-03', 'Portugal', 'Coimbra', 'sdfdsfsdf', '3030-032', 'aA1!sdfsdfsfd', '', '2025-01-20 15:40:07'),
(191, 'lsdkfnskldf', 1, 's@gmail.cofnsdklfndklm', 90384283, 'Gabriel Monteiro Ferreira', '', '2012-01-19', 'Portugal', 'Coimbra', 'PraÃ§a AÃ§ores NÂº5', '3030-032', 'Hh1!sjdfnlsjdf', '', '2025-01-21 10:50:21'),
(192, 'sffsdsdf', 1, 'sdfknlsdf@gmail.com', 2147483647, 'Gabriel Monteiro Ferreira', '', '2012-01-11', 'Portugal', 'Coimbra', 'sdfsdfsdf', '3030-032', 'jJ1!skdnfsd', '', '2025-01-21 10:52:08'),
(194, 'aaaaaaaaaaaaaa', 1, 'aaaaaaaaaaaaaaaaaaa@gmail.com', 566665555, 'Gabriel Monteiro Ferreira', '', '2012-01-04', 'Portugal', 'Coimbra', 'PraÃ§a AÃ§ores NÂº5', '3030-032', 'aA1!sjdkfbskdjf', '', '2025-01-21 10:53:47');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`entryid`),
  ADD KEY `userid` (`userid`);

--
-- Indexes for table `layout`
--
ALTER TABLE `layout`
  ADD PRIMARY KEY (`componentid`);

--
-- Indexes for table `menu`
--
ALTER TABLE `menu`
  ADD PRIMARY KEY (`product_id`);

--
-- Indexes for table `menu_categories`
--
ALTER TABLE `menu_categories`
  ADD PRIMARY KEY (`category_id`);

--
-- Indexes for table `receipts`
--
ALTER TABLE `receipts`
  ADD PRIMARY KEY (`receipt_id`),
  ADD UNIQUE KEY `user_id` (`userid`),
  ADD UNIQUE KEY `userid` (`userid`);

--
-- Indexes for table `receipt_items`
--
ALTER TABLE `receipt_items`
  ADD KEY `receipt_id` (`receipt_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `reservations`
--
ALTER TABLE `reservations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tableid` (`tableid`),
  ADD KEY `userid` (`userid`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userid`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `phone` (`phone`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `entryid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `layout`
--
ALTER TABLE `layout`
  MODIFY `componentid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=125;

--
-- AUTO_INCREMENT for table `menu`
--
ALTER TABLE `menu`
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `menu_categories`
--
ALTER TABLE `menu_categories`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `receipts`
--
ALTER TABLE `receipts`
  MODIFY `receipt_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reservations`
--
ALTER TABLE `reservations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `userid` int(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=203;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`userid`) REFERENCES `users` (`userid`);

--
-- Constraints for table `receipt_items`
--
ALTER TABLE `receipt_items`
  ADD CONSTRAINT `product_id` FOREIGN KEY (`product_id`) REFERENCES `menu` (`product_id`),
  ADD CONSTRAINT `receipt_id` FOREIGN KEY (`receipt_id`) REFERENCES `receipts` (`receipt_id`);

--
-- Constraints for table `reservations`
--
ALTER TABLE `reservations`
  ADD CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`userid`) REFERENCES `users` (`userid`),
  ADD CONSTRAINT `reservations_ibfk_2` FOREIGN KEY (`tableid`) REFERENCES `layout` (`componentid`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         8.0.40 - MySQL Community Server - GPL
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.8.0.6908
-- --------------------------------------------------------
SET FOREIGN_KEY_CHECKS = 0;
-- Volcando estructura de base de datos para Proyecto_Intermodular_SIGED
CREATE DATABASE IF NOT EXISTS `Proyecto_Intermodular_SIGED` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `Proyecto_Intermodular_SIGED`;

-- Volcando estructura para tabla Proyecto_Intermodular_SIGED.Bolsa
CREATE TABLE IF NOT EXISTS `Bolsa` (
  `id_Bolsa` int NOT NULL AUTO_INCREMENT,
  `id_DepartamentoFK` int NOT NULL,
  `fecha_inicio` date NOT NULL,
  `cantidad_inicial` double NOT NULL,
  `fecha_final` date NOT NULL,
  PRIMARY KEY (`id_Bolsa`),
  KEY `id_DepartamentoFK` (`id_DepartamentoFK`),
  CONSTRAINT `bolsa_ibfk_1` FOREIGN KEY (`id_DepartamentoFK`) REFERENCES `Departamento` (`id_Departamento`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla Proyecto_Intermodular_SIGED.Bolsa: ~20 rows (aproximadamente)
DELETE FROM `Bolsa`;
INSERT INTO `Bolsa` (`id_Bolsa`, `id_DepartamentoFK`, `fecha_inicio`, `cantidad_inicial`, `fecha_final`) VALUES
	(1, 1, '2025-01-01', 50000, '2025-12-31'),
	(2, 2, '2025-01-01', 35000, '2025-12-31'),
	(3, 3, '2025-01-01', 25000, '2025-12-31'),
	(4, 4, '2025-01-01', 30000, '2025-12-31'),
	(5, 5, '2025-01-01', 40000, '2025-12-31'),
	(6, 1, '2025-01-01', 100000, '2025-12-31'),
	(7, 2, '2025-01-01', 50000, '2025-12-31'),
	(8, 3, '2025-01-01', 30000, '2025-12-31'),
	(9, 4, '2025-01-01', 25000, '2025-12-31'),
	(10, 5, '2025-01-01', 60000, '2025-12-31'),
	(11, 1, '2024-01-01', 42000, '2024-12-31'),
	(12, 2, '2024-01-01', 32000, '2024-12-31'),
	(13, 3, '2024-01-01', 22000, '2024-12-31'),
	(14, 4, '2024-01-01', 28000, '2024-12-31'),
	(15, 5, '2024-01-01', 37000, '2024-12-31'),
	(16, 1, '2024-01-01', 90000, '2024-12-31'),
	(17, 2, '2024-01-01', 45000, '2024-12-31'),
	(18, 3, '2024-01-01', 27000, '2024-12-31'),
	(19, 4, '2024-01-01', 22000, '2024-12-31'),
	(20, 5, '2024-01-01', 55000, '2024-12-31');

-- Volcando estructura para tabla Proyecto_Intermodular_SIGED.Bolsa_Inversion
CREATE TABLE IF NOT EXISTS `Bolsa_Inversion` (
  `idBolsa` int NOT NULL AUTO_INCREMENT,
  `id_BolsaFK` int NOT NULL,
  PRIMARY KEY (`idBolsa`),
  KEY `id_BolsaFK` (`id_BolsaFK`),
  CONSTRAINT `bolsa_inversion_ibfk_1` FOREIGN KEY (`id_BolsaFK`) REFERENCES `Bolsa` (`id_Bolsa`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla Proyecto_Intermodular_SIGED.Bolsa_Inversion: ~10 rows (aproximadamente)
DELETE FROM `Bolsa_Inversion`;
INSERT INTO `Bolsa_Inversion` (`idBolsa`, `id_BolsaFK`) VALUES
	(1, 6),
	(2, 7),
	(3, 8),
	(4, 9),
	(5, 10),
	(6, 16),
	(7, 17),
	(8, 18),
	(9, 19),
	(10, 20);

-- Volcando estructura para tabla Proyecto_Intermodular_SIGED.Bolsa_Presupuesto
CREATE TABLE IF NOT EXISTS `Bolsa_Presupuesto` (
  `idBolsa` int NOT NULL AUTO_INCREMENT,
  `id_BolsaFK` int NOT NULL,
  PRIMARY KEY (`idBolsa`),
  KEY `id_BolsaFK` (`id_BolsaFK`),
  CONSTRAINT `bolsa_presupuesto_ibfk_1` FOREIGN KEY (`id_BolsaFK`) REFERENCES `Bolsa` (`id_Bolsa`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla Proyecto_Intermodular_SIGED.Bolsa_Presupuesto: ~10 rows (aproximadamente)
DELETE FROM `Bolsa_Presupuesto`;
INSERT INTO `Bolsa_Presupuesto` (`idBolsa`, `id_BolsaFK`) VALUES
	(1, 1),
	(2, 2),
	(3, 3),
	(4, 4),
	(5, 5),
	(6, 11),
	(7, 12),
	(8, 13),
	(9, 14),
	(10, 15);

-- Volcando estructura para tabla Proyecto_Intermodular_SIGED.Departamento
CREATE TABLE IF NOT EXISTS `Departamento` (
  `id_Departamento` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(60) NOT NULL,
  PRIMARY KEY (`id_Departamento`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla Proyecto_Intermodular_SIGED.Departamento: ~5 rows (aproximadamente)
DELETE FROM `Departamento`;
INSERT INTO `Departamento` (`id_Departamento`, `Nombre`) VALUES
	(1, 'Informática'),
	(2, 'Robótica'),
	(3, 'Mecánica'),
	(4, 'Electricidad'),
	(5, 'Automoción');

-- Volcando estructura para tabla Proyecto_Intermodular_SIGED.Estado
CREATE TABLE IF NOT EXISTS `Estado` (
  `idEstado` int NOT NULL AUTO_INCREMENT,
  `Tipo` varchar(15) NOT NULL,
  PRIMARY KEY (`idEstado`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla Proyecto_Intermodular_SIGED.Estado: ~3 rows (aproximadamente)
DELETE FROM `Estado`;
INSERT INTO `Estado` (`idEstado`, `Tipo`) VALUES
	(1, 'Pendiente'),
	(2, 'Contabilizada'),
	(3, 'Anulada');

-- Volcando estructura para tabla Proyecto_Intermodular_SIGED.Estado_orden
CREATE TABLE IF NOT EXISTS `Estado_orden` (
  `id_EstadoOrden` int NOT NULL AUTO_INCREMENT,
  `tipo` varchar(50) NOT NULL,
  PRIMARY KEY (`id_EstadoOrden`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla Proyecto_Intermodular_SIGED.Estado_orden: ~3 rows (aproximadamente)
DELETE FROM `Estado_orden`;
INSERT INTO `Estado_orden` (`id_EstadoOrden`, `tipo`) VALUES
	(1, 'En proceso'),
	(2, 'Anulada'),
	(3, 'Confirmada');

-- Volcando estructura para tabla Proyecto_Intermodular_SIGED.Factura
CREATE TABLE IF NOT EXISTS `Factura` (
  `idFactura` int NOT NULL AUTO_INCREMENT,
  `Num_factura` varchar(30) NOT NULL,
  `Fecha_emision` date NOT NULL,
  `Ruta_pdf` varchar(150) DEFAULT NULL,
  `idOrdenFK` int DEFAULT NULL,
  `idEstadoFK` int DEFAULT NULL,
  PRIMARY KEY (`idFactura`),
  KEY `idOrdenFK` (`idOrdenFK`),
  KEY `idEstadoFK` (`idEstadoFK`),
  CONSTRAINT `factura_ibfk_1` FOREIGN KEY (`idOrdenFK`) REFERENCES `Orden` (`idOrden`),
  CONSTRAINT `factura_ibfk_2` FOREIGN KEY (`idEstadoFK`) REFERENCES `Estado` (`idEstado`)
) ENGINE=InnoDB AUTO_INCREMENT=132 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla Proyecto_Intermodular_SIGED.Factura: ~131 rows (aproximadamente)
DELETE FROM `Factura`;
INSERT INTO `Factura` (`idFactura`, `Num_factura`, `Fecha_emision`, `Ruta_pdf`, `idOrdenFK`, `idEstadoFK`) VALUES
	(1, 'FAC-INF-123456', '2025-02-12', '/facturas/2025/inf/fac-inf-123456.pdf', 1, 2),
	(2, 'FAC-INF-789012', '2025-02-17', '/facturas/2025/inf/fac-inf-789012.pdf', 2, 1),
	(3, 'FAC-INF-234567', '2025-02-22', '/facturas/2025/inf/fac-inf-234567.pdf', 3, 2),
	(4, 'FAC-MEC-345678', '2025-02-14', '/facturas/2025/mec/fac-mec-345678.pdf', 4, 2),
	(5, 'FAC-MEC-456789', '2025-02-20', '/facturas/2025/mec/fac-mec-456789.pdf', 5, 1),
	(6, 'FAC-ELE-567890', '2025-02-16', '/facturas/2025/ele/fac-ele-567890.pdf', 6, 2),
	(7, 'FAC-ELE-678901', '2025-02-24', '/facturas/2025/ele/fac-ele-678901.pdf', 7, 1),
	(8, 'FAC-ROB-789012', '2025-02-18', '/facturas/2025/rob/fac-rob-789012.pdf', 8, 2),
	(9, 'FAC-ROB-890123', '2025-02-26', '/facturas/2025/rob/fac-rob-890123.pdf', 9, 1),
	(10, 'FAC-AUT-901234', '2025-02-13', '/facturas/2025/aut/fac-aut-901234.pdf', 10, 3),
	(11, 'FAC-AUT-012345', '2025-02-21', '/facturas/2025/aut/fac-aut-012345.pdf', 11, 2),
	(12, 'FAC-INF-123457', '2024-01-15', '/facturas/2024/inf/fac-inf-123457.pdf', 12, 2),
	(13, 'FAC-ROB-789013', '2024-01-20', '/facturas/2024/rob/fac-rob-789013.pdf', 14, 2),
	(14, 'FAC-MEC-345679', '2024-01-17', '/facturas/2024/mec/fac-mec-345679.pdf', 16, 2),
	(15, 'FAC-ELE-567891', '2024-01-13', '/facturas/2024/ele/fac-ele-567891.pdf', 18, 2),
	(16, 'FAC-AUT-901235', '2024-01-19', '/facturas/2024/aut/fac-aut-901235.pdf', 20, 2),
	(17, 'FAC-INF-234568', '2024-01-23', '/facturas/2024/inf/fac-inf-234568.pdf', 13, 2),
	(18, 'FAC-ROB-890124', '2024-01-27', '/facturas/2024/rob/fac-rob-890124.pdf', 15, 2),
	(19, 'FAC-MEC-456790', '2024-01-30', '/facturas/2024/mec/fac-mec-456790.pdf', 17, 2),
	(20, 'FAC-ELE-678902', '2024-01-25', '/facturas/2024/ele/fac-ele-678902.pdf', 19, 2),
	(21, 'FAC-AUT-012346', '2024-02-02', '/facturas/2024/aut/fac-aut-012346.pdf', 21, 2),
	(22, 'FAC-INF-123458', '2024-02-13', '/facturas/2024/inf/fac-inf-123458.pdf', 22, 2),
	(23, 'FAC-ELE-567892', '2024-02-14', '/facturas/2024/ele/fac-ele-567892.pdf', 24, 2),
	(24, 'FAC-ROB-789014', '2024-02-15', '/facturas/2024/rob/fac-rob-789014.pdf', 26, 2),
	(25, 'FAC-MEC-345680', '2024-02-17', '/facturas/2024/mec/fac-mec-345680.pdf', 28, 2),
	(26, 'FAC-AUT-901236', '2024-02-19', '/facturas/2024/aut/fac-aut-901236.pdf', 30, 2),
	(27, 'FAC-INF-234569', '2024-02-21', '/facturas/2024/inf/fac-inf-234569.pdf', 23, 2),
	(28, 'FAC-ELE-678903', '2024-02-24', '/facturas/2024/ele/fac-ele-678903.pdf', 25, 2),
	(29, 'FAC-ROB-890125', '2024-02-25', '/facturas/2024/rob/fac-rob-890125.pdf', 27, 2),
	(30, 'FAC-MEC-456791', '2024-02-27', '/facturas/2024/mec/fac-mec-456791.pdf', 29, 2),
	(31, 'FAC-AUT-012347', '2024-02-29', '/facturas/2024/aut/fac-aut-012347.pdf', 31, 2),
	(32, 'FAC-INF-123459', '2024-03-10', '/facturas/2024/inf/fac-inf-123459.pdf', 32, 2),
	(33, 'FAC-ROB-789015', '2024-03-13', '/facturas/2024/rob/fac-rob-789015.pdf', 34, 2),
	(34, 'FAC-MEC-345681', '2024-03-15', '/facturas/2024/mec/fac-mec-345681.pdf', 36, 2),
	(35, 'FAC-ELE-567893', '2024-03-12', '/facturas/2024/ele/fac-ele-567893.pdf', 38, 2),
	(36, 'FAC-AUT-901237', '2024-03-17', '/facturas/2024/aut/fac-aut-901237.pdf', 40, 2),
	(37, 'FAC-INF-234570', '2024-03-20', '/facturas/2024/inf/fac-inf-234570.pdf', 33, 2),
	(38, 'FAC-ROB-890126', '2024-03-23', '/facturas/2024/rob/fac-rob-890126.pdf', 35, 2),
	(39, 'FAC-MEC-456792', '2024-03-25', '/facturas/2024/mec/fac-mec-456792.pdf', 37, 2),
	(40, 'FAC-ELE-678904', '2024-03-22', '/facturas/2024/ele/fac-ele-678904.pdf', 39, 2),
	(41, 'FAC-AUT-012348', '2024-03-27', '/facturas/2024/aut/fac-aut-012348.pdf', 41, 2),
	(42, 'FAC-INF-123460', '2024-04-09', '/facturas/2024/inf/fac-inf-123460.pdf', 42, 2),
	(43, 'FAC-ROB-789016', '2024-04-11', '/facturas/2024/rob/fac-rob-789016.pdf', 44, 2),
	(44, 'FAC-MEC-345682', '2024-04-14', '/facturas/2024/mec/fac-mec-345682.pdf', 46, 2),
	(45, 'FAC-ELE-567894', '2024-04-10', '/facturas/2024/ele/fac-ele-567894.pdf', 48, 2),
	(46, 'FAC-AUT-901238', '2024-04-13', '/facturas/2024/aut/fac-aut-901238.pdf', 50, 2),
	(47, 'FAC-INF-234571', '2024-04-19', '/facturas/2024/inf/fac-inf-234571.pdf', 43, 2),
	(48, 'FAC-ROB-890127', '2024-04-21', '/facturas/2024/rob/fac-rob-890127.pdf', 45, 2),
	(49, 'FAC-MEC-456793', '2024-04-24', '/facturas/2024/mec/fac-mec-456793.pdf', 47, 2),
	(50, 'FAC-ELE-678905', '2024-04-20', '/facturas/2024/ele/fac-ele-678905.pdf', 49, 2),
	(51, 'FAC-AUT-012349', '2024-04-23', '/facturas/2024/aut/fac-aut-012349.pdf', 51, 2),
	(52, 'FAC-INF-123461', '2024-05-11', '/facturas/2024/inf/fac-inf-123461.pdf', 52, 2),
	(53, 'FAC-ROB-789017', '2024-05-13', '/facturas/2024/rob/fac-rob-789017.pdf', 54, 2),
	(54, 'FAC-MEC-345683', '2024-05-15', '/facturas/2024/mec/fac-mec-345683.pdf', 56, 2),
	(55, 'FAC-ELE-567895', '2024-05-12', '/facturas/2024/ele/fac-ele-567895.pdf', 58, 2),
	(56, 'FAC-AUT-901239', '2024-05-14', '/facturas/2024/aut/fac-aut-901239.pdf', 60, 2),
	(57, 'FAC-INF-234572', '2024-05-21', '/facturas/2024/inf/fac-inf-234572.pdf', 53, 2),
	(58, 'FAC-ROB-890128', '2024-05-23', '/facturas/2024/rob/fac-rob-890128.pdf', 55, 2),
	(59, 'FAC-MEC-456794', '2024-05-25', '/facturas/2024/mec/fac-mec-456794.pdf', 57, 2),
	(60, 'FAC-ELE-678906', '2024-05-22', '/facturas/2024/ele/fac-ele-678906.pdf', 59, 2),
	(61, 'FAC-AUT-012350', '2024-05-24', '/facturas/2024/aut/fac-aut-012350.pdf', 61, 2),
	(62, 'FAC-INF-123462', '2024-06-08', '/facturas/2024/inf/fac-inf-123462.pdf', 62, 2),
	(63, 'FAC-ROB-789018', '2024-06-10', '/facturas/2024/rob/fac-rob-789018.pdf', 64, 2),
	(64, 'FAC-MEC-345684', '2024-06-13', '/facturas/2024/mec/fac-mec-345684.pdf', 66, 2),
	(65, 'FAC-ELE-567896', '2024-06-09', '/facturas/2024/ele/fac-ele-567896.pdf', 68, 2),
	(66, 'FAC-AUT-901240', '2024-06-11', '/facturas/2024/aut/fac-aut-901240.pdf', 70, 2),
	(67, 'FAC-INF-234573', '2024-06-18', '/facturas/2024/inf/fac-inf-234573.pdf', 63, 2),
	(68, 'FAC-ROB-890129', '2024-06-20', '/facturas/2024/rob/fac-rob-890129.pdf', 65, 2),
	(69, 'FAC-MEC-456795', '2024-06-23', '/facturas/2024/mec/fac-mec-456795.pdf', 67, 2),
	(70, 'FAC-ELE-678907', '2024-06-19', '/facturas/2024/ele/fac-ele-678907.pdf', 69, 2),
	(71, 'FAC-AUT-012351', '2024-06-21', '/facturas/2024/aut/fac-aut-012351.pdf', 71, 2),
	(72, 'FAC-INF-123463', '2024-07-07', '/facturas/2024/inf/fac-inf-123463.pdf', 72, 2),
	(73, 'FAC-ROB-789019', '2024-07-09', '/facturas/2024/rob/fac-rob-789019.pdf', 74, 2),
	(74, 'FAC-MEC-345685', '2024-07-11', '/facturas/2024/mec/fac-mec-345685.pdf', 76, 2),
	(75, 'FAC-ELE-567897', '2024-07-08', '/facturas/2024/ele/fac-ele-567897.pdf', 78, 2),
	(76, 'FAC-AUT-901241', '2024-07-13', '/facturas/2024/aut/fac-aut-901241.pdf', 80, 2),
	(77, 'FAC-INF-234574', '2024-07-17', '/facturas/2024/inf/fac-inf-234574.pdf', 73, 2),
	(78, 'FAC-ROB-890130', '2024-07-19', '/facturas/2024/rob/fac-rob-890130.pdf', 75, 2),
	(79, 'FAC-MEC-456796', '2024-07-21', '/facturas/2024/mec/fac-mec-456796.pdf', 77, 2),
	(80, 'FAC-ELE-678908', '2024-07-18', '/facturas/2024/ele/fac-ele-678908.pdf', 79, 2),
	(81, 'FAC-AUT-012352', '2024-07-23', '/facturas/2024/aut/fac-aut-012352.pdf', 81, 2),
	(82, 'FAC-INF-123464', '2024-08-10', '/facturas/2024/inf/fac-inf-123464.pdf', 82, 2),
	(83, 'FAC-ROB-789020', '2024-08-12', '/facturas/2024/rob/fac-rob-789020.pdf', 84, 2),
	(84, 'FAC-MEC-345686', '2024-08-14', '/facturas/2024/mec/fac-mec-345686.pdf', 86, 2),
	(85, 'FAC-ELE-567898', '2024-08-11', '/facturas/2024/ele/fac-ele-567898.pdf', 88, 2),
	(86, 'FAC-AUT-901242', '2024-08-16', '/facturas/2024/aut/fac-aut-901242.pdf', 90, 2),
	(87, 'FAC-INF-234575', '2024-08-20', '/facturas/2024/inf/fac-inf-234575.pdf', 83, 2),
	(88, 'FAC-ROB-890131', '2024-08-22', '/facturas/2024/rob/fac-rob-890131.pdf', 85, 2),
	(89, 'FAC-MEC-456797', '2024-08-24', '/facturas/2024/mec/fac-mec-456797.pdf', 87, 2),
	(90, 'FAC-ELE-678909', '2024-08-21', '/facturas/2024/ele/fac-ele-678909.pdf', 89, 2),
	(91, 'FAC-AUT-012353', '2024-08-26', '/facturas/2024/aut/fac-aut-012353.pdf', 91, 2),
	(92, 'FAC-INF-123465', '2024-09-08', '/facturas/2024/inf/fac-inf-123465.pdf', 92, 2),
	(93, 'FAC-ROB-789021', '2024-09-10', '/facturas/2024/rob/fac-rob-789021.pdf', 94, 2),
	(94, 'FAC-MEC-345687', '2024-09-13', '/facturas/2024/mec/fac-mec-345687.pdf', 96, 2),
	(95, 'FAC-ELE-567899', '2024-09-09', '/facturas/2024/ele/fac-ele-567899.pdf', 98, 2),
	(96, 'FAC-AUT-901243', '2024-09-14', '/facturas/2024/aut/fac-aut-901243.pdf', 100, 2),
	(97, 'FAC-INF-234576', '2024-09-18', '/facturas/2024/inf/fac-inf-234576.pdf', 93, 2),
	(98, 'FAC-ROB-890132', '2024-09-20', '/facturas/2024/rob/fac-rob-890132.pdf', 95, 2),
	(99, 'FAC-MEC-456798', '2024-09-23', '/facturas/2024/mec/fac-mec-456798.pdf', 97, 2),
	(100, 'FAC-ELE-678910', '2024-09-19', '/facturas/2024/ele/fac-ele-678910.pdf', 99, 2),
	(101, 'FAC-AUT-012354', '2024-09-24', '/facturas/2024/aut/fac-aut-012354.pdf', 101, 2),
	(102, 'FAC-INF-123466', '2024-10-07', '/facturas/2024/inf/fac-inf-123466.pdf', 102, 2),
	(103, 'FAC-ROB-789022', '2024-10-09', '/facturas/2024/rob/fac-rob-789022.pdf', 104, 2),
	(104, 'FAC-MEC-345688', '2024-10-12', '/facturas/2024/mec/fac-mec-345688.pdf', 106, 2),
	(105, 'FAC-ELE-567900', '2024-10-08', '/facturas/2024/ele/fac-ele-567900.pdf', 108, 2),
	(106, 'FAC-AUT-901244', '2024-10-14', '/facturas/2024/aut/fac-aut-901244.pdf', 110, 2),
	(107, 'FAC-INF-234577', '2024-10-17', '/facturas/2024/inf/fac-inf-234577.pdf', 103, 2),
	(108, 'FAC-ROB-890133', '2024-10-19', '/facturas/2024/rob/fac-rob-890133.pdf', 105, 2),
	(109, 'FAC-MEC-456799', '2024-10-22', '/facturas/2024/mec/fac-mec-456799.pdf', 107, 2),
	(110, 'FAC-ELE-678911', '2024-10-18', '/facturas/2024/ele/fac-ele-678911.pdf', 109, 2),
	(111, 'FAC-AUT-012355', '2024-10-24', '/facturas/2024/aut/fac-aut-012355.pdf', 111, 2),
	(112, 'FAC-INF-123467', '2024-11-09', '/facturas/2024/inf/fac-inf-123467.pdf', 112, 2),
	(113, 'FAC-ROB-789023', '2024-11-11', '/facturas/2024/rob/fac-rob-789023.pdf', 114, 2),
	(114, 'FAC-MEC-345689', '2024-11-13', '/facturas/2024/mec/fac-mec-345689.pdf', 116, 2),
	(115, 'FAC-ELE-567901', '2024-11-10', '/facturas/2024/ele/fac-ele-567901.pdf', 118, 2),
	(116, 'FAC-AUT-901245', '2024-11-16', '/facturas/2024/aut/fac-aut-901245.pdf', 120, 2),
	(117, 'FAC-INF-234578', '2024-11-19', '/facturas/2024/inf/fac-inf-234578.pdf', 113, 2),
	(118, 'FAC-ROB-890134', '2024-11-21', '/facturas/2024/rob/fac-rob-890134.pdf', 115, 2),
	(119, 'FAC-MEC-456800', '2024-11-23', '/facturas/2024/mec/fac-mec-456800.pdf', 117, 2),
	(120, 'FAC-ELE-678912', '2024-11-20', '/facturas/2024/ele/fac-ele-678912.pdf', 119, 2),
	(121, 'FAC-AUT-012356', '2024-11-26', '/facturas/2024/aut/fac-aut-012356.pdf', 121, 2),
	(122, 'FAC-INF-123468', '2024-12-07', '/facturas/2024/inf/fac-inf-123468.pdf', 122, 2),
	(123, 'FAC-ROB-789024', '2024-12-09', '/facturas/2024/rob/fac-rob-789024.pdf', 124, 2),
	(124, 'FAC-MEC-345690', '2024-12-12', '/facturas/2024/mec/fac-mec-345690.pdf', 126, 2),
	(125, 'FAC-ELE-567902', '2024-12-08', '/facturas/2024/ele/fac-ele-567902.pdf', 128, 2),
	(126, 'FAC-AUT-901246', '2024-12-14', '/facturas/2024/aut/fac-aut-901246.pdf', 130, 2),
	(127, 'FAC-INF-234579', '2024-12-17', '/facturas/2024/inf/fac-inf-234579.pdf', 123, 2),
	(128, 'FAC-ROB-890135', '2024-12-19', '/facturas/2024/rob/fac-rob-890135.pdf', 125, 2),
	(129, 'FAC-MEC-456801', '2024-12-22', '/facturas/2024/mec/fac-mec-456801.pdf', 127, 2),
	(130, 'FAC-ELE-678913', '2024-12-18', '/facturas/2024/ele/fac-ele-678913.pdf', 129, 2),
	(131, 'FAC-AUT-012357', '2024-12-24', '/facturas/2024/aut/fac-aut-012357.pdf', 131, 2);

-- Volcando estructura para tabla Proyecto_Intermodular_SIGED.Orden
CREATE TABLE IF NOT EXISTS `Orden` (
  `idOrden` int NOT NULL AUTO_INCREMENT,
  `Num_orden` varchar(22) NOT NULL,
  `id_ProveedorFK` int NOT NULL,
  `id_DepartamentoFK` int NOT NULL,
  `id_UsuarioFK` int NOT NULL,
  `Importe` double NOT NULL,
  `Fecha` date NOT NULL,
  `Descripcion` varchar(255) DEFAULT NULL,
  `Inventariable` tinyint(1) NOT NULL DEFAULT '0',
  `Cantidad` int NOT NULL,
  `id_EstadoOrdenFK` int NOT NULL,
  `Factura` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`idOrden`),
  KEY `id_ProveedorFK` (`id_ProveedorFK`),
  KEY `id_DepartamentoFK` (`id_DepartamentoFK`),
  KEY `id_UsuarioFK` (`id_UsuarioFK`),
  KEY `fk_Orden_EstadoOrden` (`id_EstadoOrdenFK`),
  CONSTRAINT `fk_Orden_EstadoOrden` FOREIGN KEY (`id_EstadoOrdenFK`) REFERENCES `Estado_orden` (`id_EstadoOrden`),
  CONSTRAINT `orden_ibfk_1` FOREIGN KEY (`id_ProveedorFK`) REFERENCES `Proveedor` (`idProveedor`),
  CONSTRAINT `orden_ibfk_2` FOREIGN KEY (`id_DepartamentoFK`) REFERENCES `Departamento` (`id_Departamento`),
  CONSTRAINT `orden_ibfk_3` FOREIGN KEY (`id_UsuarioFK`) REFERENCES `Usuario` (`idUsuario`)
) ENGINE=InnoDB AUTO_INCREMENT=132 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla Proyecto_Intermodular_SIGED.Orden: ~131 rows (aproximadamente)
DELETE FROM `Orden`;
INSERT INTO `Orden` (`idOrden`, `Num_orden`, `id_ProveedorFK`, `id_DepartamentoFK`, `id_UsuarioFK`, `Importe`, `Fecha`, `Descripcion`, `Inventariable`, `Cantidad`, `id_EstadoOrdenFK`, `Factura`) VALUES
	(1, 'INF/001/25/0', 1, 1, 3, 1200, '2025-02-10', 'Teclado mecánico', 1, 10, 1, 0),
	(2, 'INF/002/25/0', 3, 1, 3, 5000, '2025-02-15', 'Ordenador portátil', 1, 5, 2, 0),
	(3, 'INF/003/25/1', 1, 1, 3, 300, '2025-02-20', 'Material de oficina', 0, 1, 3, 1),
	(4, 'MEC/001/25/0', 1, 3, 4, 2000, '2025-02-12', 'Licencias software diseño', 1, 5, 1, 0),
	(5, 'MEC/002/25/1', 4, 3, 4, 500, '2025-02-18', 'Material promocional', 0, 100, 3, 0),
	(6, 'ELE/001/25/1', 5, 4, 5, 800, '2025-02-14', 'Material formación', 0, 20, 3, 1),
	(7, 'ELE/002/25/0', 1, 4, 5, 1500, '2025-02-22', 'Mobiliario oficina', 1, 3, 3, 0),
	(8, 'ROB/001/25/1', 6, 2, 6, 400, '2025-02-16', 'Material oficina', 0, 10, 3, 0),
	(9, 'ROB/002/25/0', 2, 2, 6, 3000, '2025-02-24', 'Software contabilidad', 1, 1, 3, 1),
	(10, 'AUT/001/25/0', 7, 5, 7, 4500, '2025-02-11', 'Equipamiento logística', 1, 2, 3, 1),
	(11, 'AUT/002/25/1', 7, 5, 7, 600, '2025-02-19', 'Material embalaje', 0, 50, 3, 0),
	(12, 'INF/001/24/0', 8, 1, 3, 1500, '2024-01-10', 'Monitores profesionales', 1, 5, 3, 0),
	(13, 'INF/002/24/1', 9, 1, 3, 250, '2024-01-18', 'Material de oficina', 0, 1, 3, 0),
	(14, 'ROB/001/24/0', 10, 2, 6, 2800, '2024-01-15', 'Kit de desarrollo robótico', 1, 2, 3, 1),
	(15, 'ROB/002/24/1', 9, 2, 6, 350, '2024-01-22', 'Material promocional', 0, 50, 3, 1),
	(16, 'MEC/001/24/0', 11, 3, 4, 1700, '2024-01-12', 'Herramientas especializadas', 1, 3, 3, 0),
	(17, 'MEC/002/24/1', 8, 3, 4, 420, '2024-01-25', 'Suministros taller', 0, 10, 3, 0),
	(18, 'ELE/001/24/0', 12, 4, 5, 1200, '2024-01-08', 'Equipamiento de medición', 1, 2, 3, 0),
	(19, 'ELE/002/24/1', 11, 4, 5, 380, '2024-01-20', 'Material formación', 0, 15, 3, 0),
	(20, 'AUT/001/24/0', 12, 5, 7, 3800, '2024-01-14', 'Software simulación', 1, 1, 3, 0),
	(21, 'AUT/002/24/1', 10, 5, 7, 520, '2024-01-28', 'Material didáctico', 0, 25, 3, 1),
	(22, 'INF/003/24/0', 9, 1, 3, 1800, '2024-02-08', 'Servidores departamentales', 1, 1, 3, 0),
	(23, 'INF/004/24/1', 8, 1, 3, 320, '2024-02-16', 'Consumibles impresora', 0, 15, 3, 1),
	(24, 'ELE/003/24/0', 11, 4, 5, 1650, '2024-02-09', 'Bancos de pruebas', 1, 3, 3, 0),
	(25, 'ELE/004/24/1', 12, 4, 5, 420, '2024-02-19', 'Componentes prácticas', 0, 50, 3, 0),
	(26, 'ROB/003/24/0', 9, 2, 6, 2200, '2024-02-10', 'Sensores avanzados', 1, 5, 3, 1),
	(27, 'ROB/004/24/1', 10, 2, 6, 280, '2024-02-20', 'Material laboratorio', 0, 8, 3, 1),
	(28, 'MEC/003/24/0', 8, 3, 4, 2500, '2024-02-12', 'Software CAD', 1, 2, 3, 1),
	(29, 'MEC/004/24/1', 11, 3, 4, 350, '2024-02-22', 'Material didáctico', 0, 20, 3, 1),
	(30, 'AUT/003/24/0', 10, 5, 7, 3200, '2024-02-14', 'Equipamiento diagnóstico', 1, 1, 3, 0),
	(31, 'AUT/004/24/1', 12, 5, 7, 480, '2024-02-24', 'Material fungible taller', 0, 30, 3, 0),
	(32, 'INF/005/24/0', 8, 1, 3, 2200, '2024-03-05', 'Estaciones de trabajo', 1, 2, 3, 1),
	(33, 'INF/006/24/1', 9, 1, 3, 280, '2024-03-15', 'Material formación', 0, 25, 3, 1),
	(34, 'ROB/005/24/0', 8, 2, 6, 3500, '2024-03-08', 'Equipamiento laboratorio', 1, 1, 3, 0),
	(35, 'ROB/006/24/1', 10, 2, 6, 310, '2024-03-18', 'Componentes electrónicos', 0, 40, 3, 0),
	(36, 'MEC/005/24/0', 9, 3, 4, 1900, '2024-03-10', 'Maquinaria especializada', 1, 1, 3, 1),
	(37, 'MEC/006/24/1', 11, 3, 4, 290, '2024-03-20', 'Material de prácticas', 0, 30, 3, 0),
	(38, 'ELE/005/24/0', 10, 4, 5, 1300, '2024-03-07', 'Equipos de medición', 1, 3, 3, 1),
	(39, 'ELE/006/24/1', 12, 4, 5, 350, '2024-03-17', 'Material taller', 0, 20, 3, 0),
	(40, 'AUT/005/24/0', 11, 5, 7, 2800, '2024-03-12', 'Herramientas diagnóstico', 1, 1, 3, 1),
	(41, 'AUT/006/24/1', 8, 5, 7, 430, '2024-03-22', 'Material didáctico', 0, 15, 3, 1),
	(42, 'INF/007/24/0', 9, 1, 3, 1600, '2024-04-04', 'Servidores de respaldo', 1, 1, 3, 0),
	(43, 'INF/008/24/1', 8, 1, 3, 340, '2024-04-14', 'Material oficina', 0, 20, 3, 1),
	(44, 'ROB/007/24/0', 10, 2, 6, 2500, '2024-04-06', 'Componentes robóticos', 1, 3, 3, 0),
	(45, 'ROB/008/24/1', 9, 2, 6, 260, '2024-04-16', 'Material docente', 0, 15, 3, 0),
	(46, 'MEC/007/24/0', 8, 3, 4, 3200, '2024-04-09', 'Sistemas de control', 1, 1, 3, 1),
	(47, 'MEC/008/24/1', 11, 3, 4, 370, '2024-04-19', 'Material fungible', 0, 25, 3, 1),
	(48, 'ELE/007/24/0', 12, 4, 5, 1750, '2024-04-05', 'Equipamiento taller', 1, 2, 3, 1),
	(49, 'ELE/008/24/1', 11, 4, 5, 290, '2024-04-15', 'Material prácticas', 0, 30, 3, 0),
	(50, 'AUT/007/24/0', 10, 5, 7, 3600, '2024-04-08', 'Simuladores conducción', 1, 1, 3, 0),
	(51, 'AUT/008/24/1', 12, 5, 7, 410, '2024-04-18', 'Material promocional', 0, 50, 3, 1),
	(52, 'INF/009/24/0', 8, 1, 3, 2800, '2024-05-06', 'Equipos informáticos', 1, 3, 3, 1),
	(53, 'INF/010/24/1', 9, 1, 3, 260, '2024-05-16', 'Material formación', 0, 30, 3, 0),
	(54, 'ROB/009/24/0', 9, 2, 6, 1900, '2024-05-08', 'Brazos robóticos', 1, 2, 3, 0),
	(55, 'ROB/010/24/1', 10, 2, 6, 320, '2024-05-18', 'Material laboratorio', 0, 25, 3, 1),
	(56, 'MEC/009/24/0', 11, 3, 4, 2100, '2024-05-10', 'Equipamiento taller', 1, 1, 3, 0),
	(57, 'MEC/010/24/1', 8, 3, 4, 280, '2024-05-20', 'Material prácticas', 0, 20, 3, 1),
	(58, 'ELE/009/24/0', 10, 4, 5, 1450, '2024-05-07', 'Instrumental laboratorio', 1, 4, 3, 0),
	(59, 'ELE/010/24/1', 12, 4, 5, 330, '2024-05-17', 'Material didáctico', 0, 15, 3, 1),
	(60, 'AUT/009/24/0', 12, 5, 7, 2900, '2024-05-09', 'Equipos diagnóstico', 1, 1, 3, 0),
	(61, 'AUT/010/24/1', 11, 5, 7, 390, '2024-05-19', 'Material consumible', 0, 40, 3, 1),
	(62, 'INF/011/24/0', 9, 1, 3, 2200, '2024-06-03', 'Sistemas de almacenamiento', 1, 2, 3, 1),
	(63, 'INF/012/24/1', 8, 1, 3, 310, '2024-06-13', 'Material promocional', 0, 40, 3, 1),
	(64, 'ROB/011/24/0', 10, 2, 6, 2400, '2024-06-05', 'Sensores avanzados', 1, 3, 3, 0),
	(65, 'ROB/012/24/1', 9, 2, 6, 290, '2024-06-15', 'Material de laboratorio', 0, 20, 3, 0),
	(66, 'MEC/011/24/0', 8, 3, 4, 1850, '2024-06-08', 'Maquinaria especializada', 1, 1, 3, 1),
	(67, 'MEC/012/24/1', 11, 3, 4, 330, '2024-06-18', 'Material prácticas', 0, 25, 3, 1),
	(68, 'ELE/011/24/0', 12, 4, 5, 1700, '2024-06-04', 'Equipos medición', 1, 2, 3, 1),
	(69, 'ELE/012/24/1', 11, 4, 5, 270, '2024-06-14', 'Material fungible', 0, 30, 3, 1),
	(70, 'AUT/011/24/0', 10, 5, 7, 3100, '2024-06-06', 'Software simulación', 1, 1, 3, 1),
	(71, 'AUT/012/24/1', 12, 5, 7, 360, '2024-06-16', 'Material didáctico', 0, 15, 3, 0),
	(72, 'INF/013/24/0', 8, 1, 3, 1950, '2024-07-02', 'Servidores cloud', 1, 1, 3, 1),
	(73, 'INF/014/24/1', 9, 1, 3, 280, '2024-07-12', 'Material oficina', 0, 25, 3, 1),
	(74, 'ROB/013/24/0', 9, 2, 6, 2250, '2024-07-04', 'Componentes robóticos', 1, 4, 3, 1),
	(75, 'ROB/014/24/1', 10, 2, 6, 340, '2024-07-14', 'Material laboratorio', 0, 30, 3, 1),
	(76, 'MEC/013/24/0', 11, 3, 4, 2600, '2024-07-06', 'Software especializado', 1, 2, 3, 0),
	(77, 'MEC/014/24/1', 8, 3, 4, 310, '2024-07-16', 'Material didáctico', 0, 20, 3, 0),
	(78, 'ELE/013/24/0', 10, 4, 5, 1550, '2024-07-03', 'Equipamiento laboratorio', 1, 2, 3, 1),
	(79, 'ELE/014/24/1', 12, 4, 5, 290, '2024-07-13', 'Material consumible', 0, 35, 3, 0),
	(80, 'AUT/013/24/0', 12, 5, 7, 3400, '2024-07-08', 'Sistemas de diagnóstico', 1, 1, 3, 1),
	(81, 'AUT/014/24/1', 11, 5, 7, 380, '2024-07-18', 'Material formación', 0, 25, 3, 0),
	(82, 'INF/015/24/0', 9, 1, 3, 2300, '2024-08-05', 'Equipos multimedia', 1, 2, 3, 0),
	(83, 'INF/016/24/1', 8, 1, 3, 325, '2024-08-15', 'Material formación', 0, 20, 3, 0),
	(84, 'ROB/015/24/0', 10, 2, 6, 1800, '2024-08-07', 'Kit desarrollo robótico', 1, 1, 3, 1),
	(85, 'ROB/016/24/1', 9, 2, 6, 305, '2024-08-17', 'Material laboratorio', 0, 25, 3, 0),
	(86, 'MEC/015/24/0', 8, 3, 4, 2250, '2024-08-09', 'Herramientas precisión', 1, 3, 3, 1),
	(87, 'MEC/016/24/1', 11, 3, 4, 275, '2024-08-19', 'Material didáctico', 0, 35, 3, 0),
	(88, 'ELE/015/24/0', 12, 4, 5, 1350, '2024-08-06', 'Instrumental medición', 1, 2, 3, 0),
	(89, 'ELE/016/24/1', 10, 4, 5, 345, '2024-08-16', 'Material consumible', 0, 40, 3, 1),
	(90, 'AUT/015/24/0', 11, 5, 7, 2700, '2024-08-11', 'Equipos diagnóstico', 1, 1, 3, 1),
	(91, 'AUT/016/24/1', 12, 5, 7, 295, '2024-08-21', 'Material formación', 0, 30, 3, 0),
	(92, 'INF/017/24/0', 8, 1, 3, 1750, '2024-09-03', 'Equipos informáticos', 1, 2, 3, 1),
	(93, 'INF/018/24/1', 9, 1, 3, 315, '2024-09-13', 'Material promocional', 0, 30, 3, 1),
	(94, 'ROB/017/24/0', 9, 2, 6, 2100, '2024-09-05', 'Robots educativos', 1, 1, 3, 1),
	(95, 'ROB/018/24/1', 10, 2, 6, 285, '2024-09-15', 'Material laboratorio', 0, 20, 3, 1),
	(96, 'MEC/017/24/0', 11, 3, 4, 1950, '2024-09-08', 'Instrumental técnico', 1, 2, 3, 0),
	(97, 'MEC/018/24/1', 8, 3, 4, 335, '2024-09-18', 'Material prácticas', 0, 25, 3, 0),
	(98, 'ELE/017/24/0', 10, 4, 5, 1400, '2024-09-04', 'Equipos medición', 1, 3, 3, 0),
	(99, 'ELE/018/24/1', 12, 4, 5, 275, '2024-09-14', 'Material didáctico', 0, 15, 3, 1),
	(100, 'AUT/017/24/0', 12, 5, 7, 2850, '2024-09-09', 'Simuladores avanzados', 1, 1, 3, 0),
	(101, 'AUT/018/24/1', 11, 5, 7, 320, '2024-09-19', 'Material fungible', 0, 35, 3, 1),
	(102, 'INF/019/24/0', 9, 1, 3, 2050, '2024-10-02', 'Servidores departamentales', 1, 1, 3, 1),
	(103, 'INF/020/24/1', 8, 1, 3, 295, '2024-10-12', 'Material oficina', 0, 25, 3, 1),
	(104, 'ROB/019/24/0', 10, 2, 6, 1650, '2024-10-04', 'Componentes robóticos', 1, 2, 3, 1),
	(105, 'ROB/020/24/1', 9, 2, 6, 310, '2024-10-14', 'Material laboratorio', 0, 15, 3, 0),
	(106, 'MEC/019/24/0', 8, 3, 4, 2350, '2024-10-07', 'Herramientas especializadas', 1, 1, 3, 0),
	(107, 'MEC/020/24/1', 11, 3, 4, 280, '2024-10-17', 'Material didáctico', 0, 30, 3, 0),
	(108, 'ELE/019/24/0', 12, 4, 5, 1350, '2024-10-03', 'Instrumental medición', 1, 2, 3, 1),
	(109, 'ELE/020/24/1', 10, 4, 5, 330, '2024-10-13', 'Material fungible', 0, 25, 3, 0),
	(110, 'AUT/019/24/0', 11, 5, 7, 2600, '2024-10-09', 'Equipos diagnóstico', 1, 1, 3, 1),
	(111, 'AUT/020/24/1', 12, 5, 7, 340, '2024-10-19', 'Material formación', 0, 20, 3, 0),
	(112, 'INF/021/24/0', 8, 1, 3, 1850, '2024-11-04', 'Dispositivos de red', 1, 3, 3, 1),
	(113, 'INF/022/24/1', 9, 1, 3, 320, '2024-11-14', 'Material promocional', 0, 40, 3, 0),
	(114, 'ROB/021/24/0', 9, 2, 6, 2150, '2024-11-06', 'Sensores inteligentes', 1, 2, 3, 0),
	(115, 'ROB/022/24/1', 10, 2, 6, 270, '2024-11-16', 'Material laboratorio', 0, 15, 3, 0),
	(116, 'MEC/021/24/0', 11, 3, 4, 2050, '2024-11-08', 'Equipamiento técnico', 1, 1, 3, 1),
	(117, 'MEC/022/24/1', 8, 3, 4, 300, '2024-11-18', 'Material formación', 0, 25, 3, 1),
	(118, 'ELE/021/24/0', 10, 4, 5, 1250, '2024-11-05', 'Instrumental pruebas', 1, 2, 3, 1),
	(119, 'ELE/022/24/1', 12, 4, 5, 360, '2024-11-15', 'Material didáctico', 0, 30, 3, 1),
	(120, 'AUT/021/24/0', 12, 5, 7, 2950, '2024-11-11', 'Simuladores avanzados', 1, 1, 3, 0),
	(121, 'AUT/022/24/1', 11, 5, 7, 310, '2024-11-21', 'Material consumible', 0, 35, 3, 1),
	(122, 'INF/023/24/0', 9, 1, 3, 2500, '2024-12-02', 'Servidores de red', 1, 1, 3, 1),
	(123, 'INF/024/24/1', 8, 1, 3, 290, '2024-12-12', 'Material oficina', 0, 30, 3, 0),
	(124, 'ROB/023/24/0', 10, 2, 6, 1900, '2024-12-04', 'Componentes especializados', 1, 3, 3, 0),
	(125, 'ROB/024/24/1', 9, 2, 6, 350, '2024-12-14', 'Material laboratorio', 0, 20, 3, 1),
	(126, 'MEC/023/24/0', 8, 3, 4, 2200, '2024-12-07', 'Equipamiento taller', 1, 2, 3, 0),
	(127, 'MEC/024/24/1', 11, 3, 4, 320, '2024-12-17', 'Material fungible', 0, 40, 3, 0),
	(128, 'ELE/023/24/0', 12, 4, 5, 1600, '2024-12-03', 'Instrumental medición', 1, 2, 3, 0),
	(129, 'ELE/024/24/1', 10, 4, 5, 280, '2024-12-13', 'Material didáctico', 0, 25, 3, 0),
	(130, 'AUT/023/24/0', 11, 5, 7, 3100, '2024-12-09', 'Equipos diagnóstico', 1, 1, 3, 0),
	(131, 'AUT/024/24/1', 12, 5, 7, 370, '2024-12-19', 'Material formación', 0, 30, 3, 1);

-- Volcando estructura para tabla Proyecto_Intermodular_SIGED.Orden_Compra
CREATE TABLE IF NOT EXISTS `Orden_Compra` (
  `idOrden` int NOT NULL,
  `id_PresupuestoFK` int NOT NULL,
  PRIMARY KEY (`idOrden`),
  KEY `id_PresupuestoFK` (`id_PresupuestoFK`),
  CONSTRAINT `orden_compra_ibfk_1` FOREIGN KEY (`idOrden`) REFERENCES `Orden` (`idOrden`),
  CONSTRAINT `orden_compra_ibfk_2` FOREIGN KEY (`id_PresupuestoFK`) REFERENCES `Bolsa_Presupuesto` (`idBolsa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla Proyecto_Intermodular_SIGED.Orden_Compra: ~61 rows (aproximadamente)
DELETE FROM `Orden_Compra`;
INSERT INTO `Orden_Compra` (`idOrden`, `id_PresupuestoFK`) VALUES
	(3, 1),
	(13, 1),
	(33, 1),
	(43, 1),
	(53, 1),
	(63, 1),
	(73, 1),
	(83, 1),
	(93, 1),
	(103, 1),
	(113, 1),
	(123, 1),
	(5, 2),
	(15, 2),
	(35, 2),
	(45, 2),
	(55, 2),
	(65, 2),
	(75, 2),
	(85, 2),
	(95, 2),
	(105, 2),
	(115, 2),
	(125, 2),
	(6, 3),
	(17, 3),
	(37, 3),
	(47, 3),
	(57, 3),
	(67, 3),
	(77, 3),
	(87, 3),
	(97, 3),
	(107, 3),
	(117, 3),
	(127, 3),
	(8, 4),
	(19, 4),
	(39, 4),
	(49, 4),
	(59, 4),
	(69, 4),
	(79, 4),
	(89, 4),
	(99, 4),
	(109, 4),
	(119, 4),
	(129, 4),
	(11, 5),
	(21, 5),
	(31, 5),
	(41, 5),
	(51, 5),
	(61, 5),
	(71, 5),
	(81, 5),
	(91, 5),
	(101, 5),
	(111, 5),
	(121, 5),
	(131, 5);

-- Volcando estructura para tabla Proyecto_Intermodular_SIGED.Orden_Inversion
CREATE TABLE IF NOT EXISTS `Orden_Inversion` (
  `idOrden` int NOT NULL,
  `id_InversionFK` int NOT NULL,
  `Num_inversion` int NOT NULL,
  PRIMARY KEY (`idOrden`),
  KEY `id_InversionFK` (`id_InversionFK`),
  CONSTRAINT `orden_inversion_ibfk_1` FOREIGN KEY (`idOrden`) REFERENCES `Orden` (`idOrden`),
  CONSTRAINT `orden_inversion_ibfk_2` FOREIGN KEY (`id_InversionFK`) REFERENCES `Bolsa_Inversion` (`idBolsa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla Proyecto_Intermodular_SIGED.Orden_Inversion: ~66 rows (aproximadamente)
DELETE FROM `Orden_Inversion`;
INSERT INTO `Orden_Inversion` (`idOrden`, `id_InversionFK`, `Num_inversion`) VALUES
	(1, 1, 1000001),
	(2, 1, 1000002),
	(4, 2, 2000001),
	(7, 3, 3000001),
	(9, 4, 4000001),
	(10, 5, 5000001),
	(12, 1, 1000003),
	(14, 2, 2000002),
	(16, 3, 3000002),
	(18, 4, 4000002),
	(20, 5, 5000002),
	(22, 1, 1000004),
	(24, 4, 4000003),
	(26, 2, 2000003),
	(28, 3, 3000003),
	(30, 5, 5000003),
	(32, 1, 1000005),
	(34, 2, 2000004),
	(36, 3, 3000004),
	(38, 4, 4000004),
	(40, 5, 5000004),
	(42, 1, 1000006),
	(44, 2, 2000005),
	(46, 3, 3000005),
	(48, 4, 4000005),
	(50, 5, 5000005),
	(52, 1, 1000007),
	(54, 2, 2000006),
	(56, 3, 3000006),
	(58, 4, 4000006),
	(60, 5, 5000006),
	(62, 1, 1000008),
	(64, 2, 2000007),
	(66, 3, 3000007),
	(68, 4, 4000007),
	(70, 5, 5000007),
	(72, 1, 1000009),
	(74, 2, 2000008),
	(76, 3, 3000008),
	(78, 4, 4000008),
	(80, 5, 5000008),
	(82, 1, 1000010),
	(84, 2, 2000009),
	(86, 3, 3000009),
	(88, 4, 4000009),
	(90, 5, 5000009),
	(92, 1, 1000011),
	(94, 2, 2000010),
	(96, 3, 3000010),
	(98, 4, 4000010),
	(100, 5, 5000010),
	(102, 1, 1000012),
	(104, 2, 2000011),
	(106, 3, 3000011),
	(108, 4, 4000011),
	(110, 5, 5000011),
	(112, 1, 1000013),
	(114, 2, 2000012),
	(116, 3, 3000012),
	(118, 4, 4000012),
	(120, 5, 5000012),
	(122, 1, 1000014),
	(124, 2, 2000013),
	(126, 3, 3000013),
	(128, 4, 4000013),
	(130, 5, 5000013);

-- Volcando estructura para tabla Proyecto_Intermodular_SIGED.Permiso
CREATE TABLE IF NOT EXISTS `Permiso` (
  `idPermiso` int NOT NULL AUTO_INCREMENT,
  `id_UsuarioFK` int NOT NULL,
  `id_DepFK` int NOT NULL,
  `Puede_editar` tinyint(1) DEFAULT '0',
  `Puede_ver` tinyint(1) DEFAULT '0',
  `Fecha_asignacion` date NOT NULL,
  PRIMARY KEY (`idPermiso`),
  KEY `id_UsuarioFK` (`id_UsuarioFK`),
  KEY `id_DepFK` (`id_DepFK`),
  CONSTRAINT `permiso_ibfk_1` FOREIGN KEY (`id_UsuarioFK`) REFERENCES `Usuario` (`idUsuario`),
  CONSTRAINT `permiso_ibfk_2` FOREIGN KEY (`id_DepFK`) REFERENCES `Departamento` (`id_Departamento`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla Proyecto_Intermodular_SIGED.Permiso: ~15 rows (aproximadamente)
DELETE FROM `Permiso`;
INSERT INTO `Permiso` (`idPermiso`, `id_UsuarioFK`, `id_DepFK`, `Puede_editar`, `Puede_ver`, `Fecha_asignacion`) VALUES
	(1, 1, 1, 1, 1, '2025-01-01'),
	(2, 1, 2, 1, 1, '2025-01-01'),
	(3, 1, 3, 1, 1, '2025-01-01'),
	(4, 1, 4, 1, 1, '2025-01-01'),
	(5, 1, 5, 1, 1, '2025-01-01'),
	(6, 2, 1, 1, 1, '2025-01-02'),
	(7, 2, 2, 1, 1, '2025-01-02'),
	(8, 2, 3, 1, 1, '2025-01-02'),
	(9, 2, 4, 1, 1, '2025-01-02'),
	(10, 2, 5, 1, 1, '2025-01-02'),
	(11, 3, 1, 1, 1, '2025-01-03'),
	(12, 4, 2, 1, 1, '2025-01-03'),
	(13, 5, 3, 1, 1, '2025-01-03'),
	(14, 6, 4, 1, 1, '2025-01-03'),
	(15, 7, 5, 1, 1, '2025-01-03');

-- Volcando estructura para tabla Proyecto_Intermodular_SIGED.Proveedor
CREATE TABLE IF NOT EXISTS `Proveedor` (
  `idProveedor` int NOT NULL AUTO_INCREMENT,
  `NIF` varchar(9) NOT NULL,
  `Nombre` varchar(50) NOT NULL,
  `Direccion` varchar(150) NOT NULL,
  `Telefono` int NOT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `Fecha_alta` date NOT NULL,
  PRIMARY KEY (`idProveedor`),
  UNIQUE KEY `NIF` (`NIF`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla Proyecto_Intermodular_SIGED.Proveedor: ~12 rows (aproximadamente)
DELETE FROM `Proveedor`;
INSERT INTO `Proveedor` (`idProveedor`, `NIF`, `Nombre`, `Direccion`, `Telefono`, `Email`, `Fecha_alta`) VALUES
	(1, 'A12345678', 'Amazon Business', 'Calle Comercio 1, Madrid', 911111111, 'business@amazon.es', '2024-01-15'),
	(2, 'B23456789', 'Office Depot', 'Calle Oficina 2, Barcelona', 922222222, 'ventas@officedepot.es', '2024-01-20'),
	(3, 'C34567890', 'Tech Solutions', 'Calle Tecnología 3, Valencia', 933333333, 'info@techsolutions.es', '2024-02-05'),
	(4, 'D45678901', 'Marketing Pro', 'Calle Publicidad 4, Sevilla', 944444444, 'contacto@marketingpro.es', '2024-02-10'),
	(5, 'E56789012', 'HR Services', 'Calle Recursos 5, Bilbao', 955555555, 'info@hrservices.es', '2024-02-15'),
	(6, 'F67890123', 'Conta Express', 'Calle Finanzas 6, Zaragoza', 966666666, 'info@contaexpress.es', '2024-02-20'),
	(7, 'G78901234', 'Logística Total', 'Calle Operaciones 7, Málaga', 977777777, 'info@logisticatotal.es', '2024-02-25'),
	(8, 'H89012345', 'Suministros Técnicos', 'Avda. Innovación 12, Zaragoza', 976123456, 'info@suministrostecnicos.es', '2024-12-01'),
	(9, 'I90123456', 'Equipos Informáticos Pro', 'Calle Digital 23, Madrid', 912345678, 'ventas@equiposinformaticospro.es', '2024-12-10'),
	(10, 'J01234567', 'Material Educativo SL', 'Paseo Formación 45, Barcelona', 934567890, 'contacto@materialeducativo.es', '2024-12-15'),
	(11, 'K12345678', 'Impresión Integral', 'Calle Tinta 8, Valencia', 963456789, 'info@impresionintegral.es', '2024-12-20'),
	(12, 'L23456789', 'Mobiliario Técnico', 'Avda. Confort 34, Sevilla', 954567890, 'ventas@mobiliariotech.es', '2024-12-25');

-- Volcando estructura para tabla Proyecto_Intermodular_SIGED.Proveedor_Departamento
CREATE TABLE IF NOT EXISTS `Proveedor_Departamento` (
  `idProvDep` int NOT NULL AUTO_INCREMENT,
  `idProveedorFK` int NOT NULL,
  `idDepartamentoFK` int NOT NULL,
  `Propio` tinyint(1) DEFAULT '1',
  `Fecha_vinculacion` date NOT NULL,
  PRIMARY KEY (`idProvDep`),
  KEY `idProveedorFK` (`idProveedorFK`),
  KEY `idDepartamentoFK` (`idDepartamentoFK`),
  CONSTRAINT `proveedor_departamento_ibfk_1` FOREIGN KEY (`idProveedorFK`) REFERENCES `Proveedor` (`idProveedor`),
  CONSTRAINT `proveedor_departamento_ibfk_2` FOREIGN KEY (`idDepartamentoFK`) REFERENCES `Departamento` (`id_Departamento`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla Proyecto_Intermodular_SIGED.Proveedor_Departamento: ~20 rows (aproximadamente)
DELETE FROM `Proveedor_Departamento`;
INSERT INTO `Proveedor_Departamento` (`idProvDep`, `idProveedorFK`, `idDepartamentoFK`, `Propio`, `Fecha_vinculacion`) VALUES
	(1, 1, 1, 1, '2024-01-15'),
	(2, 1, 2, 0, '2024-01-16'),
	(3, 1, 3, 0, '2024-01-17'),
	(4, 2, 1, 1, '2024-01-20'),
	(5, 2, 4, 0, '2024-01-21'),
	(6, 3, 1, 1, '2024-02-05'),
	(7, 4, 2, 1, '2024-02-10'),
	(8, 5, 3, 1, '2024-02-15'),
	(9, 6, 4, 1, '2024-02-20'),
	(10, 7, 5, 1, '2024-02-25'),
	(11, 8, 1, 1, '2024-01-05'),
	(12, 8, 3, 0, '2024-01-06'),
	(13, 9, 1, 1, '2024-01-10'),
	(14, 9, 2, 0, '2024-01-11'),
	(15, 10, 2, 1, '2024-01-15'),
	(16, 10, 5, 0, '2024-01-16'),
	(17, 11, 3, 1, '2024-01-20'),
	(18, 11, 4, 0, '2024-01-21'),
	(19, 12, 4, 1, '2024-01-25'),
	(20, 12, 5, 0, '2024-01-26');

-- Volcando estructura para tabla Proyecto_Intermodular_SIGED.Rol
CREATE TABLE IF NOT EXISTS `Rol` (
  `idRol` int NOT NULL AUTO_INCREMENT,
  `Tipo` varchar(50) NOT NULL,
  PRIMARY KEY (`idRol`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla Proyecto_Intermodular_SIGED.Rol: ~3 rows (aproximadamente)
DELETE FROM `Rol`;
INSERT INTO `Rol` (`idRol`, `Tipo`) VALUES
	(1, 'Administrador'),
	(2, 'Contable'),
	(3, 'Jefe de Departamento');

-- Volcando estructura para tabla Proyecto_Intermodular_SIGED.Usuario
CREATE TABLE IF NOT EXISTS `Usuario` (
  `idUsuario` int NOT NULL AUTO_INCREMENT,
  `DNI` varchar(9) NOT NULL,
  `Nombre` varchar(50) NOT NULL,
  `Apellidos` varchar(50) NOT NULL,
  `Telefono` int DEFAULT NULL,
  `Direccion` varchar(150) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `id_RolFK` int DEFAULT NULL,
  PRIMARY KEY (`idUsuario`),
  UNIQUE KEY `DNI` (`DNI`),
  KEY `id_RolFK` (`id_RolFK`),
  CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`id_RolFK`) REFERENCES `Rol` (`idRol`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla Proyecto_Intermodular_SIGED.Usuario: ~7 rows (aproximadamente)
DELETE FROM `Usuario`;
INSERT INTO `Usuario` (`idUsuario`, `DNI`, `Nombre`, `Apellidos`, `Telefono`, `Direccion`, `Email`, `id_RolFK`) VALUES
	(1, '12345678A', 'Admin', 'Admin', 611111111, 'Calle Admin 1, Madrid', 'cristina.csevi@gmail.com', 1),
	(2, '23456789B', 'Contable', 'Contable', 622222222, 'Calle Contable 2, Barcelona', 'csv.2426@gmail.com', 2),
	(3, '34567890C', 'Manuel', 'Pérez', 633333333, 'Calle Jefe 3, Valencia', 'manuel.perez@gmail.com', 3),
	(4, '45678901D', 'Mario', 'Bueno', 644444444, 'Calle Jefe 4, Sevilla', 'mario.bueno@gmail.com', 3),
	(5, '56789012E', 'Viviana', 'Martínez', 655555555, 'Calle Jefe 5, Bilbao', 'viviana.martinez@gmail.com', 3),
	(6, '67890123F', 'Cristina', 'Serrano Vicente', 666666666, 'Calle Jefe 6, Zaragoza', 'a29679@svalero.com', 3),
	(7, '78901234G', 'Juan', 'Pérez', 677777777, 'Calle Jefe 7, Málaga', 'juan.perez@gmail.com', 3);
    
SET FOREIGN_KEY_CHECKS = 1;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;

-- =========================
-- Tabla Usuario
-- =========================
CREATE TABLE IF NOT EXISTS Usuario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  correo VARCHAR(255) NOT NULL UNIQUE,
  pass VARCHAR(255) NOT NULL,
  rol ENUM('user','admin') NOT NULL DEFAULT 'user'
) ENGINE=InnoDB;

-- =========================
-- Tabla Configuracion
-- =========================
CREATE TABLE IF NOT EXISTS Configuracion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  clave VARCHAR(100) NOT NULL UNIQUE,
  valor VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

INSERT IGNORE INTO Configuracion (clave, valor) VALUES ('tasa_dolar', '0.0000');

-- =========================
-- Tabla TipoMovimiento
-- =========================
CREATE TABLE IF NOT EXISTS TipoMovimiento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  movimiento VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

INSERT IGNORE INTO TipoMovimiento (movimiento) VALUES ('Ingreso'), ('Gasto');

-- =========================
-- Tabla Metodo
-- =========================
CREATE TABLE IF NOT EXISTS Metodo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  metodo_pago VARCHAR(100) NOT NULL,
  es_efectivo BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_metodo_usuario FOREIGN KEY (usuario_id) REFERENCES Usuario(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- Tabla Mes
-- =========================
CREATE TABLE IF NOT EXISTS Mes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  porcentajeGastos DECIMAL(5,2) NOT NULL,
  porcentajeGustos DECIMAL(5,2) NOT NULL,
  porcentajeAhorros DECIMAL(5,2) NOT NULL,
  periodicidad ENUM('semanal','quincenal','mensual') NOT NULL DEFAULT 'mensual',
  CONSTRAINT fk_mes_usuario FOREIGN KEY (usuario_id) REFERENCES Usuario(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- Tabla Periodo
-- =========================
CREATE TABLE IF NOT EXISTS Periodo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mes_id INT NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  efectivo_inicial DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  CONSTRAINT fk_periodo_mes FOREIGN KEY (mes_id) REFERENCES Mes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- Tabla TransaccionEfectivo
-- =========================
CREATE TABLE IF NOT EXISTS TransaccionEfectivo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  periodo_id INT NOT NULL,
  tipo ENUM('deposito','retiro') NOT NULL,
  monto DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  descripcion VARCHAR(255) DEFAULT NULL,
  fecha DATE DEFAULT NULL,
  CONSTRAINT fk_te_periodo FOREIGN KEY (periodo_id) REFERENCES Periodo(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- Tabla Movimiento
-- =========================
CREATE TABLE IF NOT EXISTS Movimiento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipoMovimiento_id INT NOT NULL,
  periodo_id INT NOT NULL,
  metodo_id INT DEFAULT NULL,
  descripcion VARCHAR(255),
  isFijo BOOLEAN NOT NULL DEFAULT FALSE,
  monto_usd DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  monto_rd DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  fecha_pago DATE DEFAULT NULL,
  pagado BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_movimiento_tipomovimiento FOREIGN KEY (tipoMovimiento_id) REFERENCES TipoMovimiento(id),
  CONSTRAINT fk_movimiento_periodo FOREIGN KEY (periodo_id) REFERENCES Periodo(id) ON DELETE CASCADE,
  CONSTRAINT fk_movimiento_metodo FOREIGN KEY (metodo_id) REFERENCES Metodo(id)
) ENGINE=InnoDB;

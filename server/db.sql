use presupuesto_mensual;

-- =========================
-- Tabla Usuario
-- =========================
CREATE TABLE Usuario (
                         id INT AUTO_INCREMENT PRIMARY KEY,
                         nombre VARCHAR(255) NOT NULL,
                         correo VARCHAR(255) NOT NULL UNIQUE,
                         pass VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

-- =========================
-- Tabla TipoMovimiento
-- =========================
CREATE TABLE TipoMovimiento (
                                id INT AUTO_INCREMENT PRIMARY KEY,
                                movimiento VARCHAR(100) NOT NULL,
                                CONSTRAINT uq_tipomovimiento_movimiento UNIQUE (movimiento)
) ENGINE=InnoDB;

-- =========================
-- Tabla Metodo
-- =========================
CREATE TABLE Metodo (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        usuario_id INT NOT NULL,
                        metodo_pago VARCHAR(100) NOT NULL,
                        CONSTRAINT fk_metodo_usuario
                            FOREIGN KEY (usuario_id) REFERENCES Usuario(id)
                                ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- Tabla Mes
-- =========================
CREATE TABLE Mes (
                     id INT AUTO_INCREMENT PRIMARY KEY,
                     usuario_id INT NOT NULL,
                     porcentajeGastos DECIMAL(5,2) NOT NULL,
                     porcentajeGustos DECIMAL(5,2) NOT NULL,
                     porcentajeAhorros DECIMAL(5,2) NOT NULL,
                     CONSTRAINT fk_mes_usuario
                         FOREIGN KEY (usuario_id) REFERENCES Usuario(id)
                             ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- Tabla Periodo
-- =========================
CREATE TABLE Periodo (
                         id INT AUTO_INCREMENT PRIMARY KEY,
                         mes_id INT NOT NULL,
                         tasa_dolar DECIMAL(10,4) NOT NULL,
                         fecha_inicio DATE NOT NULL,
                         fecha_fin DATE NOT NULL,
                         CONSTRAINT fk_periodo_mes
                             FOREIGN KEY (mes_id) REFERENCES Mes(id)
                                 ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- Tabla Movimiento
-- =========================
CREATE TABLE Movimiento (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            TipoMovimiento_id INT NOT NULL,
                            Periodo_id INT NOT NULL,
                            Metodo_id INT NOT NULL,
                            descripcion VARCHAR(255),
                            isFijo BOOLEAN NOT NULL,
                            cantidad DECIMAL(12,2) NOT NULL,
                            dolar BOOLEAN NOT NULL,
                            CONSTRAINT fk_movimiento_tipomovimiento
                                FOREIGN KEY (TipoMovimiento_id) REFERENCES TipoMovimiento(id),
                            CONSTRAINT fk_movimiento_periodo
                                FOREIGN KEY (Periodo_id) REFERENCES Periodo(id)
                                    ON DELETE CASCADE,
                            CONSTRAINT fk_movimiento_metodo
                                FOREIGN KEY (Metodo_id) REFERENCES Metodo(id)
) ENGINE=InnoDB;

INSERT INTO TipoMovimiento (movimiento)
VALUES
    ('Ingreso'),
    ('Gasto');


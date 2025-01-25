use presupuesto_mensual;

-- Habilitar la verificación de claves foráneas
SET FOREIGN_KEY_CHECKS = 0;

-- Crear tabla Usuario
CREATE TABLE Usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    pass VARCHAR(255) NOT NULL
) ENGINE=InnoDB COMMENT='Usuarios registrados en el sistema';

-- Crear tabla Mes
CREATE TABLE Mes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    porcentajeGastos FLOAT NOT NULL,
    porcentajeGustos FLOAT NOT NULL,
    porcentajeAhorros FLOAT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES Usuario(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Configuración de presupuesto mensual para un usuario';

-- Crear tabla Quincena
CREATE TABLE Quincena (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mes_id INT NOT NULL,
    tasa_dolar FLOAT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    FOREIGN KEY (mes_id) REFERENCES Mes(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Información sobre cada quincena en un mes específico';

-- Crear tabla Movimiento
CREATE TABLE Movimiento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(255) NOT NULL,
    cantidad FLOAT NOT NULL,
    dolar BOOLEAN NOT NULL
) ENGINE=InnoDB COMMENT='Registra ingresos o gastos asociados a un usuario';

-- Crear tabla Metodo
CREATE TABLE Metodo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    metodo_pago VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB COMMENT='Métodos de pago utilizados en los gastos';

-- Crear tabla Gasto
CREATE TABLE Gasto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    movimiento_id INT NOT NULL,
    metodo_id INT NOT NULL,
    quincena_id INT NOT NULL,
    pagado BOOLEAN NOT NULL,
    FOREIGN KEY (movimiento_id) REFERENCES Movimiento(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (metodo_id) REFERENCES Metodo(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (quincena_id) REFERENCES Quincena(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Gastos realizados, asociados a un movimiento y una quincena';

-- Crear tabla Ingreso
CREATE TABLE Ingreso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    movimiento_id INT NOT NULL,
    quincena_id INT NOT NULL,
    fijo BOOLEAN NOT NULL,
    FOREIGN KEY (movimiento_id) REFERENCES Movimiento(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (quincena_id) REFERENCES Quincena(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Ingresos registrados asociados a un movimiento y una quincena';

-- Habilitar la verificación de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- Migración: hacer metodo_id opcional en Movimiento
-- Permite registrar Ingresos sin seleccionar un método de pago
-- Ejecutar: mysql -u <usuario> -p presupuesto_mensual < migracion_metodo_opcional.sql

USE presupuesto_mensual;

ALTER TABLE Movimiento MODIFY COLUMN metodo_id INT DEFAULT NULL;

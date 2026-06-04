/*
  Promacson — creación de base de datos.

  Ejecutar conectado a master (o cualquier BD distinta de promacson).
  Ejemplo (sqlcmd):
    sqlcmd -S localhost -U sa -P "<password>" -i docs/sql/001-create-database.sql
*/

IF NOT EXISTS (SELECT 1 FROM sys.databases WHERE name = N'promacson')
BEGIN
  CREATE DATABASE promacson;
  PRINT 'Base de datos promacson creada.';
END
ELSE
BEGIN
  PRINT 'Base de datos promacson ya existe.';
END
GO

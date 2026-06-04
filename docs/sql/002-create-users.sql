/*
  Promacson — tabla users (entidad User en src/entities/user.entity.ts).

  Ejecutar después de 001-create-database.sql, con USE promacson o -d promacson.
  Idempotente: no modifica la tabla si ya existe.
*/

USE promacson;
GO

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = N'users' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
  CREATE TABLE dbo.users (
    id             UNIQUEIDENTIFIER NOT NULL
                     CONSTRAINT DF_users_id DEFAULT NEWSEQUENTIALID(),
    email          VARCHAR(255)     NOT NULL,
    password_hash  VARCHAR(255)     NOT NULL,
    role           VARCHAR(50)      NOT NULL
                     CONSTRAINT DF_users_role DEFAULT N'admin',
    created_at     DATETIME2        NOT NULL
                     CONSTRAINT DF_users_created_at DEFAULT GETDATE(),
    updated_at     DATETIME2        NOT NULL
                     CONSTRAINT DF_users_updated_at DEFAULT GETDATE(),

    CONSTRAINT PK_users PRIMARY KEY (id),
    CONSTRAINT UQ_users_email UNIQUE (email)
  );

  PRINT 'Tabla dbo.users creada.';
END
ELSE
BEGIN
  PRINT 'Tabla dbo.users ya existe.';
END
GO

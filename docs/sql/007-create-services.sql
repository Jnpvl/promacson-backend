USE promacson;
GO

IF OBJECT_ID(N'dbo.services', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.services (
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_services_id DEFAULT NEWSEQUENTIALID(),
    slug VARCHAR(120) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(500) NULL,
    body VARCHAR(4000) NULL,
    image_url VARCHAR(500) NULL,
    external_href VARCHAR(500) NULL,
    sort_order INT NOT NULL CONSTRAINT DF_services_sort_order DEFAULT 0,
    is_active BIT NOT NULL CONSTRAINT DF_services_is_active DEFAULT 1,
    meta_title VARCHAR(255) NULL,
    meta_description VARCHAR(500) NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_services_created_at DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL CONSTRAINT DF_services_updated_at DEFAULT GETDATE(),
    CONSTRAINT PK_services PRIMARY KEY (id),
    CONSTRAINT UQ_services_slug UNIQUE (slug)
  );
END
GO

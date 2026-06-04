USE promacson;
GO

IF OBJECT_ID(N'dbo.categories', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.categories (
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_categories_id DEFAULT NEWSEQUENTIALID(),
    slug VARCHAR(120) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500) NULL,
    image_url VARCHAR(500) NULL,
    sort_order INT NOT NULL CONSTRAINT DF_categories_sort_order DEFAULT 0,
    is_active BIT NOT NULL CONSTRAINT DF_categories_is_active DEFAULT 1,
    meta_title VARCHAR(255) NULL,
    meta_description VARCHAR(500) NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_categories_created_at DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL CONSTRAINT DF_categories_updated_at DEFAULT GETDATE(),
    CONSTRAINT PK_categories PRIMARY KEY (id),
    CONSTRAINT UQ_categories_slug UNIQUE (slug)
  );
END
GO

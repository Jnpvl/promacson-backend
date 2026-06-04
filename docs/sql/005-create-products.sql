USE promacson;
GO

IF OBJECT_ID(N'dbo.products', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.products (
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_products_id DEFAULT NEWSEQUENTIALID(),
    slug VARCHAR(120) NOT NULL,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(80) NULL,
    description VARCHAR(2000) NULL,
    sale_mode VARCHAR(20) NOT NULL CONSTRAINT DF_products_sale_mode DEFAULT 'BOTH',
    category_id UNIQUEIDENTIFIER NOT NULL,
    is_active BIT NOT NULL CONSTRAINT DF_products_is_active DEFAULT 1,
    is_featured BIT NOT NULL CONSTRAINT DF_products_is_featured DEFAULT 0,
    meta_title VARCHAR(255) NULL,
    meta_description VARCHAR(500) NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_products_created_at DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL CONSTRAINT DF_products_updated_at DEFAULT GETDATE(),
    CONSTRAINT PK_products PRIMARY KEY (id),
    CONSTRAINT UQ_products_slug UNIQUE (slug),
    CONSTRAINT FK_products_category FOREIGN KEY (category_id) REFERENCES dbo.categories(id)
  );

  CREATE UNIQUE INDEX UQ_products_sku ON dbo.products(sku) WHERE sku IS NOT NULL;
END
GO

IF OBJECT_ID(N'dbo.product_images', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.product_images (
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_product_images_id DEFAULT NEWSEQUENTIALID(),
    product_id UNIQUEIDENTIFIER NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    sort_order INT NOT NULL CONSTRAINT DF_product_images_sort_order DEFAULT 0,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_product_images_created_at DEFAULT GETDATE(),
    CONSTRAINT PK_product_images PRIMARY KEY (id),
    CONSTRAINT FK_product_images_product FOREIGN KEY (product_id) REFERENCES dbo.products(id) ON DELETE CASCADE
  );
END
GO

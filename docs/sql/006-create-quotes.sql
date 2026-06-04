USE promacson;
GO

IF OBJECT_ID(N'dbo.quotes', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.quotes (
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_quotes_id DEFAULT NEWSEQUENTIALID(),
    folio VARCHAR(30) NULL,
    status VARCHAR(20) NOT NULL CONSTRAINT DF_quotes_status DEFAULT 'NEW',
    customer_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NULL,
    phone VARCHAR(40) NULL,
    submitted_at DATETIME2 NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_quotes_created_at DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL CONSTRAINT DF_quotes_updated_at DEFAULT GETDATE(),
    CONSTRAINT PK_quotes PRIMARY KEY (id)
  );
END
GO

IF OBJECT_ID(N'dbo.quote_lines', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.quote_lines (
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_quote_lines_id DEFAULT NEWSEQUENTIALID(),
    quote_id UNIQUEIDENTIFIER NOT NULL,
    product_id UNIQUEIDENTIFIER NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_slug VARCHAR(120) NOT NULL,
    sale_mode_label VARCHAR(40) NOT NULL,
    quantity INT NOT NULL CONSTRAINT DF_quote_lines_quantity DEFAULT 1,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_quote_lines_created_at DEFAULT GETDATE(),
    CONSTRAINT PK_quote_lines PRIMARY KEY (id),
    CONSTRAINT FK_quote_lines_quote FOREIGN KEY (quote_id) REFERENCES dbo.quotes(id) ON DELETE CASCADE,
    CONSTRAINT FK_quote_lines_product FOREIGN KEY (product_id) REFERENCES dbo.products(id)
  );
END
GO

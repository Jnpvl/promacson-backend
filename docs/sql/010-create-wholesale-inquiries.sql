USE promacson;
GO

IF OBJECT_ID(N'dbo.wholesale_inquiries', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.wholesale_inquiries (
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_wholesale_inquiries_id DEFAULT NEWSEQUENTIALID(),
    folio VARCHAR(30) NULL,
    status VARCHAR(20) NOT NULL CONSTRAINT DF_wholesale_inquiries_status DEFAULT 'NEW',
    client_type VARCHAR(40) NOT NULL,
    client_type_other VARCHAR(120) NULL,
    institution VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NULL,
    phone VARCHAR(40) NULL,
    volume VARCHAR(255) NULL,
    interest VARCHAR(500) NULL,
    message NVARCHAR(MAX) NULL,
    submitted_at DATETIME2 NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_wholesale_inquiries_created_at DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL CONSTRAINT DF_wholesale_inquiries_updated_at DEFAULT GETDATE(),
    CONSTRAINT PK_wholesale_inquiries PRIMARY KEY (id)
  );
END
GO

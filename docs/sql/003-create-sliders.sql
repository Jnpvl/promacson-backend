USE promacson;
GO

IF OBJECT_ID(N'dbo.sliders', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.sliders (
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_sliders_id DEFAULT NEWSEQUENTIALID(),
    sort_order INT NOT NULL CONSTRAINT DF_sliders_sort_order DEFAULT 0,
    is_active BIT NOT NULL CONSTRAINT DF_sliders_is_active DEFAULT 1,
    eyebrow VARCHAR(120) NULL,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(500) NULL,
    image_url VARCHAR(500) NOT NULL,
    has_primary_cta BIT NOT NULL CONSTRAINT DF_sliders_has_primary_cta DEFAULT 0,
    primary_cta_label VARCHAR(120) NULL,
    primary_cta_href VARCHAR(255) NULL,
    has_secondary_cta BIT NOT NULL CONSTRAINT DF_sliders_has_secondary_cta DEFAULT 0,
    secondary_cta_label VARCHAR(120) NULL,
    secondary_cta_href VARCHAR(255) NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_sliders_created_at DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL CONSTRAINT DF_sliders_updated_at DEFAULT GETDATE(),
    CONSTRAINT PK_sliders PRIMARY KEY (id)
  );
END
GO

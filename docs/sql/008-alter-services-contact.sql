USE promacson;
GO

IF COL_LENGTH('dbo.services', 'contact_type') IS NULL
BEGIN
  ALTER TABLE dbo.services ADD contact_type VARCHAR(20) NULL;
END
GO

IF COL_LENGTH('dbo.services', 'contact_value') IS NULL
BEGIN
  ALTER TABLE dbo.services ADD contact_value VARCHAR(255) NULL;
END
GO

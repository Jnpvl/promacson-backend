IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'site_settings')
BEGIN
  CREATE TABLE site_settings (
    id VARCHAR(20) NOT NULL PRIMARY KEY DEFAULT 'default',
    phone NVARCHAR(40) NOT NULL,
    phone_e164 NVARCHAR(20) NOT NULL,
    email NVARCHAR(255) NOT NULL,
    whatsapp NVARCHAR(20) NOT NULL,
    address NVARCHAR(500) NULL,
    business_hours NVARCHAR(255) NULL,
    facebook_url NVARCHAR(500) NULL,
    updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
  );

  INSERT INTO site_settings (id, phone, phone_e164, email, whatsapp, address)
  VALUES (
    'default',
    N'662 450 1230',
    N'+526624501230',
    N'ventas@promacson.mx',
    N'526624501230',
    N'C. Benito Juárez 177, Constitución, 83150 Hermosillo, Son.'
  );
END;

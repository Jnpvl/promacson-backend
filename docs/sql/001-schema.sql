-- Promacson — esquema PostgreSQL
-- Ejecutar contra la base `promacson` (todo el archivo).

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- sliders
CREATE TABLE IF NOT EXISTS sliders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  eyebrow VARCHAR(120),
  title VARCHAR(255) NOT NULL,
  description VARCHAR(500),
  image_url VARCHAR(500) NOT NULL,
  has_primary_cta BOOLEAN NOT NULL DEFAULT FALSE,
  primary_cta_label VARCHAR(120),
  primary_cta_href VARCHAR(255),
  has_secondary_cta BOOLEAN NOT NULL DEFAULT FALSE,
  secondary_cta_label VARCHAR(120),
  secondary_cta_href VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(120) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(500),
  image_url VARCHAR(500),
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  meta_title VARCHAR(255),
  meta_description VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(120) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(80),
  description VARCHAR(2000),
  sale_mode VARCHAR(20) NOT NULL DEFAULT 'BOTH',
  category_id UUID NOT NULL REFERENCES categories(id),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  meta_title VARCHAR(255),
  meta_description VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_products_sku ON products(sku) WHERE sku IS NOT NULL;

-- product_images
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- services
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(120) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(500),
  body VARCHAR(4000),
  image_url VARCHAR(500),
  external_href VARCHAR(500),
  contact_type VARCHAR(20),
  contact_value VARCHAR(255),
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  meta_title VARCHAR(255),
  meta_description VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- quotes
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folio VARCHAR(30),
  status VARCHAR(20) NOT NULL DEFAULT 'NEW',
  customer_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(40),
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- quote_lines
CREATE TABLE IF NOT EXISTS quote_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  product_name VARCHAR(255) NOT NULL,
  product_slug VARCHAR(120) NOT NULL,
  sale_mode_label VARCHAR(40) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- site_settings
CREATE TABLE IF NOT EXISTS site_settings (
  id VARCHAR(20) PRIMARY KEY DEFAULT 'default',
  phone VARCHAR(40) NOT NULL,
  phone_e164 VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  whatsapp VARCHAR(20) NOT NULL,
  address VARCHAR(500),
  business_hours VARCHAR(255),
  facebook_url VARCHAR(500),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO site_settings (id, phone, phone_e164, email, whatsapp, address)
VALUES (
  'default',
  '662 450 1230',
  '+526624501230',
  'ventas@promacson.mx',
  '526624501230',
  'C. Benito Juárez 177, Constitución, 83150 Hermosillo, Son.'
)
ON CONFLICT (id) DO NOTHING;

-- wholesale_inquiries
CREATE TABLE IF NOT EXISTS wholesale_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folio VARCHAR(30),
  status VARCHAR(20) NOT NULL DEFAULT 'NEW',
  client_type VARCHAR(40) NOT NULL,
  client_type_other VARCHAR(120),
  institution VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(40),
  volume VARCHAR(255),
  interest VARCHAR(500),
  message TEXT,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

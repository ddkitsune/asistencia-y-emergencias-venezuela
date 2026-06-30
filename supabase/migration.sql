-- Migration: Firebase to Supabase
-- Run this in Supabase SQL Editor

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. emergencies
CREATE TABLE emergencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Alimentos', 'Medicamentos', 'Emergencia Médica', 'Servicios Públicos', 'Inundación / Desastre', 'Otro')),
  description TEXT NOT NULL,
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL DEFAULT 0,
  longitude DOUBLE PRECISION NOT NULL DEFAULT 0,
  urgency TEXT NOT NULL DEFAULT 'Alta' CHECK (urgency IN ('Baja', 'Media', 'Alta', 'Crítica')),
  status TEXT NOT NULL DEFAULT 'Pendiente' CHECK (status IN ('Pendiente', 'En Proceso', 'Resuelto')),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "allocatedResources" JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- 2. volunteers
CREATE TABLE volunteers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  specialty TEXT NOT NULL CHECK (specialty IN ('Atención Médica', 'Distribución de Alimentos', 'Transporte / Logística', 'Búsqueda y Rescate', 'Apoyo Psicológico', 'Comunicaciones')),
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  "coverageRadiusKm" DOUBLE PRECISION NOT NULL DEFAULT 0,
  latitude DOUBLE PRECISION NOT NULL DEFAULT 0,
  longitude DOUBLE PRECISION NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Disponible' CHECK (status IN ('Disponible', 'Asignado', 'No Disponible')),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. incidents
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('Saqueo', 'Intento de Saqueo', 'Bloqueo de Vía', 'Disturbio / Protesta', 'Falla de Seguridad', 'Otro')),
  description TEXT NOT NULL,
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL DEFAULT 0,
  longitude DOUBLE PRECISION NOT NULL DEFAULT 0,
  "riskLevel" TEXT NOT NULL DEFAULT 'Alto' CHECK ("riskLevel" IN ('Moderado', 'Alto', 'Crítico')),
  "isVerified" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. resources
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Alimentos', 'Médico', 'Herramientas', 'Energía / Comunicaciones')),
  quantity INTEGER NOT NULL DEFAULT 0,
  allocated INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT ''
);

-- 5. notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Alerta Crítica', 'Coordinación', 'Suministro', 'Seguridad')),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "targetArea" TEXT,
  "isRead" BOOLEAN NOT NULL DEFAULT FALSE
);

-- 6. posts
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "authorName" TEXT NOT NULL,
  contact TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Ofrecimiento', 'Solicitud', 'Alerta')),
  category TEXT NOT NULL DEFAULT 'Otro',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL DEFAULT 0,
  longitude DOUBLE PRECISION NOT NULL DEFAULT 0,
  "likesCount" INTEGER NOT NULL DEFAULT 0,
  "likedBy" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "isVerified" BOOLEAN NOT NULL DEFAULT FALSE,
  "verificationsCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  comments JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- Indexes
CREATE INDEX idx_emergencies_created_at ON emergencies ("createdAt" DESC);
CREATE INDEX idx_volunteers_created_at ON volunteers ("createdAt" DESC);
CREATE INDEX idx_incidents_created_at ON incidents ("createdAt" DESC);
CREATE INDEX idx_notifications_created_at ON notifications ("createdAt" DESC);
CREATE INDEX idx_notifications_is_read ON notifications ("isRead");
CREATE INDEX idx_posts_created_at ON posts ("createdAt" DESC);

-- Row Level Security (RLS)
ALTER TABLE emergencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Allow public read for all tables (read-only access for emergencies data)
CREATE POLICY "Public read emergencies" ON emergencies FOR SELECT USING (true);
CREATE POLICY "Public read volunteers" ON volunteers FOR SELECT USING (true);
CREATE POLICY "Public read incidents" ON incidents FOR SELECT USING (true);
CREATE POLICY "Public read resources" ON resources FOR SELECT USING (true);
CREATE POLICY "Public read notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Public read posts" ON posts FOR SELECT USING (true);

-- Allow insert for authenticated users
CREATE POLICY "Auth insert emergencies" ON emergencies FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth insert volunteers" ON volunteers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth insert incidents" ON incidents FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth insert notifications" ON notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth insert posts" ON posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow update for authenticated users
CREATE POLICY "Auth update emergencies" ON emergencies FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth update volunteers" ON volunteers FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth update incidents" ON incidents FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth update resources" ON resources FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth update notifications" ON notifications FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth update posts" ON posts FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================================
-- Migracion manual: columnas requisitos y duracion_minutos en MENTORIAS
-- Ejecutar contra la base real (Supabase SQL editor o psql).
-- Este proyecto no usa `prisma migrate`, sincroniza schema.prisma
-- con `prisma db pull` despues de aplicar este script.
-- ============================================================

ALTER TABLE MENTORIAS ADD COLUMN IF NOT EXISTS REQUISITOS TEXT;
ALTER TABLE MENTORIAS ADD COLUMN IF NOT EXISTS DURACION_MINUTOS INT;

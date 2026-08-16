-- ============================================================
-- Migracion manual: evitar postulaciones duplicadas del mismo
-- beneficiario a la misma oferta laboral (servicio).
-- Ejecutar contra la base real (Supabase SQL editor o psql).
-- Este proyecto no usa `prisma migrate`, sincroniza schema.prisma
-- con `prisma db pull` despues de aplicar este script.
-- ============================================================

ALTER TABLE POSTULACIONES_LABORALES
  ADD CONSTRAINT uq_postulacion_beneficiario_servicio
  UNIQUE (id_usuario_beneficiario, id_servicio);

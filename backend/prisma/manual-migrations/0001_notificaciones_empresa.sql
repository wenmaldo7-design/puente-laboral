-- ============================================================
-- Migracion manual: soportar notificaciones a EMPRESAS
-- Ejecutar contra la base real (Supabase SQL editor o psql).
-- Este proyecto no usa `prisma migrate`, sincroniza schema.prisma
-- con `prisma db pull` despues de aplicar este script.
-- ============================================================

ALTER TABLE NOTIFICACIONES
  ALTER COLUMN id_usuario_beneficiario DROP NOT NULL;

ALTER TABLE NOTIFICACIONES
  ADD COLUMN id_usuario_empresa INT REFERENCES EMPRESAS(id_usuario) ON DELETE CASCADE;

ALTER TABLE NOTIFICACIONES
  ADD CONSTRAINT chk_notificaciones_destinatario CHECK (
    (CASE WHEN id_usuario_beneficiario IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN id_usuario_empresa IS NOT NULL THEN 1 ELSE 0 END) = 1
  );

CREATE INDEX idx_notificaciones_empresa ON NOTIFICACIONES(id_usuario_empresa);

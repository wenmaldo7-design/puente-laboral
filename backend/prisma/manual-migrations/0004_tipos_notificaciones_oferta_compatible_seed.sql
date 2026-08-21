-- ============================================================
-- Migracion manual: agrega el tipo OFERTA_COMPATIBLE al catalogo
-- de tipos de notificacion (aviso a beneficiarios cuando se
-- publica una oferta laboral compatible con su perfil).
-- Ejecutar contra la base real (Supabase SQL editor o psql).
-- Este proyecto no usa `prisma migrate`, sincroniza schema.prisma
-- con `prisma db pull` despues de aplicar este script.
-- ============================================================

INSERT INTO TIPOS_NOTIFICACIONES (nombre)
SELECT v.nombre
FROM (VALUES
  ('OFERTA_COMPATIBLE')
) AS v(nombre)
WHERE NOT EXISTS (
  SELECT 1 FROM TIPOS_NOTIFICACIONES t WHERE t.nombre = v.nombre
);

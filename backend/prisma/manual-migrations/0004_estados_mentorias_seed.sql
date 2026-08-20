-- ============================================================
-- Migracion manual: catalogo de estados de mentoria
-- Ejecutar contra la base real (Supabase SQL editor o psql).
-- Este proyecto no usa `prisma migrate`, sincroniza schema.prisma
-- con `prisma db pull` despues de aplicar este script.
-- ============================================================

INSERT INTO ESTADOS_MENTORIAS (nombre)
SELECT v.nombre
FROM (VALUES
  ('inscrito'),
  ('cancelado')
) AS v(nombre)
WHERE NOT EXISTS (
  SELECT 1 FROM ESTADOS_MENTORIAS e WHERE e.nombre = v.nombre
);

-- ============================================================
-- Migracion manual: catalogo de estados de curso
-- Ejecutar contra la base real (Supabase SQL editor o psql).
-- Este proyecto no usa `prisma migrate`, sincroniza schema.prisma
-- con `prisma db pull` despues de aplicar este script.
-- ============================================================

INSERT INTO ESTADOS_CURSOS (nombre)
SELECT v.nombre
FROM (VALUES
  ('inscrito'),
  ('cancelado'),
  ('completo')
) AS v(nombre)
WHERE NOT EXISTS (
  SELECT 1 FROM ESTADOS_CURSOS e WHERE e.nombre = v.nombre
);

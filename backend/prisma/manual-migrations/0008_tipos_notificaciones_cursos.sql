-- ============================================================
-- Migracion manual: tipos de notificacion para cursos
-- ============================================================

INSERT INTO TIPOS_NOTIFICACIONES (nombre)
SELECT v.nombre
FROM (VALUES
  ('CURSO_INSCRIPCION'),
  ('CURSO_CANCELACION')
) AS v(nombre)
WHERE NOT EXISTS (
  SELECT 1 FROM TIPOS_NOTIFICACIONES t WHERE t.nombre = v.nombre
);

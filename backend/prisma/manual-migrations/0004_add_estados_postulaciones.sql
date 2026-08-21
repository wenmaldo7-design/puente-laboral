-- ============================================================
-- Migracion manual: add estados postulaciones y tipo notificacion
-- ============================================================

INSERT INTO estados_postulaciones (nombre)
SELECT v.nombre
FROM (VALUES
  ('en_proceso'),
  ('entrevistado')
) AS v(nombre)
WHERE NOT EXISTS (
  SELECT 1 FROM estados_postulaciones e WHERE e.nombre = v.nombre
);

INSERT INTO tipos_notificaciones (nombre)
SELECT v.nombre
FROM (VALUES
  ('POSTULACION_CAMBIO_ESTADO')
) AS v(nombre)
WHERE NOT EXISTS (
  SELECT 1 FROM tipos_notificaciones t WHERE t.nombre = v.nombre
);

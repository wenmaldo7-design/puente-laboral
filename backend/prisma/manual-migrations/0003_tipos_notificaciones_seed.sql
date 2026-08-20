-- ============================================================
-- Migracion manual: catalogo de tipos de notificacion
-- Ejecutar contra la base real (Supabase SQL editor o psql).
-- Este proyecto no usa `prisma migrate`, sincroniza schema.prisma
-- con `prisma db pull` despues de aplicar este script.
-- ============================================================

INSERT INTO TIPOS_NOTIFICACIONES (nombre)
SELECT v.nombre
FROM (VALUES
  ('POSTULACION_ENVIADA'),
  ('MENTORIA_INSCRIPCION'),
  ('MENTORIA_CANCELACION'),
  ('POSTULACION_RECIBIDA'),
  ('SOLICITUD_APROBADA'),
  ('SOLICITUD_RECHAZADA')
) AS v(nombre)
WHERE NOT EXISTS (
  SELECT 1 FROM TIPOS_NOTIFICACIONES t WHERE t.nombre = v.nombre
);

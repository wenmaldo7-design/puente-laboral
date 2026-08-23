-- ============================================================
-- Migracion manual: columna id_provincia en SERVICIOS
-- Ejecutar contra la base real (Supabase SQL editor o psql).
-- Este proyecto no usa `prisma migrate`, sincroniza schema.prisma
-- con `prisma db pull` despues de aplicar este script.
-- ============================================================

ALTER TABLE SERVICIOS ADD COLUMN IF NOT EXISTS ID_PROVINCIA INT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'servicios_id_provincia_fkey'
  ) THEN
    ALTER TABLE SERVICIOS
      ADD CONSTRAINT servicios_id_provincia_fkey
      FOREIGN KEY (id_provincia) REFERENCES PROVINCIAS(id_provincia)
      ON DELETE NO ACTION ON UPDATE NO ACTION;
  END IF;
END $$;

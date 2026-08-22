# Proposal: add-location-to-services

## Intent

Agregar un campo de ubicación ("provincia" o lugar de trabajo) a los formularios de creación de Ofertas Laborales y Mentorías para que los postulantes sepan dónde se desarrollará la actividad.

## Scope

### In Scope
- Agregar campo "Provincia/Ubicación" al formulario de crear Oferta Laboral.
- Agregar campo "Provincia/Ubicación" al formulario de crear Mentoría.
- Mostrar la ubicación en la vista de detalle de la Oferta Laboral y Mentoría.
- Actualizar los esquemas de base de datos/API para soportar el nuevo campo.
- Filtrado por ubicación en la búsqueda de ofertas/mentorías.

### Out of Scope
- Mapas interactivos (Google Maps, etc.).

## Capabilities

### New Capabilities
- `service-location`: Soporte para definir y mostrar la ubicación geográfica de los servicios (ofertas laborales y mentorías).

### Modified Capabilities
None

## Approach

1. Modificar los esquemas o modelos de datos correspondientes para agregar el campo `location` o `province`.
2. Actualizar los componentes de formulario en el frontend para incluir el nuevo campo.
3. Actualizar las vistas donde se muestran las ofertas y mentorías para renderizar este nuevo dato.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| Formularios de Creación (Frontend) | Modified | Se agregará el nuevo input de ubicación. |
| Vistas de Detalle (Frontend) | Modified | Se mostrará la ubicación en la información del servicio. |
| Modelos/APIs de Ofertas y Mentorías (Backend) | Modified | Se agregará el campo para persistir la ubicación. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Inconsistencia de datos si el campo es de texto libre | Medium | Utilizar validación de texto o una lista desplegable con opciones predefinidas. |

## Rollback Plan

Revertir los commits relacionados en el frontend y backend. La base de datos puede mantener la columna (nula por defecto o vacía) para no perder datos en caso de rollback, o eliminarla mediante una migración de reverso.

## Dependencies

- Ninguna.

## Success Criteria

- [ ] Un usuario puede crear una Oferta Laboral especificando la provincia/ubicación.
- [ ] Un usuario puede crear una Mentoría especificando la provincia/ubicación.
- [ ] La ubicación es visible al consultar la Oferta Laboral o Mentoría.

## Business Rules & Decisions

1. **Formato del campo**: Lista desplegable utilizando las 24 provincias argentinas.
2. **Obligatoriedad**: Reactiva. Será obligatorio si la modalidad de la oferta/mentoría es presencial (o híbrida), y se ocultará o será opcional si es 100% virtual/remota.
3. **Búsqueda (Scope actualizado)**: Sí, se incluye en el *In Scope* agregar un filtro por provincia en las pantallas de búsqueda/listado en esta misma iteración.

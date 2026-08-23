<Proposal: frontend-cursos-feature>
## Intent

Implementar la funcionalidad en el frontend para que las organizaciones puedan crear cursos y los beneficiarios puedan buscar, filtrar, inscribirse y darse de baja de los mismos, facilitando la capacitación.

## Scope

### In Scope
- Botón "Crear curso" en el home del rol Organización.
- Funcionalidad de inscripción para rol Beneficiario.
- Funcionalidad para que el Beneficiario pueda darse de baja de un curso.
- Ocultamiento de cursos en la lista de los beneficiarios cuando alcanzan su capacidad máxima (cupos llenos).
- Filtros de búsqueda para cursos por "Modalidad" y "Provincia".

### Out of Scope
- Límite de creación de cursos por organización (no hay límite actualmente).
- Listas de espera para cursos sin cupo.

## Capabilities

> This section is the CONTRACT between proposal and specs phases.
> The sdd-spec agent reads this to know exactly which spec files to create or update.

### New Capabilities
- `course-management`: Permite a las organizaciones crear cursos desde su pantalla de inicio (home).
- `course-enrollment`: Permite a los beneficiarios buscar, filtrar (modalidad, provincia), inscribirse y darse de baja de cursos, incluyendo la ocultación automática de cursos sin cupo.

### Modified Capabilities
- Ninguna.

## Approach

Se añadirá el botón "Crear curso" en la pantalla principal (home) del rol Organización. En el flujo del rol Beneficiario, se agregará el manejo de estado para las acciones de inscripción y desinscripción (darse de baja).
La lista de cursos mostrada a los beneficiarios será filtrada para omitir los elementos cuya capacidad máxima esté cubierta. 
Finalmente, se agregarán componentes de filtros de "Modalidad" y "Provincia" en la interfaz de búsqueda, integrándolos a la consulta de obtención de cursos.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `Home Organizaciones` | Modified | Se añade botón de crear curso |
| `Vista Cursos Beneficiarios` | Modified | Lógica de filtros, botón de inscripción/baja, y lógica para ocultar cursos llenos |
| `Servicios / API` | Modified | Nuevos métodos para consumir endpoints de creación, inscripción, desinscripción y filtrado |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Inconsistencia de cupos (race condition) | Medium | Confiar en la respuesta final del backend y mostrar el mensaje de error adecuado si falla la inscripción por cupo. |
| Parámetros de filtro incorrectos | Low | Verificar que los valores de `modalidad` y `provincia` enviados al backend coincidan exactamente con lo esperado por la API. |

## Rollback Plan

Revertir los commits del frontend relacionados a este cambio (`git revert`), restaurando el estado previo del home de organizaciones y la vista del listado de cursos, eliminando así los nuevos botones y filtros.

## Dependencies

- Endpoints del backend funcionales y documentados para: crear curso, listar cursos (soportando los filtros de modalidad y provincia y devolviendo estado de capacidad), inscribirse y desinscribirse.

## Success Criteria

- [ ] Un usuario con rol Organización ve el botón en su home y puede crear un curso exitosamente.
- [ ] Un usuario con rol Beneficiario puede filtrar la lista de cursos por modalidad y provincia.
- [ ] Los cursos con capacidad llena desaparecen automáticamente de la vista del beneficiario.
- [ ] Un beneficiario puede inscribirse a un curso disponible y luego darse de baja exitosamente.

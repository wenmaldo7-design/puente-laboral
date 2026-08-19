## Intent

Crear un dashboard dedicado para que la Empresa/Organización pueda visualizar su perfil, gestionar las oportunidades (laborales, mentorías) que ofrece y hacer un seguimiento del estado de los candidatos postulados en cada una de ellas, resolviendo la necesidad de centralizar y simplificar la gestión de sus procesos de selección y ofertas.

## Scope

### In Scope
- Visualización de métricas clave (ej. total de oportunidades activas, total de candidatos recibidos, nuevos candidatos).
- Visualización del perfil de la empresa.
- Listado de oportunidades (en formato cards) con acciones para editarlas o eliminarlas.
- Listado simple de candidatos dentro de cada oportunidad, mostrando el estado actual de su proceso.
- Estado vacío (Empty State): Call to Action destacado para "Agregar Oportunidad/Mentoría" si la empresa no tiene ninguna registrada.

### Out of Scope
- Envío directo de correos electrónicos o mensajes a los candidatos desde el dashboard.
- Generación de reportes de inserción laboral o dashboards para perfiles de sistema como el "Admin" general.

## Capabilities

> This section is the CONTRACT between proposal and specs phases.
> The sdd-spec agent reads this to know exactly which spec files to create or update.

### New Capabilities
- `empresa-dashboard`: Panel principal, visualización del perfil de empresa y métricas agregadas.
- `oportunidades-management`: Creación, edición, eliminación y visualización (cards/empty states) de oportunidades/mentorías ofrecidas por la empresa.
- `candidatos-tracking`: Visualización de los candidatos postulados a una oportunidad y consulta de sus estados en el proceso.

### Modified Capabilities
- None

## Approach

Desarrollar una interfaz basada en componentes que incluya:
1. Una cabecera/sección superior con métricas clave y datos del perfil.
2. Un área de contenido principal para renderizar las oportunidades en formato cards. Si no hay datos, se muestra un componente de "Empty State" con un botón de acción primario.
3. Dentro de cada card (o a través de una acción de expansión/detalle), un listado de candidatos donde cada fila indique los datos básicos y el badge del estado en el que se encuentra.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/dashboard-empresa` | New | Página principal del dashboard de la empresa (o ruta equivalente según arquitectura). |
| `src/components/empresa` | New | Componentes de UI: perfil, métricas, cards de oportunidades, listas de candidatos, empty states. |
| `src/services/oportunidades` | New | Endpoints o server actions para gestionar oportunidades. |
| `src/services/candidatos` | New | Endpoints o server actions para consultar candidatos. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Carga de grandes volúmenes de candidatos | Med | Paginación o "Cargar más" en las listas de postulantes. |
| Borrado accidental de oportunidades con postulantes | Med | Modal de confirmación requerida al intentar borrar. |

## Rollback Plan

Al ser un nuevo feature, revertir el PR que incluye las rutas y componentes de UI del dashboard de empresa, o remover el enlace de navegación para ocultarlo en producción.

## Dependencies

- Endpoints de backend o base de datos que expongan la información de la empresa, sus oportunidades y las vinculaciones de candidatos.

## Success Criteria

- [ ] La empresa puede ver el dashboard con el estado vacío y crear una nueva oportunidad.
- [ ] La empresa puede ver las cards de sus oportunidades existentes, editarlas y eliminarlas.
- [ ] La empresa puede visualizar un listado de candidatos y su estado actual dentro de una oportunidad dada.

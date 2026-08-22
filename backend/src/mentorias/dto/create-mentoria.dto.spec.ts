import { validate } from 'class-validator';
import { CreateMentoriaDto } from './create-mentoria.dto';

describe('CreateMentoriaDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = new CreateMentoriaDto();
    dto.titulo = 'Mentoria de prueba';
    dto.descripcion = 'Descripción de prueba';
    dto.requisitos = 'Requisitos básicos';
    dto.duracion_minutos = 60;
    dto.area = 'IT';
    dto.fecha = '2024-01-01';
    dto.hora_inicio = '10:00';
    dto.modalidad = 'virtual';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when required fields are missing', async () => {
    const dto = new CreateMentoriaDto();
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    
    const missingProperties = errors.map((e) => e.property);
    expect(missingProperties).toContain('titulo');
    expect(missingProperties).toContain('requisitos');
    expect(missingProperties).toContain('duracion_minutos');
    expect(missingProperties).toContain('area');
    expect(missingProperties).toContain('fecha');
    expect(missingProperties).toContain('hora_inicio');
    expect(missingProperties).toContain('modalidad');
  });
});

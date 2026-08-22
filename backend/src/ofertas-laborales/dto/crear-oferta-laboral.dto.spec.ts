import { validate } from 'class-validator';
import { CrearOfertaLaboralDto } from './crear-oferta-laboral.dto';

describe('CrearOfertaLaboralDto', () => {
  const getValidDto = (): CrearOfertaLaboralDto => {
    const dto = new CrearOfertaLaboralDto();
    dto.titulo = 'Test';
    dto.area = 'Backend';
    dto.modalidad = 'virtual';
    dto.vacantes = 1;
    dto.fecha_limite = '2099-12-31';
    return dto;
  };

  it('should accept missing provincia when modalidad is virtual', async () => {
    const dto = getValidDto();
    dto.modalidad = 'virtual';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should reject missing provincia when modalidad is presencial', async () => {
    const dto = getValidDto();
    dto.modalidad = 'presencial';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('provincia');
  });

  it('should reject missing provincia when modalidad is hibrida', async () => {
    const dto = getValidDto();
    dto.modalidad = 'hibrida';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('provincia');
  });

  it('should accept valid provincia when modalidad is hibrida or presencial', async () => {
    const dto = getValidDto();
    dto.modalidad = 'presencial';
    dto.provincia = 'Córdoba';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});

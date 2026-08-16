import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

/** Rechaza fechas anteriores al día de hoy. Se usa sobre campos ya validados con @IsDateString. */
export function IsNotPastDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNotPastDate',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string') return true;
          const hoy = new Date();
          hoy.setHours(0, 0, 0, 0);
          return new Date(value).getTime() >= hoy.getTime();
        },
        defaultMessage(args: ValidationArguments): string {
          return `${args.property} no puede ser una fecha pasada`;
        },
      },
    });
  };
}

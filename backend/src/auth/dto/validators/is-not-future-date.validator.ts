import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

/** Rechaza fechas posteriores al día de hoy. Se usa sobre campos ya validados con @IsDateString. */
export function IsNotFutureDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNotFutureDate',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string') return true;
          return new Date(value).getTime() <= Date.now();
        },
        defaultMessage(args: ValidationArguments): string {
          return `${args.property} no puede ser una fecha futura`;
        },
      },
    });
  };
}

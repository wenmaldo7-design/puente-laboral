import { IsEmail, IsString } from 'class-validator';

export class LoginUserDto {
  @IsEmail({}, { message: 'El email no es valido' })
  email!: string;

  @IsString()
  password!: string;
}

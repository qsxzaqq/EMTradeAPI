import { IsString, IsNotEmpty, IsDefined } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly username: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly password: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly identifyCode: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly randNum: string;
}

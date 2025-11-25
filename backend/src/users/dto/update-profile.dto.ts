import { IsString, IsOptional, MinLength, Matches } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Name must not be empty' })
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(\+\d{1,3}[- ]?)?\d{10}$/, {
    message: 'Phone number must be valid (e.g., +1234567890 or 1234567890)',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  profileImage?: string;
}

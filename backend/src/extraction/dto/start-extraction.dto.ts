import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsNumber,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Sanitize } from '../../common/decorators/sanitize.decorator';

export class StartExtractionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200, { message: 'Keyword must not exceed 200 characters' })
  @Sanitize()
  keyword: string;

  @IsBoolean()
  @IsOptional()
  skipDuplicates?: boolean = true;

  @IsBoolean()
  @IsOptional()
  skipWithoutPhone?: boolean = true;

  @IsBoolean()
  @IsOptional()
  skipWithoutWebsite?: boolean = false;

  @IsBoolean()
  @IsOptional()
  skipAlreadyExtracted?: boolean = false;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  maxResults?: number = 50;
}

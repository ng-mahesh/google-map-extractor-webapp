import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class StartExtractionDto {
  @IsString()
  @IsNotEmpty()
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

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  maxResults?: number = 50;
}

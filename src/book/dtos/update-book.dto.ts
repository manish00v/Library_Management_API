import { IsString, IsInt, IsOptional, Min, Max, IsISBN } from 'class-validator';

export class UpdateBookDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  author?: string;

  @IsInt()
  @Min(1000)
  @Max(new Date().getFullYear()) 
  @IsOptional()
  publishedYear?: number;

  @IsString()
  @IsISBN()
  @IsOptional()
  ISBN?: string;

  @IsString()
  @IsOptional()
  genre?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  stockCount?: number;
}

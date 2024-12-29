import { IsOptional, IsString } from 'class-validator';

export class QueryBookDto {
  @IsString()
  @IsOptional()
  query?: string; //fuzzy search
}

import { IsString, IsInt, IsNotEmpty, Min, Max, IsISBN } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsInt()
  @Min(1000)
  @Max(new Date().getFullYear()) 
  publishedYear: number;

  @IsString()
  @IsISBN()
  @IsNotEmpty()
  ISBN: string;

  @IsString()
  @IsNotEmpty()
  genre: string;

  @IsInt()
  @Min(0)
  stockCount: number;
}

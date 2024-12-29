import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateBookDto } from './dtos/create-book.dto';
import { UpdateBookDto } from './dtos/update-book.dto';
import { QueryBookDto } from './dtos/query-book.dto';
import { BookService } from './book.service';

@ApiTags('Books')
@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new book' })
  async createBook(@Body() createBookDto: CreateBookDto) {
    console.log('Received request to create a book:', createBookDto);

    const existingBook = await this.bookService.findBookByISBN(createBookDto.ISBN);
    if (existingBook) {
      console.log(`Validation failed: ISBN ${createBookDto.ISBN} already exists.`);
      throw new BadRequestException(`ISBN ${createBookDto.ISBN} already exists.`);
    }

    console.log('All validations passed, proceeding to create the book...');
    const createdBook = await this.bookService.createBook(createBookDto);
    console.log('Book successfully created:', createdBook);
    return createdBook;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a book by ID' })
  async updateBook(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    console.log(`Received request to update book with ID: ${id}`);
    console.log('Update data provided:', updateBookDto);

    const existingBook = await this.bookService.getBookById(id);
    if (!existingBook) {
      console.log(`Book with ID ${id} not found.`);
      throw new NotFoundException(`Book with ID ${id} not found.`);
    }

    console.log(`Book found, updating with new data...`);
    const updatedBook = await this.bookService.updateBook(id, updateBookDto);
    console.log('Book successfully updated:', updatedBook);
    return updatedBook;
  }

@Get()
@ApiOperation({ summary: 'Get all books or search books' })
async getBooks(@Query() queryDto: QueryBookDto) {
  console.log('Received request to fetch books with query:', queryDto.query || 'No query provided');
  if (queryDto.query) {
    console.log('Performing fuzzy search...');
    const searchResults = await this.bookService.fuzzySearch(queryDto.query);
    console.log(`Fuzzy search returned ${searchResults.length} results.`);
    return searchResults;
  }

  console.log('Fetching all books...');
  const books = await this.bookService.getBooks();
  console.log(`Retrieved ${books.length} books from the database.`);
  return books;
}

  @Get(':id')
  @ApiOperation({ summary: 'Get a book by ID' })
  async getBookById(@Param('id') id: string) {
    console.log(`Received request to fetch book with ID: ${id}`);
    const book = await this.bookService.getBookById(id);
    if (!book) {
      console.log(`Book with ID ${id} not found.`);
      throw new NotFoundException(`Book with ID ${id} not found.`);
    }
    console.log('Book successfully retrieved:', book);
    return book;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a book by ID' })
  async deleteBook(@Param('id') id: string) {
    console.log(`Received request to delete book with ID: ${id}`);
    const deletedBook = await this.bookService.deleteBook(id);
    if (!deletedBook) {
      console.log(`Book with ID ${id} not found for deletion.`);
      throw new NotFoundException(`Book with ID ${id} not found.`);
    }
    console.log('Book successfully deleted:', deletedBook);
    return deletedBook;
  }
}

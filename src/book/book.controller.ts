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
  NotFoundException 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody, ApiResponse, ApiBadRequestResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { BookService } from './book.service';

@ApiTags('Books') // Group all endpoints under "Books"
@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new book' })
  @ApiBody({
    description: 'Book details',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        author: { type: 'string' },
        publishedYear: { type: 'number' },
        ISBN: { type: 'string' },
        genre: { type: 'string' },
        stockCount: { type: 'number' },
      },
      required: ['title', 'author', 'publishedYear', 'ISBN', 'genre', 'stockCount'],
    },
  })
  @ApiResponse({ status: 201, description: 'The book has been successfully created.' })
  @ApiBadRequestResponse({ description: 'Invalid input or duplicate ISBN.' })
  async createBook(
    @Body()
    body: {
      title: string;
      author: string;
      publishedYear: number;
      ISBN: string;
      genre: string;
      stockCount: number;
    },
  ) {
    console.log('Received ISBN:', body.ISBN);

    if (!this.validatePublishedYear(body.publishedYear)) {
      throw new BadRequestException('Published year cannot be in the future');
    }

    const existingBook = await this.bookService.findBookByISBN(body.ISBN);
    if (existingBook) {
      throw new BadRequestException(`ISBN ${body.ISBN} already exists.`);
    }

    return this.bookService.createBook(
      body.title,
      body.author,
      body.publishedYear,
      body.ISBN,
      body.genre,
      body.stockCount,
    );
  }

  private validatePublishedYear(publishedYear: number): boolean {
    const currentYear = new Date().getFullYear();
    return publishedYear <= currentYear;
  }

  @Get()
  @ApiOperation({ summary: 'Get all books or search books' })
  @ApiQuery({ name: 'query', required: false, description: 'Search query for fuzzy matching' })
  @ApiResponse({ status: 200, description: 'List of books.' })
  async getBooks(@Query('query') query?: string) {
    if (query) {
      return this.bookService.fuzzySearch(query);
    }
    return this.bookService.getBooks();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a book by ID' })
  @ApiParam({ name: 'id', description: 'Book ID' })
  @ApiResponse({ status: 200, description: 'Details of the book.' })
  @ApiNotFoundResponse({ description: 'Book not found.' })
  async getBookById(@Param('id') id: string) {
    return this.bookService.getBookById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a book by ID' })
  @ApiParam({ name: 'id', description: 'Book ID' })
  @ApiBody({
    description: 'Updated book details',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        author: { type: 'string' },
        publishedYear: { type: 'number', nullable: true },
        genre: { type: 'string', nullable: true },
        ISBN: { type: 'string', nullable: true },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Book updated successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid data or duplicate ISBN.' })
  @ApiNotFoundResponse({ description: 'Book not found.' })
  async updateBook(
    @Param('id') id: string,
    @Body()
    updateData: Partial<{
      title: string;
      author: string;
      publishedYear?: number;
      genre?: string;
      ISBN?: string;
    }>,
  ) {
    const existingBook = await this.bookService.getBookById(id);
    if (!existingBook) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    if (updateData.ISBN && updateData.ISBN !== existingBook.ISBN) {
      const bookWithSameISBN = await this.bookService.findBookByISBN(updateData.ISBN);
      if (bookWithSameISBN) {
        throw new BadRequestException(`ISBN ${updateData.ISBN} is already in use.`);
      }
    }

    return this.bookService.updateBook(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a book by ID' })
  @ApiParam({ name: 'id', description: 'Book ID' })
  @ApiResponse({ status: 200, description: 'Book deleted successfully.' })
  @ApiNotFoundResponse({ description: 'Book not found.' })
  async deleteBook(@Param('id') id: string) {
    return this.bookService.deleteBook(id);
  }
}

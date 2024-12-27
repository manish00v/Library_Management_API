import { Controller, Get, Post, Put, Delete, Param, Body, Query, BadRequestException, NotFoundException } from '@nestjs/common';
import { BookService } from './book.service';

@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
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
    console.log('Received ISBN:', body.ISBN); // Print the ISBN
    if (!this.validatePublishedYear(body.publishedYear)) {
      throw new BadRequestException('Published year cannot be in the future');
    }

    // Check if ISBN is unique
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

  // validating publishedYear
  private validatePublishedYear(publishedYear: number): boolean {
    const currentYear = new Date().getFullYear();
    return publishedYear <= currentYear;
  }


  @Get()
  async getBooks(@Query('query') query?: string) {
    if (query) {
      return this.bookService.fuzzySearch(query);
    }
    return this.bookService.getBooks();
  }

  @Get(':id')
  async getBookById(@Param('id') id: string) {
    return this.bookService.getBookById(id);
  }

  @Put(':id')
  async updateBook(
    @Param('id') id: string,
    @Body()
    updateData: Partial<{
      title: string;
      author: string;
      publishedYear?: number;
      genre?: string;
      ISBN?: string; // Include ISBN in the update data
    }>,
  ) {
    const existingBook = await this.bookService.getBookById(id);
    if (!existingBook) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    // Validate ISBN if it's being updated
    if (updateData.ISBN && updateData.ISBN !== existingBook.ISBN) {
      const bookWithSameISBN = await this.bookService.findBookByISBN(updateData.ISBN);
      if (bookWithSameISBN) {
        throw new BadRequestException(`ISBN ${updateData.ISBN} is already in use.`);
      }
    }

    return this.bookService.updateBook(id, updateData);
  } 

  @Delete(':id')
  async deleteBook(@Param('id') id: string) {
    return this.bookService.deleteBook(id);
  }
}

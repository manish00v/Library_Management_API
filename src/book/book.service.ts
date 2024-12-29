import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Book } from './schemas/book.schema';
import { CreateBookDto } from './dtos/create-book.dto';
import { UpdateBookDto } from './dtos/update-book.dto';
import Fuse from 'fuse.js';

@Injectable()
export class BookService {
  constructor(@InjectModel('Book') private readonly bookModel: Model<Book>) {}

  // Implement findBookByISBN to check if the ISBN exists in the database
  async findBookByISBN(ISBN: string): Promise<Book | null> {
    return this.bookModel.findOne({ ISBN }).exec();
  }

  // Create a new book
  async createBook(createBookDto: CreateBookDto): Promise<Book> {
    const { ISBN } = createBookDto;

    // Check if the book already exists
    const existingBook = await this.bookModel.findOne({ ISBN }).exec();
    if (existingBook) {
      throw new BadRequestException(`ISBN ${ISBN} already exists.`);
    }

    const newBook = new this.bookModel(createBookDto);
    return newBook.save();
  }

  // Get all books
  async getBooks(): Promise<Book[]> {
    return this.bookModel.find().exec();
  }

  // Get a book by ID
  async getBookById(id: string): Promise<Book> {
    const book = await this.bookModel.findById(id).exec();
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found.`);
    }
    return book;
  }

  // Update a book by ID
  async updateBook(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    const book = await this.bookModel.findById(id).exec();
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found.`);
    }

    if (updateBookDto.ISBN && updateBookDto.ISBN !== book.ISBN) {
      const existingBookWithISBN = await this.bookModel.findOne({ ISBN: updateBookDto.ISBN }).exec();
      if (existingBookWithISBN) {
        throw new BadRequestException(`ISBN ${updateBookDto.ISBN} already exists.`);
      }
    }

    Object.assign(book, updateBookDto);
    return book.save();
  }

  // Delete a book by ID
  async deleteBook(id: string): Promise<Book> {
    const book = await this.bookModel.findByIdAndDelete(id).exec();
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found.`);
    }
    return book;
  }

  // Fuzzy search using Fuse.js
  async fuzzySearch(query: string): Promise<Book[]> {
    const books = await this.bookModel.find().exec();

    const options = {
      includeScore: true, // Include the score for each match
      keys: ['title', 'author', 'genre', 'ISBN'], // Fields to search within
    };

    const fuse = new Fuse(books, options);
    const result = fuse.search(query);

    return result.map((result) => result.item); // Return the matched books
  }
}

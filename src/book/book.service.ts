import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Book } from './schemas/book.schema';




@Injectable()
export class BookService {
  constructor(@InjectModel('Book') private bookModel: Model<Book>) {}

  async findBookByISBN(ISBN: string): Promise<Book | null> {
    return this.bookModel.findOne({ ISBN }).exec();
  }

  async createBook(
    title: string,
    author: string,
    publishedYear: number,
    ISBN: string,
    genre?: string,
    stockCount?: number,
  ): Promise<Book> {
    const newBook = new this.bookModel({ title, author, publishedYear, genre, ISBN, stockCount });
    return newBook.save();
  }

  async getBooks(): Promise<Book[]> {
    return this.bookModel.find().exec();
  }

  async getBookById(id: string): Promise<Book> {
    return this.bookModel.findById(id).exec();
  }

  async updateBook(id: string, updateData: Partial<Book>): Promise<Book> {
    return this.bookModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async deleteBook(id: string): Promise<Book> {
    return this.bookModel.findByIdAndDelete(id).exec();
  }

  async fuzzySearch(query: string): Promise<Book[]> {
    return this.bookModel
      .find({ $text: { $search: query } }) //MongoDB's text search
      .exec();
  }
}

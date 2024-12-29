import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Book extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  author: string;

  @Prop({ required: true })
  publishedYear?: number;

  @Prop({required: true, unique: true})
  ISBN : string;

  @Prop({ required: true })
  genre?: string;

  @Prop({ required: true })
  stockCount?: number;
}

export const BookSchema = SchemaFactory.createForClass(Book);

//text search
BookSchema.index({ title: 'text', author: 'text', genre: 'text', ISBN: 'text'});

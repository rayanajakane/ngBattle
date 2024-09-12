import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Tile extends Document {
    @Prop({ required: true })
    i: number;

    @Prop({ required: true })
    j: number;

    @Prop({ required: true })
    tileType: string;

    @Prop({ type: [String], required: true })
    items: string[];

    @Prop({ required: true })
    hasPlayer: boolean;
}

export const TileSchema = SchemaFactory.createForClass(Tile);
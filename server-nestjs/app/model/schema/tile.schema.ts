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

    @Prop({ required: false })
    item: string;

    @Prop({ required: true })
    hasPlayer: boolean;
}

export const tileSchema = SchemaFactory.createForClass(Tile);

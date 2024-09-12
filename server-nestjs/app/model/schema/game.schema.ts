import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Tile, TileSchema } from './tile.schema';

@Schema()
export class Game extends Document {
    @Prop({ required: true })
    id: string;

    @Prop({ required: true })
    gameName: string;

    @Prop({ required: true })
    gameDescription: string;

    @Prop({ required: true })
    mapSize: string;

    @Prop({ type: [[TileSchema]], required: true }) // TODO look into making this a raw schema definition, check nestJS docs
    map: Tile[][];

    @Prop({ required: true })
    gameType: string;
}

export const GameSchema = SchemaFactory.createForClass(Game);
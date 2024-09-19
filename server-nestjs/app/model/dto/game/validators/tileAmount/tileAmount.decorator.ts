import { registerDecorator, ValidationOptions } from 'class-validator';
import { TileAmountValidator } from './tileAmount.validator';

export function IsCorrectTileAmount(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: TileAmountValidator,
        });
    };
}

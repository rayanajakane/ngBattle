import { registerDecorator, ValidationOptions } from 'class-validator';
import { StartingPointAmountValidator } from './startingPointAmount.validator';

export function IsCorrectStartingPointAmount(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: StartingPointAmountValidator,
        });
    };
}

import { registerDecorator, ValidationOptions } from 'class-validator';
import { StartingPointAmountValidator } from './startingPointAmount.validator';

export function isCorrectStartingPointAmount(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [],
            validator: StartingPointAmountValidator,
        });
    };
}

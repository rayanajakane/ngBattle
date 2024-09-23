import { registerDecorator, ValidationOptions } from 'class-validator';
import { GroundAmountValidator } from './groundAmount.validator';

export function hasCorrectGroundAmount(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [],
            validator: GroundAmountValidator,
        });
    };
}

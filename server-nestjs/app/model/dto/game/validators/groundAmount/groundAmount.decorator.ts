import { registerDecorator, ValidationOptions } from 'class-validator';
import { GroundAmountValidator } from './groundAmount.validator';

export function HasCorrectGroundAmount(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: GroundAmountValidator,
        });
    };
}

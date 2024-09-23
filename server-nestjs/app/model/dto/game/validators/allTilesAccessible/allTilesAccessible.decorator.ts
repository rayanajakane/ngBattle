import { registerDecorator, ValidationOptions } from 'class-validator';
import { AllTilesAccessibleValidator } from './allTilesAccessible.validator';

export function areAllTilesAccessible(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [],
            validator: AllTilesAccessibleValidator,
        });
    };
}

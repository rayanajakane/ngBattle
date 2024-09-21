import { registerDecorator, ValidationOptions } from 'class-validator';
import { AllTilesAccessibleValidator } from './allTilesAccessible.validator';

export function AreAllTilesAccessible(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: AllTilesAccessibleValidator,
        });
    };
}

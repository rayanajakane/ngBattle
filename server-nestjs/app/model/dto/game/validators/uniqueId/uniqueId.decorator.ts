import { registerDecorator, ValidationOptions } from 'class-validator';
import { UniqueIdValidator } from './uniqueId.validator';

export function isUniqueId(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [],
            validator: UniqueIdValidator,
        });
    };
}

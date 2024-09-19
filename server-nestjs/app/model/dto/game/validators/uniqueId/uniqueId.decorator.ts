import { registerDecorator, ValidationOptions } from 'class-validator';
import { UniqueIdValidator } from './uniqueId.validator';

export function IsUniqueId(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: UniqueIdValidator,
        });
    };
}

import { registerDecorator, ValidationOptions } from 'class-validator';
import { UniqueNameValidator } from './uniqueName.validator';

export function IsUniqueName(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: UniqueNameValidator,
        });
    };
}

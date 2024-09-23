import { registerDecorator, ValidationOptions } from 'class-validator';
import { UniqueNameValidator } from './uniqueName.validator';

export function isUniqueName(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [],
            validator: UniqueNameValidator,
        });
    };
}

import { registerDecorator, ValidationOptions } from 'class-validator';
import { AllDoorsValidValidator } from './allDoorsValid.validator';

export function areAllDoorsValid(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [],
            validator: AllDoorsValidValidator,
        });
    };
}

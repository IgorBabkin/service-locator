import 'reflect-metadata';
import { ConstructorMetadataCollector, InjectFn, MethodsMetadataCollector } from '../../lib';

export const constructorMetadataCollector = new ConstructorMetadataCollector();
export const inject =
    <T>(injectionFn: InjectFn<T>): ParameterDecorator =>
    (target, propertyKey, parameterIndex) => {
        constructorMetadataCollector.addMetadata(target, parameterIndex, injectionFn);
    };

export const onConstructMetadataCollector = new MethodsMetadataCollector(Symbol('OnConstructHook'));
export const onConstruct: MethodDecorator = (target, propertyKey) => {
    // eslint-disable-next-line @typescript-eslint/ban-types
    onConstructMetadataCollector.addHook(target, propertyKey);
};

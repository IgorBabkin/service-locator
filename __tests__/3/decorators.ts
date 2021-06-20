import 'reflect-metadata';
import {
    constructor,
    ConstructorMetadataCollector,
    InjectFn,
    IProvider,
    IProviderOptions,
    Provider,
    ProviderFn,
} from '../../lib';

export const constructorMetadataCollector = new ConstructorMetadataCollector();
export const inject =
    <T>(injectionFn: InjectFn<T>): ParameterDecorator =>
    (target, propertyKey, parameterIndex) => {
        constructorMetadataCollector.addMetadata(target, parameterIndex, injectionFn);
    };

const createProvider = <T>(fn: ProviderFn<T>, options: IProviderOptions) => new Provider(fn, options);
export const fromFn = <T>(fn: ProviderFn<T>, options: IProviderOptions = { resolving: 'perRequest' }): IProvider<T> =>
    createProvider(fn, options);
export const fromInstance = <T>(instance: T, options: IProviderOptions = { resolving: 'perRequest' }): IProvider<T> =>
    createProvider(() => instance, options);
export const fromConstructor = <T>(
    value: constructor<T>,
    options: IProviderOptions = { resolving: 'perRequest' },
): IProvider<T> => createProvider((l, ...args) => l.resolve(value, ...args), options);
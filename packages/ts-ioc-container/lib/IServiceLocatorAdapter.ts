import { InjectionToken, RegistrationKey, IProviderOptions, RegistrationFn } from 'index';
import { constructor } from 'IServiceLocator';

export interface IServiceLocatorAdapter {
    createContainer(): IServiceLocatorAdapter;

    remove(): void;

    resolve<T>(c: InjectionToken<T>, ...deps: any[]): T;

    registerConstructor<T>(key: RegistrationKey, value: constructor<T>, options?: IProviderOptions): this;

    registerInstance<T>(key: RegistrationKey, value: T): this;

    registerFunction<T>(key: RegistrationKey, resolveFn: RegistrationFn<T>, options?: IProviderOptions): this;
}

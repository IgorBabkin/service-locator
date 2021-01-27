import { InjectionToken } from './strategy/ioc/decorators';
import { IProviderOptions, RegistrationFn, RegistrationKey } from './IRegistration';

export type constructor<T> = new (...args: any[]) => T;

export type Factory<T> = (...args: any[]) => T;

export interface IServiceLocator<GContext = any> {
    context?: GContext;

    createContainer<GChildContext>(context?: GChildContext): IServiceLocator<GChildContext>;

    remove(): void;

    resolve<T>(c: InjectionToken<T>, ...deps: any[]): T;

    registerConstructor<T>(key: RegistrationKey, value: constructor<T>, options?: IProviderOptions): this;

    registerInstance<T>(key: RegistrationKey, value: T): this;

    registerFunction<T>(key: RegistrationKey, resolveFn: RegistrationFn<T>, options?: IProviderOptions): this;
}

import { InjectionToken } from './strategy/ioc/decorators';
import { ProviderKey, IProvider } from './IRegistration';

export type constructor<T> = new (...args: any[]) => T;

export type Factory<T> = (...args: any[]) => T;

export interface IServiceLocator {
    createContainer(): IServiceLocator;

    remove(): void;

    resolve<T>(c: InjectionToken<T>, ...deps: any[]): T;

    registerProvider<T>(key: ProviderKey<T>, value: IProvider<T>): this;
}

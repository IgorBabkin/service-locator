import { InjectionToken } from './strategy/ioc/decorators';
import { IProviderOptions, ResolvingFn, ProviderKey } from './IRegistration';
import { constructor } from './IServiceLocator';

export interface IServiceLocatorAdapter {
    createContainer(): IServiceLocatorAdapter;

    remove(): void;

    resolve<T>(c: InjectionToken<T>, ...deps: any[]): T;

    registerConstructor<T>(key: ProviderKey<T>, value: constructor<T>, options?: IProviderOptions): this;

    registerInstance<T>(key: ProviderKey<T>, value: T): this;

    registerFunction<T>(key: ProviderKey<T>, resolveFn: ResolvingFn<T>, options?: IProviderOptions): this;
}

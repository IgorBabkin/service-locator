import { constructor, IServiceLocator } from './IServiceLocator';
import { InjectionToken } from './strategy/ioc/decorators';
import { IProviderOptions, RegistrationFn, RegistrationKey } from './IRegistration';
import { IServiceLocatorAdapter } from 'IServiceLocatorAdapter';

export class ServiceLocatorAdapter implements IServiceLocatorAdapter {
    constructor(private adapted: IServiceLocator) {}

    public resolve<T>(key: InjectionToken<T>, ...deps: any[]): T {
        return this.adapted.resolve(key, ...deps);
    }

    public createContainer(): ServiceLocatorAdapter {
        return new ServiceLocatorAdapter(this.adapted.createContainer());
    }

    public remove(): void {
        this.adapted.remove();
    }

    public registerConstructor<T>(key: RegistrationKey, value: constructor<T>, options: IProviderOptions): this {
        this.adapted.registerFunction(key, (l, ...deps: any[]) => l.resolve(value, ...deps), options);
        return this;
    }

    public registerInstance<T>(key: RegistrationKey, value: T): this {
        this.adapted.registerFunction(key, () => value);
        return this;
    }

    public registerFunction<T>(key: RegistrationKey, resolveFn: RegistrationFn<T>, options: IProviderOptions): this {
        this.adapted.registerFunction(key, resolveFn, options);
        return this;
    }
}

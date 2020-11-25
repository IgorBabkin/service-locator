import { constructor, IServiceLocator } from './IServiceLocator';
import { IServiceLocatorAdapter } from './IServiceLocatorAdapter';
import { InjectionToken } from './strategy/ioc/decorators';
import { IProviderOptions, ResolvingFn, ProviderKey } from './IRegistration';
import { IProviderFactory } from 'IProviderFactory';

export class ServiceLocatorAdapter implements IServiceLocatorAdapter {
    constructor(private adapted: IServiceLocator, private providerFactory: IProviderFactory) {}

    public resolve<T>(key: InjectionToken<T>, ...deps: any[]): T {
        return this.adapted.resolve(key, ...deps);
    }

    public createContainer(): ServiceLocatorAdapter {
        return new ServiceLocatorAdapter(this.adapted.createContainer(), this.providerFactory);
    }

    public remove(): void {
        this.adapted.remove();
    }

    public registerConstructor<T>(
        key: ProviderKey<T>,
        value: constructor<T>,
        options: IProviderOptions = { resolving: 'perRequest' },
    ): this {
        this.adapted.registerProvider(
            key,
            this.providerFactory.create((l, ...deps: any[]) => l.resolve(value, ...deps), options),
        );
        return this;
    }

    public registerInstance<T>(key: ProviderKey<T>, value: T): this {
        this.adapted.registerProvider(
            key,
            this.providerFactory.create(() => value),
        );
        return this;
    }

    public registerFunction<T>(key: ProviderKey<T>, resolveFn: ResolvingFn<T>, options?: IProviderOptions): this {
        this.adapted.registerProvider(key, this.providerFactory.create(resolveFn, options));
        return this;
    }
}

import {
    ProviderKey,
    IProvider,
    IServiceLocatorStrategy,
    IStrategyFactory,
    InjectionToken,
    IProviderOptions,
    ResolvingFn,
} from 'index';
import { IProviderFactory } from 'IProviderFactory';
import { constructor, IServiceLocator } from 'IServiceLocator';

export class ServiceLocator implements IServiceLocator {
    private providers = new Map<ProviderKey<any>, IProvider<any>>();
    private parent: ServiceLocator;
    private strategy: IServiceLocatorStrategy;

    constructor(private strategyFactory: IStrategyFactory, private providerFactory: IProviderFactory) {
        this.strategy = strategyFactory.create(this);
    }

    resolve<T>(key: InjectionToken<T>, ...deps: any[]): T {
        const instance = this.resolveLocally(key, ...deps) || this.parent?.resolve<T>(key, ...deps);
        if (!instance) {
            throw new Error(`ServiceLocator: cannot find ${key.toString()}`);
        }
        return instance;
    }

    createContainer(): IServiceLocator {
        const locator = new ServiceLocator(this.strategyFactory, this.providerFactory);
        locator.addTo(this);
        for (const [key, provider] of this.providers.entries()) {
            if (provider.resolving === 'perScope') {
                locator.registerProvider(key, provider.clone({ resolving: 'singleton' }));
            }
        }
        return locator;
    }

    remove(): void {
        this.parent = null;
        for (const provider of this.providers.values()) {
            provider.dispose();
        }
        this.providers = new Map();
        this.strategy.dispose();
    }

    addTo(locator: ServiceLocator): this {
        this.parent = locator;
        return this;
    }

    registerProvider<T>(key: ProviderKey<T>, provider: IProvider<T>): this {
        this.providers.set(key, provider);
        provider.bindTo(this);
        return this;
    }

    private resolveLocally<T>(key: ProviderKey<T>, ...args: any): T {
        const isConstructor = typeof key === 'function';
        if (isConstructor && !this.providers.has(key)) {
            this.registerConstructor(key as constructor<T>, ...args);
        }
        return this.providers.get(key)?.resolve(...args);
    }

    private registerConstructor<T>(key: constructor<T>, ...args: any): this {
        this.registerProvider(
            key,
            this.providerFactory.create(() => this.strategy.resolveConstructor(key as constructor<T>, ...args)),
        );
        return this;
    }
}

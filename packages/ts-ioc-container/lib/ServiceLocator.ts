import { IServiceLocator } from './IServiceLocator';
import { InjectionToken } from './strategy/ioc/decorators';
import { IServiceLocatorStrategy } from './strategy/IServiceLocatorStrategy';
import { IProvider, ProviderFn, ProviderKey } from './provider/IProvider';
import { constructor } from './helpers/types';
import { DependencyNotFoundError } from './errors/DependencyNotFoundError';
import { IHook } from './hooks/IHook';
import { Hook } from './hooks/Hook';

export class ServiceLocator<GContext> implements IServiceLocator<GContext> {
    private providers: Map<ProviderKey, IProvider<any>> = new Map();
    private instances: Map<ProviderKey, any> = new Map();
    private parent: ServiceLocator<unknown>;

    constructor(
        private strategy: IServiceLocatorStrategy,
        private hook: IHook = new Hook([]),
        public context?: GContext,
    ) {
        this.strategy.bindTo(this);
    }

    public register(key: ProviderKey, provider: IProvider<unknown>): this {
        this.providers.set(key, provider);
        return this;
    }

    public resolve<T>(key: InjectionToken<T>, ...deps: any[]): T {
        if (typeof key === 'string' || typeof key === 'symbol') {
            const instance = this.resolveLocally<T>(key, ...deps) || this.parent?.resolve<T>(key, ...deps);
            if (!instance) {
                throw new DependencyNotFoundError(key.toString());
            }
            return instance;
        }
        return this.resolveConstructor(key, ...deps);
    }

    public createContainer<GChildContext>(context?: GChildContext): IServiceLocator<GChildContext> {
        const locator = new ServiceLocator(this.strategy.clone(), this.hook.clone(), context);
        locator.addTo(this);
        for (const [key, provider] of this.providers.entries()) {
            switch (provider.options.resolving) {
                case 'perScope':
                    locator.register(key, provider.clone({ resolving: 'singleton' }));
                    break;
                case 'perRequest':
                    locator.register(key, provider.clone());
            }
        }
        return locator;
    }

    public remove(): void {
        this.hook.onContainerRemove();
        this.parent = null;
        this.instances = new Map();
        this.providers = new Map();
        this.hook.dispose();
        this.strategy.dispose();
    }

    public addTo(locator: ServiceLocator<unknown>): this {
        this.parent = locator;
        return this;
    }

    private resolveLocally<T>(key: ProviderKey, ...deps: any[]): T {
        const provider = this.providers.get(key);
        if (provider) {
            const { resolving, argsFn } = provider.options;
            switch (resolving) {
                case 'perRequest':
                    return this.resolveFn(provider.fn, ...deps, ...argsFn(this));
                case 'singleton':
                    return this.resolveSingleton(key, provider.fn, ...deps, ...argsFn(this));
            }
        }
        return undefined;
    }

    private resolveFn<T>(fn: ProviderFn<T>, ...deps: any[]): T {
        const instance = fn(this, ...deps);
        this.hook.onInstanceCreate(instance);
        return instance;
    }

    private resolveSingleton<T>(key: ProviderKey, value: ProviderFn<T>, ...deps: any[]): T {
        if (!this.instances.has(key)) {
            const instance = this.resolveFn(value, ...deps);
            this.instances.set(key, instance);
        }

        return this.instances.get(key) as T;
    }

    private resolveConstructor<T>(c: constructor<T>, ...deps: any[]): T {
        const instance = this.strategy.resolveConstructor<T>(c, ...deps);
        this.hook.onInstanceCreate(instance);
        return instance;
    }
}

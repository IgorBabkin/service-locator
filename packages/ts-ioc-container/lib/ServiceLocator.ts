import { constructor, IServiceLocator } from './IServiceLocator';
import { InjectionToken } from './strategy/ioc/decorators';
import { IServiceLocatorStrategy } from './strategy/IServiceLocatorStrategy';
import { IProviderOptions, IRegistration, RegistrationFn, RegistrationKey } from './IRegistration';
import { IInstanceHook } from './instanceHooks/IInstanceHook';
import { IStrategyFactory } from './strategy/IStrategyFactory';
import { IInjectable } from 'instanceHooks/IInjectable';

export class ServiceLocator implements IServiceLocator {
    private registrations: Map<RegistrationKey, IRegistration<any>> = new Map();
    private singletons: Map<RegistrationKey, IInjectable> = new Map();
    private parent: ServiceLocator;
    private strategy: IServiceLocatorStrategy;
    private instances: IInjectable[] = [];

    constructor(private strategyFactory: IStrategyFactory, private hooks: IInstanceHook) {
        this.strategy = strategyFactory.create(this);
    }

    public resolve<T>(key: InjectionToken<T>, ...deps: any[]): T {
        if (typeof key === 'string' || typeof key === 'symbol') {
            const instance = this.resolveLocally<T>(key, ...deps) || this.parent?.resolve<T>(key, ...deps);
            if (!instance) {
                throw new Error(`ServiceLocator: cannot find ${key.toString()}`);
            }
            return instance;
        }
        return this.resolveConstructor(key, ...deps);
    }

    public createContainer(): IServiceLocator {
        const locator = new ServiceLocator(this.strategyFactory, this.hooks);
        locator.addTo(this);
        for (const [key, { options, fn }] of this.registrations.entries()) {
            if (options?.resolving === 'perScope') {
                locator.registerFunction(key, fn, { resolving: 'singleton' });
            }
        }
        return locator;
    }

    public remove(): void {
        this.parent = null;
        for (const instance of [...this.singletons.values(), ...this.instances.values()]) {
            this.hooks.onRemoveInstance(instance);
        }
        this.singletons = new Map();
        this.registrations = new Map();
        this.strategy.dispose();
    }

    public addTo(locator: ServiceLocator): this {
        this.parent = locator;
        return this;
    }

    public registerFunction<T>(
        key: RegistrationKey,
        resolveFn: RegistrationFn<T>,
        options: IProviderOptions = { resolving: 'perRequest' },
    ): this {
        this.registrations.set(key, {
            fn: resolveFn,
            options,
        });
        return this;
    }

    private resolveLocally<T>(key: RegistrationKey, ...deps: any[]): T {
        const registration = this.registrations.get(key);
        if (registration) {
            switch (registration.options.resolving) {
                case 'perRequest':
                    return this.resolveFn(registration.fn, ...deps);
                case 'singleton':
                    return this.resolveSingleton(key, registration.fn, ...deps);
                default:
                    throw new Error('Unsupported resolving key');
            }
        }
        return undefined;
    }

    private resolveFn<T>(fn: RegistrationFn<T>, ...deps: any[]): T {
        const instance = fn(this, ...deps);
        this.hooks.onCreateInstance(instance);
        this.instances.push(instance);
        return instance;
    }

    private resolveSingleton<T>(key: RegistrationKey, fn: RegistrationFn<T>, ...deps: any[]): T {
        if (!this.singletons.has(key)) {
            const instance = fn(this, ...deps);
            this.hooks.onCreateInstance(instance);
            this.singletons.set(key, instance);
        }

        return this.singletons.get(key) as T;
    }

    private resolveConstructor<T>(c: constructor<T>, ...deps: any[]): T {
        const instance = this.strategy.resolveConstructor(c, ...deps);
        this.hooks.onCreateInstance(instance);
        this.instances.push(instance);
        return instance;
    }
}

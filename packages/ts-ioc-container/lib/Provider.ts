import { IInstanceHook } from 'instanceHooks/IInstanceHook';
import { IServiceLocator } from 'IServiceLocator';
import { IProvider, ResolvingFn, IProviderOptions, Resolving } from './IRegistration';

export class Provider<T> implements IProvider<T> {
    private locator: IServiceLocator;
    private instances: T[] = [];

    constructor(
        private resolvingFn: ResolvingFn<T>,
        private hooks: IInstanceHook,
        private options: IProviderOptions = { resolving: 'perRequest' },
    ) {}

    get resolving(): Resolving {
        return this.options.resolving;
    }

    resolve(...args: any[]): T {
        switch (this.options.resolving) {
            case 'singleton':
                return this.resolveSingleton(...args);

            case 'perRequest':
                return this.resolvePerRequest(...args);

            default:
                throw new Error('Unsupported resolving type');
        }
    }

    dispose(): void {
        for (const i of this.instances) {
            this.hooks.onRemoveInstance(i);
        }
        this.instances = [];
    }

    bindTo(locator: IServiceLocator) {
        this.locator = locator;
        return this;
    }

    clone(options: IProviderOptions = { resolving: 'perRequest' }): Provider<T> {
        return new Provider(this.resolvingFn, this.hooks, {
            ...this.options,
            ...options,
        });
    }

    private resolveSingleton(...args: any): T {
        if (this.instances.length === 0) {
            this.instances[0] = this.resolveFn(...args);
        }
        return this.instances[0];
    }

    private resolvePerRequest(...args: any): T {
        const instance = this.resolveFn(...args);
        this.instances.push(instance);
        return instance;
    }

    private resolveFn(...args: any): T {
        if (!this.locator) {
            throw new Error('Locator is not provided');
        }
        const instance = this.resolvingFn(this.locator, ...args);
        this.hooks.onCreateInstance(instance);
        return instance;
    }
}

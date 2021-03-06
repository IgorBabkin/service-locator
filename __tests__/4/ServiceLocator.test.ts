import 'reflect-metadata';
import {
    HookServiceLocator,
    IInstanceHook,
    InstanceHookInjector,
    InstanceHookProvider,
    IocInjector,
    IocServiceLocatorStrategyOptions,
    IProvider,
    ProviderRepository,
    ServiceLocator,
} from '../../lib';
import { App, App2, App3, App4, Logger, Logger2, Logger3, OnConstructImpl } from './OnConstructImpl';
import { Group } from './Group';
import { OnDisposeImpl } from './OnDisposeImpl';
import {
    constructorMetadataCollector,
    fromConstructor,
    fromFn,
    fromInstance,
    instanceHook,
    onConstructMetadataCollector,
    onDisposeMetadataCollector,
} from './decorators';
import { SubGroup3 } from './SubGroup3';
import { emptyHook } from '../emptyHook';

describe('ServiceLocator', () => {
    const createIoCLocator = (hook: IInstanceHook = emptyHook, options?: IocServiceLocatorStrategyOptions) => {
        return new HookServiceLocator(
            new ServiceLocator(
                () => new InstanceHookInjector(new IocInjector(constructorMetadataCollector, options), hook),
                new ProviderRepository(),
            ),
            {
                onBeforeRegister<T>(provider: IProvider<T>): IProvider<T> {
                    return new InstanceHookProvider(provider, hook);
                },
            },
        );
    };

    it('should create an instanse', () => {
        const locator = createIoCLocator().register('key1', fromFn(() => ({})).asRequested());

        expect(locator.resolve('key1')).not.toBe(locator.resolve('key1'));
    });

    it('should create a singleton', () => {
        const locator = createIoCLocator().register('key1', fromFn(() => ({})).asSingleton());

        expect(locator.resolve('key1')).toBe(locator.resolve('key1'));
    });

    describe('scope', () => {
        it('should override parent', () => {
            const expectedInstance1 = { id: 1 };
            const expectedInstance2 = { id: 2 };

            const locator = createIoCLocator().register('key1', fromInstance(expectedInstance1).asRequested());

            const child = locator.createLocator().register('key1', fromInstance(expectedInstance2).asRequested());

            expect(locator.resolve('key1')).toBe(expectedInstance1);
            expect(child.resolve('key1')).toBe(expectedInstance2);
        });

        it('is available to get parent deps from child', () => {
            const expectedInstance1 = {};

            const locator = createIoCLocator().register('key1', fromInstance(expectedInstance1).asRequested());

            const child = locator.createLocator();

            expect(child.resolve('key1')).toBe(expectedInstance1);
        });

        it('is not available to get child deps from parent', () => {
            const expectedInstance1 = {};

            const locator = createIoCLocator();

            locator.createLocator().register('key1', fromInstance(expectedInstance1).asRequested());

            expect(() => locator.resolve('key1')).toThrow();
        });

        it('returns the same singleton for child and parent', () => {
            const locator = createIoCLocator().register('key1', fromFn(() => ({})).asSingleton());

            const child = locator.createLocator();

            expect(child.resolve('key1')).toBe(locator.resolve('key1'));
        });

        it('clears container', () => {
            const locator = createIoCLocator().register('key1', fromInstance({}).asRequested());

            const child = locator.createLocator();

            expect(child.resolve('key1')).toBeDefined();

            child.dispose();

            expect(() => child.resolve('key1')).toThrow();
        });

        it('should remove sub-sub-child', () => {
            const expectedInstance = { opa: '11' };

            const locator = createIoCLocator()
                .register('key1', fromFn(() => expectedInstance).asScoped())
                .register('key2', fromFn(() => ({})).asScoped());

            const child1 = locator.createLocator();
            const child2 = child1.createLocator();

            expect(child2.resolve('key1')).toBe(expectedInstance);
            expect(child1.resolve('key1')).toBe(expectedInstance);
            expect(child1.resolve('key2')).not.toBe(child1.resolve('key1'));

            expect(() => locator.resolve('key1')).toThrow();

            child2.dispose();
            expect(() => child2.resolve('key1')).toThrow();
            expect(child1.resolve('key1')).toBe(expectedInstance);
            expect(() => locator.resolve('key1')).toThrow();
            child1.dispose();

            expect(() => child1.resolve('key1')).toThrow();
            expect(() => locator.resolve('key1')).toThrow();
        });

        it('ioc1', () => {
            const expected = ['KEY1_VALUE', 'p2', 'p3', 'KEY2_VALUE', '1', '2', 'KEY1_VALUE', 'KEY2_VALUE'];

            const decorated = createIoCLocator()
                .register('key1', fromInstance('KEY1_VALUE').asRequested())
                .register('key2', fromInstance('KEY2_VALUE').asRequested())
                .register('key3', fromConstructor(SubGroup3).asRequested());

            const group = decorated.resolve(Group, 'p2', 'p3');
            const result = group.privet();

            expect(result).toEqual(expected);
        });

        it('ioc2', () => {
            const expected = {};

            const locator = createIoCLocator().register('key1', fromFn(() => expected).asRequested());

            const child1 = locator.createLocator();

            expect(child1.resolve('key1')).toEqual(locator.resolve('key1'));

            child1.dispose();

            const child2 = locator.createLocator();
            expect(child2.resolve('key1')).toEqual(locator.resolve('key1'));

            child2.dispose();
        });

        it('ios: onConstructHook', () => {
            const decorated = createIoCLocator({
                onConstruct<GInstance>(instance: GInstance) {
                    onConstructMetadataCollector.invokeHooksOf(instance);
                },
                onDispose<GInstance>(instance: GInstance) {},
            });

            const group = decorated.resolve(OnConstructImpl);

            expect(group.isConstructed).toBeTruthy();
        });

        it('ios: onDisposeHook', () => {
            const decorated = createIoCLocator({
                onConstruct<GInstance>(instance: GInstance) {},
                onDispose<GInstance>(instance: GInstance) {
                    onDisposeMetadataCollector.invokeHooksOf(instance);
                },
            });

            const group = decorated.resolve(OnDisposeImpl);

            expect(group.isDisposed).toBeFalsy();
            decorated.dispose();
            expect(group.isDisposed).toBeTruthy();
        });

        it('passes params to constructor(instance) in decorator', () => {
            const decorated = createIoCLocator();

            decorated.register('logger', fromConstructor(Logger).asRequested());
            const app = decorated.resolve(App);

            expect(app.run()).toBe('super');
        });

        it('passes params to constructor(autofactory) in decorator', () => {
            const decorated = createIoCLocator();

            decorated.register('logger2', fromConstructor(Logger2).asRequested());
            const app = decorated.resolve(App2);

            expect(app.run()).toBe('superduper');
        });

        it('passes arguments on registering', () => {
            const decorated = createIoCLocator();

            decorated.register('logger3', fromFn((l, ...args) => l.resolve(Logger3, 'super', ...args)).asRequested());
            const app = decorated.resolve(App3);

            expect(app.run()).toBe('superduper');
        });

        it('passes locator as last dep', () => {
            const decorated = createIoCLocator(
                {
                    onConstruct<GInstance>(instance: GInstance) {},
                    onDispose<GInstance>(instance: GInstance) {},
                },
                { simpleInjectionCompatible: true },
            );

            decorated.register('dep1', fromInstance('dep1').asRequested());
            decorated.register('dep2', fromInstance('dep2').asRequested());
            const app = decorated.resolve(App4);

            expect(app.run()).toBe('dep1dep2');
        });
    });
});

import { InstanceHook } from './instanceHooks/InstanceHook';
import { IocServiceLocatorStrategyFactory } from './strategy/IocServiceLocatorStrategyFactory';
import { SimpleServiceLocatorStrategyFactory } from './strategy/SimpleServiceLocatorStrategyFactory';
import { ServiceLocatorAdapter } from 'ServiceLocatorAdapter';
import { ProviderFactory } from 'ProviderFactory';
import { IServiceLocatorAdapter } from 'IServiceLocatorAdapter';
import { ServiceLocator } from './ServiceLocator';

export class ServiceLocatorFactory {
    public createIoCLocator(): IServiceLocatorAdapter {
        const providerFactory = new ProviderFactory(new InstanceHook());
        const strategyFactory = new IocServiceLocatorStrategyFactory();
        return new ServiceLocatorAdapter(new ServiceLocator(strategyFactory, providerFactory), providerFactory);
    }

    public createSimpleLocator(): IServiceLocatorAdapter {
        const providerFactory = new ProviderFactory(new InstanceHook());
        const strategyFactory = new SimpleServiceLocatorStrategyFactory();
        return new ServiceLocatorAdapter(new ServiceLocator(strategyFactory, providerFactory), providerFactory);
    }
}

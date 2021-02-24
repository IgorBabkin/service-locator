import { constructor } from '../../helpers/types';
import { IServiceLocator } from '../../IServiceLocator';
import { IServiceLocatorStrategy } from '../IServiceLocatorStrategy';
import { IInjectMetadataCollector } from './IInjectMetadataCollector';
import { InjectionItem } from './InjectMetadataCollector';

export class IocServiceLocatorStrategy implements IServiceLocatorStrategy {
    private locator: IServiceLocator;

    constructor(private metadataCollector: IInjectMetadataCollector) {}

    resolveConstructor<T>(value: constructor<T>, ...deps: any[]): T {
        const injectionItems = this.metadataCollector.getMetadata(value);
        return new value(...injectionItems.map((item) => this.resolveItem(item)), ...deps, this.locator);
    }

    private resolveItem({ token, type, argsFn }: InjectionItem<any>): any {
        switch (type) {
            case 'instance':
                return this.locator.resolve(token, ...argsFn(this.locator));

            case 'factory':
                return (...args2: any[]) => this.locator.resolve(token, ...argsFn(this.locator), ...args2);
        }
    }

    dispose(): void {
        this.locator = undefined;
    }

    bindTo(locator: IServiceLocator): void {
        this.locator = locator;
    }

    clone(): IServiceLocatorStrategy {
        return new IocServiceLocatorStrategy(this.metadataCollector);
    }
}

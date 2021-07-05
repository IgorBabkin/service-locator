import { IProvider } from './IProvider';
import { ProviderNotClonedError } from '../../errors/ProviderNotClonedError';
import { IServiceLocator } from '../IServiceLocator';

export class SingletonProvider<T> implements IProvider<T> {
    canBeCloned = false;
    private instance: T | undefined;

    constructor(private decorated: IProvider<T>) {}

    clone(): IProvider<T> {
        throw new ProviderNotClonedError('Cannot clone singleton provider');
    }

    dispose(): void {
        this.instance = undefined;
        this.decorated.dispose();
    }

    resolve(locator: IServiceLocator, ...args: any[]): T {
        if (this.instance === undefined) {
            this.instance = this.decorated.resolve(locator, ...args);
        }

        return this.instance;
    }
}
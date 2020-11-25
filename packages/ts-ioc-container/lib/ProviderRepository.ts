import { IProviderRepository } from 'IProviderRepository';
import { ProviderKey } from 'IRegistration';
import { Provider } from 'Provider';

import { ProviderKey, IProvider } from './IRegistration';

export class ProviderRepository implements IProviderRepository {
    private providers = new Map<ProviderKey<any>, IProvider<any>>();

    has<T>(key: ProviderKey<T>): boolean {
        return this.providers.has(key);
    }

    set<T>(key: ProviderKey<T>, provider: IProvider<T>): void {
        this.providers.set(key, provider);
    }

    get<T>(key: ProviderKey<T>): IProvider<T> {
        return this.providers.get(key);
    }
}

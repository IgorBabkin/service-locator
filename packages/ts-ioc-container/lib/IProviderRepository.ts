import { IProvider, ProviderKey } from 'IRegistration';

export interface IProviderRepository {
    has<T>(key: ProviderKey<T>): boolean;
    set<T>(key: ProviderKey<T>, provider: IProvider<T>): void;
    get<T>(key: ProviderKey<T>): IProvider<T>;
}

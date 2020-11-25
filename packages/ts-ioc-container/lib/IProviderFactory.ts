import { IProvider, IProviderOptions, ResolvingFn } from 'IRegistration';

export interface IProviderFactory {
    create<T>(resolving: ResolvingFn<T>, options?: IProviderOptions): IProvider<T>;
}

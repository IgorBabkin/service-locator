import { IInstanceHook, ResolvingFn, IProviderOptions, IProvider } from 'index';
import { IProviderFactory } from 'IProviderFactory';
import { Provider } from 'Provider';

export class ProviderFactory implements IProviderFactory {
    constructor(private hooks: IInstanceHook) {}

    create<T>(resolvingFn: ResolvingFn<T>, options?: IProviderOptions): IProvider<T> {
        return new Provider(resolvingFn, this.hooks, options);
    }
}

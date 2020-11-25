import { IDisposable } from './IDisposable';
import { constructor, IServiceLocator } from './IServiceLocator';

export type Resolving = 'singleton' | 'perScope' | 'perRequest';

export interface IProviderOptions {
    resolving?: Resolving;
}

export type ResolvingFn<T> = (locator: IServiceLocator, ...args: any[]) => T;

export type ProviderFn<T> = (...args: any[]) => T;

export interface IProvider<T> extends IDisposable {
    resolving: Resolving;
    resolve(...args: any[]): T;
    clone(options?: IProviderOptions): IProvider<T>;
    bindTo(locator: IServiceLocator): this;
}

export type ProviderKey<T> = string | symbol | constructor<T>;

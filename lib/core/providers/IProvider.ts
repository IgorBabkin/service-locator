import { IServiceLocator } from '../IServiceLocator';
import { IDisposable } from '../../helpers/IDisposable';

export type ProviderFn<T> = (locator: IServiceLocator, ...args: any[]) => T;

export interface IProvider<T> extends IDisposable {
    clone(): IProvider<T> | undefined;

    resolve(locator: IServiceLocator, ...args: any[]): T;
}

export type ProviderKey = string | symbol;

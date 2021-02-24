import { IHooksMetadataCollector } from '../IHooksMetadataCollector';
import { IInstanceHook } from '../../IInstanceHook';

export const ON_DISPOSE_HOOK_KEY = Symbol('ON_DISPOSE_HOOK_KEY');

export class OnDisposeHook implements IInstanceHook {
    constructor(private metadata: IHooksMetadataCollector) {}

    public onCreate(instance: any): void {
        if (!(instance instanceof Object)) {
            return;
        }
        for (const hookKey of this.metadata.getHookMethods(ON_DISPOSE_HOOK_KEY, instance)) {
            typeof instance[hookKey] === 'function' && instance[hookKey]();
        }
    }
}

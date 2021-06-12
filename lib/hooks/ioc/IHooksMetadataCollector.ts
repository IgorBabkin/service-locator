export type HOOK_KEY = string | symbol;

export interface IHooksMetadataCollector {
    // eslint-disable-next-line @typescript-eslint/ban-types
    addHookMethod(hookKey: HOOK_KEY, target: object, propertyKey: string | symbol): void;

    // eslint-disable-next-line @typescript-eslint/ban-types
    getHookMethods(hookKey: HOOK_KEY, target: object): string[];
}
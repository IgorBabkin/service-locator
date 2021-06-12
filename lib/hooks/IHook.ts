import { ProviderKey } from '../provider/IProvider';

export interface IHook {
    onInstanceCreate<GInstance>(instance: GInstance): void;

    onContainerRemove(): void;

    onDependencyNotFound<GInstance>(key: ProviderKey, ...args: any[]): GInstance | undefined;

    clone(): IHook;
}

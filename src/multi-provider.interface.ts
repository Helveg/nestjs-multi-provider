import type { ModuleMetadata, Provider, Type } from '@nestjs/common'

export interface ModuleWithMultiMetadata extends ModuleMetadata {
    providers?: ProviderWithMulti[]
}

export type MultiProvider<T = any> = Exclude<Provider<T>, Type<T>> & {
    multi?: boolean
    standalone?: boolean
}

export type ProviderWithMulti<T = any> = MultiProvider<T> | Type<T>

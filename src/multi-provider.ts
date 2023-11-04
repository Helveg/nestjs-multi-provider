import util = require('util')
import type { DynamicModule, ForwardReference, InjectionToken, Provider } from '@nestjs/common'
import { MultiProvider, ProviderWithMulti } from './multi-provider.interface'
import { forwardRef, Module } from '@nestjs/common'

type MultiReference = readonly [token: InjectionToken, ref: ForwardReference, standalone: Provider | false]

const multiProviderRegistry = new Map<InjectionToken, MultiReference[]>()

function multiProvide<T = any>(provider: ProviderWithMulti<T>, module: Function): Provider<T> | null {
    const token: InjectionToken<T> = Symbol(util.inspect(provider, { breakLength: 9999 }))
    let replacementProvider: Provider<T>,
        originalToken: InjectionToken<T>,
        standalone = false
    if (typeof provider === 'function') {
        originalToken = provider
        replacementProvider = { provide: token, useClass: provider }
    } else {
        originalToken = provider.provide
        standalone = provider.standalone ?? true
        replacementProvider = { ...provider, provide: token }
    }
    const collection = multiProviderRegistry.get(originalToken)
    const reference = [token, forwardRef(() => module), standalone ? replacementProvider : false] as const
    if (collection) {
        collection.push(reference)
    } else {
        multiProviderRegistry.set(originalToken, [reference])
    }
    return standalone ? null : replacementProvider
}

/**
 * Collect all array providers for a certain injection token. Needs to be used
 * in conjunction with the `ResourceModule` decorator. Can only collect providers
 * that were passed in the `arrayProviders` module metadata. The following example
 * would provide `[MyProvider, MyProvider2]` for `token`.
 * @param token The token for which to collect all provided values into an array.
 * @returns A dynamic module, to be added to the `imports` of a module.
 * @example
 * \@ResourceModule({
 *   arrayProviders: [
 *     {provide: token, useClass: MyProvider},
 *     {provide: token, useClass: MyProvider2}
 *   ]
 * })
 * export class MyModule {}
 *
 * \@Module({
 *   imports: [collect(token)]
 * }
 * export class MyOtherModule {}
 */
export function collect(token: InjectionToken): Promise<DynamicModule> {
    // Create a shim module that can import the modules of the internal individual
    // providers and assemble the array provider.
    @Module({ exports: [token] })
    class CollectionModule {}

    Object.defineProperty(CollectionModule, 'name', { value: `CollectionModule(${String(token)})` })

    return new Promise((resolve) =>
        // Use setTimeout to ensure that this code runs after all providers have been
        // collected at import time.
        setTimeout(() => {
            // Load the tokens and module references from the registry
            const collection = multiProviderRegistry.get(token) ?? []
            const standalones = collection.map(([, , standalone]) => standalone).filter((v): v is Provider => !!v)
            const inject = collection.map(([token]) => token)
            const imports = collection.filter(([, , standalone]) => !standalone).map(([, ref]) => ref)
            resolve({
                module: CollectionModule,
                providers: [
                    ...standalones,
                    // Create an array provider injecting all the registered ability factories
                    {
                        provide: token,
                        useFactory: (...factories) => factories,
                        inject,
                    },
                ],
                // Import all the ability factory module forward references.
                imports,
            })
        })
    )
}

export function isMultiProvider(provider: ProviderWithMulti): provider is MultiProvider {
    return typeof provider !== 'function' && provider.multi
}

function getTokenFromProvider(provider: Provider) {
    if (typeof provider === 'function') {
        return provider
    } else {
        return provider.provide
    }
}

function assertMultiProvide(provider: ProviderWithMulti) {
    if (!isMultiProvider(provider) && multiProviderRegistry.has(getTokenFromProvider(provider))) {
        throw new Error(`Multi-provider ${util.inspect(provider)} missing multi.`)
    }
}

export function processMultiProviders(target: Function, providers: ProviderWithMulti[]) {
    providers = providers.reduce((acc, provider) => {
        if (isMultiProvider(provider)) {
            const og = provider
            provider = multiProvide(provider, target)
        }
        if (provider !== null) acc.push(provider)
        return acc
    }, [])
    providers.forEach(assertMultiProvide)
    return providers
}

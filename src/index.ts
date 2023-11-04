export * from './multi-provider.interface'
export * from './multi-provider'

import Module = require('module')
import nest = require('@nestjs/common')
import { processMultiProviders } from './multi-provider'
import type { ModuleWithMultiMetadata } from './multi-provider.interface'
import type { ModuleMetadata } from '@nestjs/common'

const originalRequire = Module.prototype.require

declare module '@nestjs/common' {
    export function Module(metadata: ModuleWithMultiMetadata): ClassDecorator
}

export const ModuleWithMulti = (metadata: ModuleWithMultiMetadata) => (target: Function) =>
    nest.Module(processModuleMetadata(target, metadata))(target)

function processModuleMetadata(target: Function, metadata: ModuleWithMultiMetadata): ModuleMetadata {
    if (metadata.providers) {
        const providers = processMultiProviders(target, metadata.providers)
        const replacedProviders = providers.filter((provider) => !metadata.providers.includes(provider))
        if (replacedProviders.length) {
            metadata.exports = [...(metadata.exports ?? []), ...replacedProviders]
        }
        metadata.providers = providers
    }
    return metadata as ModuleMetadata
}

function patchedRequire() {
    const module = originalRequire.apply(this, arguments)
    if (arguments[0] === '@nestjs/common') {
        return {
            ...module,
            Module: (metadata: ModuleWithMultiMetadata) => (target: Function) =>
                module.Module(processModuleMetadata(target, metadata))(target),
        }
    }
    return module
}

if (Module.prototype.require.toString() !== patchedRequire.toString()) {
    ;(Module.prototype.require as any) = patchedRequire
}

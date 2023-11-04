# Nest.js patch for multi provider pattern

This package patches the [Nest.js](https://nestjs.com/) `Module` decorator so that you can
somewhat straightforwardly use the multi-provider pattern.

## Installation

```
npm install nestjs-multi-provider
```

This package is rather new, and by default relies on monkey patching the `@nestjs/common`
`Module` decorator. If this does not work for you, try using the backup `ModuleWithMulti`
decorator from this package.

### Using the patch

At the top of your root module (most likely `src/app.module.ts`), import the package to activate the patch:

```typescript
import 'nestjs-multi-provider';
```

Whenever you use the `@Module` decorator, it will be a patched version.

### Using the failsafe decorator

Decorate any modules that provide multi-providers with the `ModuleWithMulti` decorator:

```typescript
import { ModuleWithMulti } from "nestjs-multi-provider";

@ModuleWithMulti({
    providers: [{provide: "something", useValue: 1, multi: true}]
})
export class MyModule {}
```

## Usage

**Note:** This document assumes you are using the patch. If for some reason you can't, see 
[the failsafe method](Using-the-failsafe-decorator).

This package adds the `multi` attribute to providers. You can then collect these providers
into an array using the `collect` function in the `imports` attribute of a target module.

### Provide multiple times

Simply use any of the provider patterns NestJS supports, and add the `multi` property. You
can do this from any module, any amount of times. All the providers will ultimately be
available under the same token as an array of provided values.

```typescript
@Module({
    providers: [
        {provide: SOME_TOKEN, useClass: SomeService, multi: true},
        {provide: SOME_TOKEN, useClass: SomeServiceWithDeps, multi: true, standalone: true},
    ]
})
```

**Important:** If your provider has dependencies, you must set `standalone` to `false`.
This will provide the 


### Collect in target module

To access all your providers, use the `collect` function:

```typescript
@Module({
    imports: [collect(SOME_TOKEN)]
})
export class CollectingModule {}
```

You can now inject your array of providers anywhere inside of `CollectingModule`:

```typescript
export class SomeServiceInCollectingModule {
    constructor(@Inject(SOME_TOKEN) collection: any[]) {
        console.log("Collected:", collection)
        // This will print `Collected: [SomeService {}, SomeServiceWithDeps {}]`
    }
}
```

## Important notes

* Your providers are not available unless you use `collect` in the module context.
* `collect` creates a `DynamicModule` and therefor must be placed in the `imports`.
* Your providers are by default considered `standalone` (not having any dependencies),
  and are not actually provided by the module they are declared in, but by the collecting
  `DynamicModule`. This is done to avoid creating needless dependencies between modules.
* If your provider has dependencies, set `standalone` to `false` to have access to the
  declaring module's providers. Doing this will result in a `forwardRef` of the declaring
  module by the collecting module.

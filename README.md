# NestJS patch for multi provider pattern

This package patches the [Nest.js](https://nestjs.com/) `Module` decorator so that you can
somewhat straightforwardly use the multi-provider pattern. This package lets you specify
the `multi` flag to providers. You can then collect these providers into an array using
the `collect` function in the `imports` attribute of a target module, and inject the
collected array of provided values anywhere in the target module.

## Installation

```
npm install nestjs-multi-provider
```

## Usage

A full example is available [here](https://github.com/Helveg/nestjs-multi-provider/tree/main/example).

On the first line of your root module file (most likely `src/app.module.ts`), import the
package to activate the patch:

```typescript
import 'nestjs-multi-provider';
```

**Note:** This package monkey-patches the `Module` decorator, if for some reason you
can't, see [the failsafe method](#Using-the-failsafe-decorator).

### 1. Provide

Simply use any of the provider patterns NestJS supports, and add the `multi` property. You
can do this from any module, any amount of times. All the providers will ultimately be
available under the same token as an array of provided values.

```typescript
@Module({
    providers: [
        {provide: SOME_TOKEN, useClass: SomeService, multi: true},
        {provide: SOME_TOKEN, useClass: SomeServiceWithDeps, multi: true, standalone: false},
    ]
})
```

**Important:** If your provider has dependencies, you must set `standalone` to `false`.

### 2. Collect

To access all your providers, use the `collect` function:

```typescript
@Module({
    imports: [collect(SOME_TOKEN)]
})
export class CollectingModule {}
```

### 3. Inject

You can now inject your array of providers anywhere inside of `CollectingModule`:

```typescript
export class SomeServiceInCollectingModule {
    constructor(@Inject(SOME_TOKEN) collection: any[]) {
        console.log("Collected:", collection)
        // This will print `Collected: [SomeService {}, SomeServiceWithDeps {}]`
    }
}
```

## Using the failsafe decorator

Instead of using the patched `Module` decorator, you can also decorate any modules that
provide multi-providers with the `ModuleWithMulti` decorator:

```typescript
import { ModuleWithMulti } from "nestjs-multi-provider";

@ModuleWithMulti({
    providers: [{provide: "something", useValue: 1, multi: true}]
})
export class MyModule {}
```

## Important notes

* Your providers are not available unless you use `collect`.
* `collect` creates a `DynamicModule` and therefor must be placed in the `imports` property.
* Your providers are by default considered `standalone` (not having any dependencies),
  and are not actually provided by the module they are declared in, but by the collecting
  `DynamicModule`. This is done to avoid creating needless dependencies between modules.
* If your provider has dependencies, set `standalone` to `false` to have access to the
  declaring module's providers. Doing this will result in a `forwardRef` of the declaring
  module by the collecting module.
* Multi providers are not supported in `DynamicModule`s.

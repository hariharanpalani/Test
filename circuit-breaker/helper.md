# Circuit breaker for NestJS: usage guide

Protects your service when a dependency it calls (Typesense, another API, a database proxy) is failing or slow.
After enough failures the circuit **opens**: calls fail immediately instead of waiting on a broken dependency,
which gives the dependency room to recover and keeps your own response times predictable.

Built on [opossum](https://github.com/nodeshift/opossum). You use it by adding the `@UseCircuitBreaker()` decorator to a service method.

## Contents

1. [How it behaves](#how-it-behaves)
2. [Setup](#setup)
3. [Basic usage](#basic-usage)
4. [Fallbacks](#fallbacks)
5. [Sharing a breaker between methods](#sharing-a-breaker-between-methods)
6. [Options](#options)
7. [Ignoring client errors (4xx)](#ignoring-client-errors-4xx)
8. [Calls without a fallback: returning 503](#calls-without-a-fallback-returning-503)
9. [Using the service directly (no decorator)](#using-the-service-directly-no-decorator)
10. [Monitoring breaker state](#monitoring-breaker-state)
11. [Unit testing](#unit-testing)
12. [Rules and limitations](#rules-and-limitations)
13. [Troubleshooting](#troubleshooting)

---

## How it behaves

```
            failures ≥ errorThresholdPercentage
            (with at least volumeThreshold calls)
  ┌────────┐ ─────────────────────────────────────► ┌────────┐
  │ CLOSED │                                        │  OPEN  │  calls rejected instantly
  │ normal │ ◄──────────┐                           │        │  (EOPENBREAKER), upstream
  └────────┘            │                           └────────┘  not called at all
                        │ trial call succeeds            │
                        │                                │ after resetTimeout
                   ┌───────────┐                         │
                   │ HALF-OPEN │ ◄───────────────────────┘
                   │ 1 trial   │ ── trial call fails ──► back to OPEN
                   └───────────┘
```

| State | What happens to a call |
|---|---|
| **Closed** | Runs normally. Successes and failures are counted over a rolling window. |
| **Open** | Rejected immediately with `EOPENBREAKER`. The fallback runs, if you defined one. |
| **Half-open** | One trial call is allowed through. If it succeeds the circuit closes; if it fails the circuit opens again. |

A call that takes longer than `timeout` counts as a failure (`ETIMEDOUT`).

---

## Setup

### 1. Copy the folder

Copy the whole `circuit-breaker/` folder into your project's `src/`:

| File | Required | Purpose |
|---|---|---|
| `circuit-breaker.service.ts` | Yes | Creates and holds the breakers, one per name |
| `circuit-breaker.module.ts` | Yes | Registers the service and the explorer |
| `use-circuit-breaker.decorator.ts` | Yes | The `@UseCircuitBreaker()` decorator |
| `circuit-breaker.explorer.ts` | Yes | Applies the breaker to decorated methods at startup |
| `breaker-open.filter.ts` | Optional | Returns HTTP 503 for open-circuit and timeout errors ([details](#calls-without-a-fallback-returning-503)) |

### 2. Install dependencies

```bash
npm i opossum
npm i -D @types/opossum
```

`tsconfig.json` must have `experimentalDecorators` and `emitDecoratorMetadata` enabled. NestJS projects have both on by default.

### 3. Import the module once

The module is global, so you only import it in `AppModule`:

```ts
import { CircuitBreakerModule } from './circuit-breaker/circuit-breaker.module';

@Module({
  imports: [CircuitBreakerModule /* , ... */],
})
export class AppModule {}
```

### 4. (Optional) Register the 503 filter in `main.ts`

```ts
import { HttpAdapterHost } from '@nestjs/core';
import { BreakerOpenFilter } from './circuit-breaker/breaker-open.filter';

app.useGlobalFilters(new BreakerOpenFilter(app.get(HttpAdapterHost).httpAdapter));
```

On startup the log lists every method that was wrapped:

```
[CircuitBreakerExplorer] SearchService.search -> circuit "typesense"
```

---

## Basic usage

Put the decorator on an **async method of a service** (an `@Injectable()` provider):

```ts
import { Injectable } from '@nestjs/common';
import { UseCircuitBreaker } from '../circuit-breaker/use-circuit-breaker.decorator';

@Injectable()
export class SearchService {
  constructor(private readonly http: HttpService) {}

  @UseCircuitBreaker({ name: 'typesense', timeout: 2000 })
  async search(q: string): Promise<SearchResult> {
    const res = await firstValueFrom(this.http.get('/search', { params: { q } }));
    return res.data;
  }
}
```

Callers don't need to change: `this.searchService.search('abc')` now goes through the breaker.

---

## Fallbacks

A fallback provides a substitute result when the call fails or the circuit is open, so the user gets a
degraded response instead of an error.

### Fallback as a method name (recommended)

Pass the name of a method on the same class. It is called on the same instance, so it can use `this`.

```ts
@UseCircuitBreaker({ name: 'typesense', fallback: 'searchFallback' })
async search(q: string): Promise<SearchResult> {
  return this.callTypesense(q);
}

private searchFallback(err: Error, q: string): SearchResult {
  this.logger.warn(`Search degraded for "${q}": ${err.message}`);
  return { hits: [], degraded: true };
}
```

**Fallback signature:** `(err, ...originalArgs)`. The error comes first, then the same arguments the decorated
method received. The fallback can be sync or async, and it should return the same shape as the decorated method.

`err` tells you why the fallback ran:

| `err.code` / message | Cause |
|---|---|
| `EOPENBREAKER` | The circuit is open; the upstream was not called |
| `ETIMEDOUT` | The call exceeded `timeout` |
| anything else | The error the method itself threw (for example an Axios error) |

### Fallback as a function

Use this when the fallback doesn't need the instance:

```ts
@UseCircuitBreaker({ name: 'typesense', fallback: () => ({ hits: [], degraded: true }) })
```

### Good fallback choices

- An empty or default result marked as degraded, as in the example above
- The last good value from a cache
- A simpler alternative source, such as a PostgreSQL query instead of Typesense

If the fallback itself throws, that error goes to the caller.

### No fallback

Without a fallback, the error is thrown to the caller. Use this when there's no meaningful substitute,
for example when a write must not silently "succeed". See [the 503 filter](#calls-without-a-fallback-returning-503).

---

## Sharing a breaker between methods

Each `name` is one breaker. Methods that call the **same dependency** should use the **same name**, so that
failures from all of them count together and the circuit opens for all of them at once:

```ts
const TYPESENSE = { name: 'typesense', timeout: 2000, resetTimeout: 15000 };

@UseCircuitBreaker({ ...TYPESENSE, fallback: 'searchFallback' })
async search(q: string) { ... }

@UseCircuitBreaker(TYPESENSE)
async getDocument(id: string) { ... }
```

Keep the shared options in one constant, as above. A breaker's options are fixed when it's **first used**,
so two methods that share a name but pass different options would get whichever ran first.

If you leave out `name`, it defaults to `ClassName.methodName`, giving that method its own breaker.

**Rule of thumb:** one breaker name per downstream dependency (`typesense`, `mdm-api`, `uam-api`), not per method.

---

## Options

| Option | Default | Meaning |
|---|---|---|
| `name` | `ClassName.methodName` | Breaker name. Methods with the same name share one breaker. |
| `fallback` | none | Method name or function, called as `(err, ...args)` |
| `timeout` | `3000` ms | A call that runs longer than this counts as a failure (`ETIMEDOUT`). `false` disables it. |
| `errorThresholdPercentage` | `50` | Failure percentage in the window that opens the circuit |
| `volumeThreshold` | `5` | Minimum calls in the window before the circuit is allowed to open |
| `resetTimeout` | `10000` ms | How long the circuit stays open before the half-open trial call |
| `rollingCountTimeout` | `10000` ms | Length of the statistics window |
| `errorFilter` | none | `(err) => boolean`. Return `true` for errors that should **not** count as failures ([see below](#ignoring-client-errors-4xx)) |
| `capacity` | unlimited | Maximum concurrent calls; extra calls are rejected |

These defaults are set in `circuit-breaker.service.ts`. Every other [opossum option](https://nodeshift.dev/opossum/)
is passed through unchanged.

**Choosing values:**
- `timeout`: a bit above the dependency's normal p99 latency. Too low and normal slow calls trip the circuit.
- `volumeThreshold`: high enough that a couple of failed calls at low traffic don't open the circuit.
- `resetTimeout`: roughly how long the dependency usually needs to recover (a pod restart, for example).

---

## Ignoring client errors (4xx)

A 404 or 400 from the upstream means the request was wrong, not that the upstream is down. Those errors shouldn't
open the circuit, and they shouldn't be hidden behind a "degraded" fallback either. Use `errorFilter`:

```ts
const isClientError = (err: any) => {
  const status = err?.response?.status ?? err?.status; // Axios errors or HttpException
  return status >= 400 && status < 500;
};

@UseCircuitBreaker({ name: 'mdm-api', fallback: 'getFallback', errorFilter: isClientError })
async getPart(id: string) { ... }
```

When `errorFilter` returns `true` for an error:
- it **does not** count as a failure, so it can't open the circuit
- the fallback is **skipped**
- the original error is thrown to the caller, so a 404 stays a 404

---

## Calls without a fallback: returning 503

Without a fallback, an open circuit throws an `EOPENBREAKER` error and a timeout throws `ETIMEDOUT`. These are
plain errors, not `HttpException`s, so by default NestJS returns **500 Internal Server Error**. That suggests a bug
in your service when the real cause is an unavailable dependency.

`BreakerOpenFilter` turns those two cases into **503 Service Unavailable**:

```json
{ "statusCode": 503, "message": "Upstream circuit open, try again later", "code": "EOPENBREAKER" }
```

All other errors go to NestJS's default handling unchanged.

If your app **already has a global catch-all exception filter**, don't register this one as well. Add the
`EOPENBREAKER` / `ETIMEDOUT` check to your existing filter instead.

---

## Using the service directly (no decorator)

For code the decorator can't reach, such as controllers, request-scoped providers or plain functions,
call the service yourself:

```ts
constructor(private readonly cb: CircuitBreakerService) {}

async getPart(id: string) {
  return this.cb.execute(
    'mdm-api',                                       // breaker name
    () => this.mdmClient.getPart(id),                // the call to protect
    (err) => ({ id, name: 'Unknown', degraded: true }), // optional fallback: (err) => value
    { timeout: 2000 },                               // optional options (first use only)
  );
}
```

`execute()` and the decorator share the same breakers, so a `'mdm-api'` breaker used both ways has one state.

---

## Monitoring breaker state

**Logs.** Every state change is logged:

```
WARN [CircuitBreakerService] [typesense] circuit OPEN
LOG  [CircuitBreakerService] [typesense] circuit HALF-OPEN
LOG  [CircuitBreakerService] [typesense] circuit CLOSED
```

**Status endpoint.** Add this to your health controller:

```ts
@Get('health/circuits')
circuits() {
  return this.cb.status();
}
```

```json
[{ "name": "typesense", "state": "closed",
   "stats": { "fires": 120, "successes": 117, "failures": 3, "rejects": 0, "timeouts": 1, "latencyMean": 42 } }]
```

Don't connect this endpoint to Kubernetes liveness or readiness probes. An open circuit means a dependency is down,
and restarting your pod won't fix that.

---

## Unit testing

The decorator is applied when the module **initialises**, not when it compiles. In tests, call `init()`;
otherwise you are testing the unwrapped method:

```ts
const moduleRef = await Test.createTestingModule({
  imports: [CircuitBreakerModule],
  providers: [SearchService, { provide: HttpService, useValue: httpMock }],
}).compile();

await moduleRef.init(); // applies @UseCircuitBreaker

const service = moduleRef.get(SearchService);
```

Close the module at the end (`await moduleRef.close()`) so breaker timers stop and Jest can exit.

To test fallback logic alone, call the fallback method directly. It's a normal method.

---

## Rules and limitations

| Rule | Why |
|---|---|
| Decorate **service** methods, not controller methods | NestJS registers routes before the decorator is applied, so it has no effect on controllers. Decorate the service method the controller calls instead. |
| Decorated methods must be **async** (return a Promise) | This is enforced at compile time. |
| Only **singleton** providers | Request-scoped providers are skipped, with a startup warning. Use `execute()` for those. |
| Call through the instance (`this.service.method()`) | Calls that go through the prototype bypass the breaker. |
| **Don't retry inside** a decorated method | Each retry counts as a separate failure and opens the circuit too early. Retry outside the breaker if you need to. |
| A timeout **doesn't cancel** the underlying call | The breaker stops waiting, but the HTTP request keeps running. Also set a timeout on the HTTP client (for example `HttpModule.register({ timeout })`) so requests don't pile up. |
| State is **per pod** | Each replica tracks failures independently. That's normally fine: every pod reaches the same conclusion within seconds. |

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Method not listed in `CircuitBreakerExplorer` startup logs | The class isn't a provider, is request-scoped, is a controller, or `CircuitBreakerModule` isn't imported. |
| `fallback method "x" not found` at startup | The `fallback` string doesn't match a method name on that class. |
| Circuit never opens | Fewer calls than `volumeThreshold` in the window, or `errorFilter` is excluding those errors. |
| Circuit opens too easily | `timeout` is below normal latency, or `volumeThreshold` is too low for your traffic. |
| Clients get 500 instead of 503 when the circuit is open | `BreakerOpenFilter` isn't registered (or another catch-all filter handles the error first). |
| Fallback runs for 404s | Add an `errorFilter` for 4xx errors. |
| Options seem ignored | Another method with the same `name` ran first and created the breaker with its own options. |
| Jest doesn't exit after tests | The testing module wasn't closed. Call `await moduleRef.close()`. |


import CircuitBreaker from 'opossum';

export const CIRCUIT_BREAKER_METADATA = Symbol('circuit-breaker');

export interface UseCircuitBreakerOptions extends CircuitBreaker.Options {
  /** Breaker name. Methods with the same name share one breaker. Defaults to `ClassName.methodName`. */
  name?: string;
  /**
   * Called when the action fails or the circuit is open, with the error followed by the original arguments.
   * Either the name of a method on the same class (called with that instance as `this`) or a function.
   */
  fallback?: string | ((err: Error, ...args: any[]) => unknown);
}

/**
 * Runs an async provider method through a named circuit breaker.
 * CircuitBreakerExplorer applies the wrapping at module init, so the class must be a singleton provider.
 */
export function UseCircuitBreaker(options: UseCircuitBreakerOptions = {}) {
  return <T extends (...args: any[]) => Promise<unknown>>(
    _target: object,
    _key: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ) => {
    Reflect.defineMetadata(CIRCUIT_BREAKER_METADATA, options, descriptor.value!);
    return descriptor;
  };
}

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { CircuitBreakerService } from './circuit-breaker.service';
import { CIRCUIT_BREAKER_METADATA, UseCircuitBreakerOptions } from './use-circuit-breaker.decorator';

/**
 * Finds provider methods decorated with @UseCircuitBreaker and replaces them on the instance
 * with a version that runs through CircuitBreakerService.
 *
 * Controllers are not covered: Nest binds route handlers before onModuleInit runs.
 */
@Injectable()
export class CircuitBreakerExplorer implements OnModuleInit {
  private readonly logger = new Logger(CircuitBreakerExplorer.name);

  constructor(
    private readonly discovery: DiscoveryService,
    private readonly scanner: MetadataScanner,
    private readonly reflector: Reflector,
    private readonly cb: CircuitBreakerService,
  ) {}

  onModuleInit() {
    for (const wrapper of this.discovery.getProviders()) {
      const { instance } = wrapper;
      if (!instance || typeof instance !== 'object') continue;

      const proto = Object.getPrototypeOf(instance);
      for (const key of this.scanner.getAllMethodNames(proto)) {
        const options = this.reflector.get<UseCircuitBreakerOptions | undefined>(CIRCUIT_BREAKER_METADATA, proto[key]);
        if (!options) continue;

        const className = proto.constructor.name;
        if (!wrapper.isDependencyTreeStatic()) {
          this.logger.warn(`${className}.${key}: @UseCircuitBreaker is ignored on request-scoped providers`);
          continue;
        }
        this.wrap(instance, key, options, className);
      }
    }
  }

  private wrap(instance: Record<string, any>, key: string, options: UseCircuitBreakerOptions, className: string) {
    const { name = `${className}.${key}`, fallback, ...breakerOptions } = options;
    const original: (...args: unknown[]) => Promise<unknown> = instance[key];

    let fallbackFn: ((err: Error, ...args: unknown[]) => unknown) | undefined;
    if (typeof fallback === 'string') {
      if (typeof instance[fallback] !== 'function') {
        throw new Error(`${className}.${key}: fallback method "${fallback}" not found`);
      }
      fallbackFn = (err, ...args) => instance[fallback](err, ...args);
    } else {
      fallbackFn = fallback;
    }

    instance[key] = (...args: unknown[]) =>
      this.cb.execute(
        name,
        () => original.apply(instance, args),
        fallbackFn && ((err: Error) => fallbackFn!(err, ...args)),
        breakerOptions,
      );
    this.logger.log(`${className}.${key} -> circuit "${name}"`);
  }
}

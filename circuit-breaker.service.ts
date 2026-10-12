import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import CircuitBreaker from 'opossum';

export type BreakerState = 'open' | 'half-open' | 'closed';

const DEFAULTS: CircuitBreaker.Options = {
  timeout: 3000, // a call counts as failed after 3s
  errorThresholdPercentage: 50, // open once 50% of calls in the window fail
  resetTimeout: 10000, // after 10s, go half-open and let one trial call through
  volumeThreshold: 5, // need at least 5 calls before the breaker can open
  rollingCountTimeout: 10000, // length of the stats window
};

/**
 * Registry of named circuit breakers, one per downstream dependency.
 * Every request to the same dependency shares that dependency's breaker state.
 */
@Injectable()
export class CircuitBreakerService implements OnModuleDestroy {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private readonly breakers = new Map<string, CircuitBreaker>();

  async execute<T>(
    name: string,
    action: () => Promise<T>,
    fallback?: (err: Error) => T | Promise<T>,
    options?: CircuitBreaker.Options,
  ): Promise<T> {
    const breaker = this.getOrCreate(name, options);
    try {
      // Pass the action to fire() so one breaker can wrap many different calls
      return (await breaker.fire(action)) as T;
    } catch (err) {
      if (fallback) return fallback(err as Error);
      throw err;
    }
  }

  state(name: string): BreakerState | undefined {
    const b = this.breakers.get(name);
    if (!b) return undefined;
    return b.opened ? 'open' : b.halfOpen ? 'half-open' : 'closed';
  }

  status() {
    return [...this.breakers.entries()].map(([name, b]) => ({
      name,
      state: this.state(name),
      stats: {
        fires: b.stats.fires,
        successes: b.stats.successes,
        failures: b.stats.failures,
        rejects: b.stats.rejects,
        timeouts: b.stats.timeouts,
        latencyMean: b.stats.latencyMean,
      },
    }));
  }

  private getOrCreate(name: string, options?: CircuitBreaker.Options): CircuitBreaker {
    let breaker = this.breakers.get(name);
    if (!breaker) {
      breaker = new CircuitBreaker((fn: () => Promise<unknown>) => fn(), {
        ...DEFAULTS,
        ...options,
        name,
      });
      breaker.on('open', () => this.logger.warn(`[${name}] circuit OPEN`));
      breaker.on('halfOpen', () => this.logger.log(`[${name}] circuit HALF-OPEN`));
      breaker.on('close', () => this.logger.log(`[${name}] circuit CLOSED`));
      this.breakers.set(name, breaker);
    }
    return breaker;
  }

  onModuleDestroy() {
    this.breakers.forEach((b) => b.shutdown());
  }
}

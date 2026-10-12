import { Global, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { CircuitBreakerExplorer } from './circuit-breaker.explorer';
import { CircuitBreakerService } from './circuit-breaker.service';

@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [CircuitBreakerService, CircuitBreakerExplorer],
  exports: [CircuitBreakerService],
})
export class CircuitBreakerModule {}

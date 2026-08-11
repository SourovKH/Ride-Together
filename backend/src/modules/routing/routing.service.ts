import { IRoutingProvider, RouteResult } from './routing.types.js';
import { OsrmRoutingProvider } from './osrm.provider.js';

export class RoutingService {
  private provider: IRoutingProvider;

  constructor(provider?: IRoutingProvider) {
    this.provider = provider || new OsrmRoutingProvider();
  }

  public async getRoute(
    startLat: number,
    startLng: number,
    destLat: number,
    destLng: number
  ): Promise<RouteResult> {
    return this.provider.getRoute(startLat, startLng, destLat, destLng);
  }
}

export const routingService = new RoutingService();

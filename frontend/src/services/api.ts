export interface HealthResponse {
  status: 'ok' | 'degraded';
  timestamp: string;
  uptimeSeconds: number;
  services: {
    postgres: 'connected' | 'disconnected';
    redis: 'connected' | 'disconnected';
  };
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/api';
  }

  async getHealth(): Promise<HealthResponse> {
    const response = await fetch(`${this.baseUrl}/health`);
    try {
      const data = await response.json();
      return data;
    } catch {
      throw new Error(`Health check failed with status: ${response.status}`);
    }
  }
}

export const api = new ApiClient();

import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  
  get production(): boolean {
    return environment.production;
  }

  get apiUrl(): string {
    return environment.apiUrl;
  }

  get appName(): string {
    return environment.appName;
  }

  get version(): string {
    return environment.version;
  }

  // Método helper para construir URLs de API
  buildApiUrl(endpoint: string): string {
    // Asegurar que el endpoint comience con /
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.apiUrl}${normalizedEndpoint}`;
  }

  // Método helper para logging (solo en desarrollo)
  log(...args: any[]): void {
    if (!this.production) {
      console.log('[FlashElicit]', ...args);
    }
  }

  // Método helper para errores
  logError(...args: any[]): void {
    if (!this.production) {
      console.error('[FlashElicit Error]', ...args);
    }
  }
}

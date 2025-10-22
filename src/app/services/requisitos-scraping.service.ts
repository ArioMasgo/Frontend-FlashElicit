import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { RequestComentarioUnico, ResponseComentarioUnico } from '../models/requisitos-Unicos.interface';
import { RequestComentariosScraping, ResponseComentariosScraping } from '../models/requisitos-scraping.interface';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { finalize } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RequisitosScrapingService {
  httpClient = inject(HttpClient);
  private ngxLoader = inject(NgxUiLoaderService);
  private _baseUrl = signal(`${environment.apiUrl}`);
  private _apiUrl = computed(() => `${this._baseUrl()}/scraping`);

  constructor() {}

  createRequisitoUnico(request: RequestComentarioUnico) {
    this.ngxLoader.start(); // Inicia el loader
    return this.httpClient.post<ResponseComentarioUnico>(`${this._apiUrl()}/classify-single`, request)
      .pipe(
        finalize(() => this.ngxLoader.stop()) // Detiene el loader cuando termina (éxito o error)
      );
  }

  createRequisitosScraping(request: RequestComentariosScraping) {
    this.ngxLoader.start(); // Inicia el loader
    return this.httpClient.post<ResponseComentariosScraping>(`${this._apiUrl()}`, request)
      .pipe(
        finalize(() => this.ngxLoader.stop()) // Detiene el loader cuando termina (éxito o error)
      );
  }
  
}

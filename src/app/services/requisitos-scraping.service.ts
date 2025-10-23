import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RequestComentarioUnico, ResponseComentarioUnico } from '../models/requisitos-Unicos.interface';
import { RequestComentariosScraping, ResponseComentariosScraping, PDFGenerationRequest } from '../models/requisitos-scraping.interface';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { finalize, map, Observable } from 'rxjs';

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
    return this.httpClient.post<ResponseComentariosScraping>(`${this._apiUrl()}/scrape`, request)
      .pipe(
        finalize(() => this.ngxLoader.stop()) // Detiene el loader cuando termina (éxito o error)
      );
  }

  /**
   * Genera un PDF de requisitos y lo retorna como Blob
   */
  generatePDF(pdfRequest: PDFGenerationRequest): Observable<Blob> {
    this.ngxLoader.start();
    return this.httpClient.post(`${this._apiUrl()}/generate-pdf`, pdfRequest, {
      responseType: 'blob',
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).pipe(
      finalize(() => this.ngxLoader.stop())
    );
  }

  /**
   * Descarga un archivo blob como PDF
   */
  downloadPDFBlob(blob: Blob, filename: string): void {
    // Crear URL temporal para el blob
    const url = window.URL.createObjectURL(blob);

    // Crear elemento <a> temporal
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    // Simular click para iniciar descarga
    document.body.appendChild(link);
    link.click();

    // Limpiar
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Método combinado: genera y descarga el PDF en un solo paso
   */
  generateAndDownloadPDF(pdfRequest: PDFGenerationRequest): Observable<void> {
    return this.generatePDF(pdfRequest).pipe(
      map((blob: Blob) => {
        const filename = `requisitos_${pdfRequest.app_id}_${Date.now()}.pdf`;
        this.downloadPDFBlob(blob, filename);
      })
    );
  }
}

import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RequestComentarioUnico, ResponseComentarioUnico } from '../models/requisitos-Unicos.interface';
import { RequestComentariosScraping, ResponseComentariosScraping, PDFGenerationRequest } from '../models/requisitos-scraping.interface';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { finalize, map, Observable, delay, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RequisitosScrapingService {
  httpClient = inject(HttpClient);
  private ngxLoader = inject(NgxUiLoaderService);
  private _baseUrl = signal(`${environment.apiUrl}`);
  private _apiUrl = computed(() => `${this._baseUrl()}/scraping`);
  private messageTimeouts: any[] = [];
  loaderText = signal<string>('');

  constructor() {}

  createRequisitoUnico(request: RequestComentarioUnico) {
    // Iniciar loader y programar mensajes secuenciales
    this.ngxLoader.start();
    this.updateLoaderText([
      { text: 'Clasificando comentario...', duration: 2500 },
      { text: 'Generando requisito...', duration: 0 }
    ]);

    return this.httpClient.post<ResponseComentarioUnico>(`${this._apiUrl()}/classify-single`, request)
      .pipe(
        finalize(() => {
          this.clearMessageTimeouts();
          this.loaderText.set('');
          this.ngxLoader.stop();
        })
      );
  }

  createRequisitosScraping(request: RequestComentariosScraping) {
    // Iniciar loader y programar mensajes secuenciales
    this.ngxLoader.start();
    this.updateLoaderText([
      { text: 'Scrapeando comentarios...', duration: 3000 },
      { text: 'Clasificando comentarios...', duration: 4000 },
      { text: 'Generando requisitos...', duration: 0 }
    ]);

    return this.httpClient.post<ResponseComentariosScraping>(`${this._apiUrl()}/scrape`, request)
      .pipe(
        finalize(() => {
          this.clearMessageTimeouts();
          this.loaderText.set('');
          this.ngxLoader.stop();
        })
      );
  }

  /**
   * Genera un PDF de requisitos y lo retorna como Blob
   */
  generatePDF(pdfRequest: PDFGenerationRequest): Observable<Blob> {
    // Iniciar loader y programar mensajes
    this.ngxLoader.start();
    this.updateLoaderText([
      { text: 'Procesando requisitos...', duration: 2000 },
      { text: 'Generando documento PDF...', duration: 0 }
    ]);

    return this.httpClient.post(`${this._apiUrl()}/generate-pdf`, pdfRequest, {
      responseType: 'blob',
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).pipe(
      finalize(() => {
        this.clearMessageTimeouts();
        this.loaderText.set('');
        this.ngxLoader.stop();
      })
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

  /**
   * Actualiza el texto del loader con mensajes secuenciales
   */
  private updateLoaderText(messages: { text: string, duration: number }[]): void {
    if (messages.length === 0) return;

    // Establecer el primer mensaje
    this.loaderText.set(messages[0].text);

    // Programar cambios de mensaje
    let accumulatedTime = 0;
    for (let i = 1; i < messages.length; i++) {
      const previousDuration = messages[i - 1].duration;
      if (previousDuration > 0) {
        accumulatedTime += previousDuration;
        const timeout = setTimeout(() => {
          this.loaderText.set(messages[i].text);
        }, accumulatedTime);
        this.messageTimeouts.push(timeout);
      }
    }
  }

  /**
   * Limpia todos los timeouts de mensajes pendientes
   */
  private clearMessageTimeouts(): void {
    this.messageTimeouts.forEach(timeout => clearTimeout(timeout));
    this.messageTimeouts = [];
  }
}

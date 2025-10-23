import { ChangeDetectionStrategy, Component, input, computed, inject, signal, ElementRef, viewChild, effect } from '@angular/core';
import { ResponseComentariosScraping, PDFGenerationRequest } from '../../models/requisitos-scraping.interface';
import { CommonModule } from '@angular/common';
import { RequisitosScrapingService } from '../../services/requisitos-scraping.service';

@Component({
  selector: 'app-requisitos-scraping',
  imports: [CommonModule],
  templateUrl: './requisitos-scraping.html',
  styleUrl: './requisitos-scraping.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequisitosScraping {
  resultado = input.required<ResponseComentariosScraping>();

  private requisitosScrapingService = inject(RequisitosScrapingService);
  private containerRef = viewChild<ElementRef<HTMLDivElement>>('containerRef');

  isGeneratingPDF = signal<boolean>(false);
  pdfError = signal<string>('');

  // Paginación
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(10);

  // Exponer Math para el template
  Math = Math;

  // Computed para obtener los requisitos
  requisitos = computed(() => this.resultado().requirements?.requisitos || []);
  resumen = computed(() => this.resultado().requirements?.resumen);

  // Computed para la paginación
  totalPages = computed(() => Math.ceil(this.requisitos().length / this.itemsPerPage()));
  paginatedRequisitos = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.requisitos().slice(start, end);
  });

  // Effect para scroll automático cuando se generan requisitos
  constructor() {
    effect(() => {
      const requisitos = this.requisitos();
      if (requisitos.length > 0) {
        // Esperar un tick para que el DOM se actualice
        setTimeout(() => {
          this.scrollToComponent();
        }, 100);
      }
    });
  }

  // Método para obtener el color de la prioridad
  getPrioridadColor(prioridad: string): string {
    const prioridadLower = prioridad.toLowerCase();
    if (prioridadLower === 'alta') return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
    if (prioridadLower === 'media') return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
    return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
  }

  // Método para obtener el color de la categoría
  getCategoriaColor(index: number): string {
    const colors = [
      'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
      'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
      'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
    ];
    return colors[index % colors.length];
  }

  /**
   * Calcula el porcentaje de un valor respecto al total
   */
  getPercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  /**
   * Genera y descarga el PDF de requisitos
   */
  descargarPDF(): void {
    const resultado = this.resultado();
    const requisitos = this.requisitos();
    const resumen = this.resumen();

    if (!requisitos.length || !resumen) {
      this.pdfError.set('No hay requisitos disponibles para generar PDF');
      return;
    }

    this.isGeneratingPDF.set(true);
    this.pdfError.set('');

    const pdfRequest: PDFGenerationRequest = {
      app_id: resultado.app_id,
      fecha_generacion: new Date().toISOString(),
      total_comentarios_analizados: resultado.total_reviews,
      requisitos: requisitos,
      resumen: resumen
    };

    this.requisitosScrapingService.generateAndDownloadPDF(pdfRequest).subscribe({
      next: () => {
        this.isGeneratingPDF.set(false);
        console.log('✅ PDF descargado exitosamente');
      },
      error: (error) => {
        this.isGeneratingPDF.set(false);
        this.pdfError.set('Error al generar PDF. Intenta nuevamente.');
        console.error('❌ Error al generar PDF:', error);
      }
    });
  }

  /**
   * Navega a una página específica
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      // Scroll suave a la tabla
      this.scrollToComponent();
    }
  }

  /**
   * Scroll automático al componente
   */
  private scrollToComponent(): void {
    const container = this.containerRef();
    if (container) {
      container.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  /**
   * Obtiene el array de números de página para la paginación
   */
  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (total <= 7) {
      // Si hay 7 páginas o menos, mostrar todas
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Siempre mostrar primera página
      pages.push(1);

      if (current > 3) {
        pages.push(-1); // -1 representa los puntos suspensivos
      }

      // Páginas alrededor de la actual
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i);
      }

      if (current < total - 2) {
        pages.push(-1); // -1 representa los puntos suspensivos
      }

      // Siempre mostrar última página
      pages.push(total);
    }

    return pages;
  }
}

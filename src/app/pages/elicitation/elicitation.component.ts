import { Component, signal, computed, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';
import { CommonModule } from '@angular/common';
import { RequisitosScrapingService } from '../../services/requisitos-scraping.service';
import { RequestComentarioUnico, ResponseComentarioUnico } from '../../models/requisitos-Unicos.interface';
import { RequestComentariosScraping, ResponseComentariosScraping } from '../../models/requisitos-scraping.interface';
import { RequisitosComentarioUnico } from '../../components/requisitos-comentarioUnico/requisitos-comentarioUnico';
import { RequisitosScraping } from '../../components/requisitos-scraping/requisitos-scraping';

type InputType = 'comment' | 'appLink';

@Component({
  selector: 'app-elicitation',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, ThemeToggleComponent, CommonModule, RequisitosComentarioUnico, RequisitosScraping],
  templateUrl: './elicitation.component.html',
  styleUrl: './elicitation.component.css'
})
export class ElicitationComponent {
  // Signals para el estado
  selectedInputType = signal<InputType>('comment');
  errorMessage = signal<string>('');
  isFormValid = signal<boolean>(false);
  resultadoComentario = signal<ResponseComentarioUnico | null>(null);
  resultadoScraping = signal<ResponseComentariosScraping | null>(null);
  criteriosBusqueda = signal<'recientes' | 'relevantes'>('recientes');
  isCriteriosDropdownOpen = signal<boolean>(false);

  private requisitosScrapingService = inject(RequisitosScrapingService);
  private readonly SESSION_STORAGE_KEY_COMMENT = 'flashelicit_resultado_comment';
  private readonly SESSION_STORAGE_KEY_SCRAPING = 'flashelicit_resultado_scraping';

  // FormGroup reactivo
  elicitationForm = new FormGroup({
    userInput: new FormControl('', [Validators.required])
  });

  constructor() {
    // Escuchar cambios en el input para actualizar validez del formulario
    this.elicitationForm.get('userInput')?.valueChanges.subscribe(() => {
      this.updateFormValidity();
    });

    // Cargar resultado previo desde sessionStorage si existe
    this.loadResultFromSession();
  }

  private updateFormValidity() {
    const input = this.elicitationForm.get('userInput')?.value || '';
    const type = this.selectedInputType();
    
    if (!input.trim()) {
      this.isFormValid.set(false);
      return;
    }

    if (type === 'comment') {
      const isValid = this.validateComment(input, false);
      this.isFormValid.set(isValid);
    } else {
      const isValid = this.validateAppLink(input, false);
      this.isFormValid.set(isValid);
    }
  }

  // Se ejecuta cuando el usuario sale del input (blur)
  onInputBlur() {
    const input = this.elicitationForm.get('userInput')?.value || '';
    const type = this.selectedInputType();
    
    if (!input.trim()) {
      this.errorMessage.set('');
      return;
    }

    if (type === 'comment') {
      this.validateComment(input, true);
    } else {
      this.validateAppLink(input, true);
    }
  }

  // Placeholder dinámico
  placeholder = computed(() => {
    return this.selectedInputType() === 'comment'
      ? 'Escribe tu comentario (mínimo 6 palabras)...'
      : 'Pega el link de la app de Google Play Store...';
  });

  selectInputType(type: InputType) {
    this.selectedInputType.set(type);
    this.errorMessage.set('');
    // Limpiar ambos resultados al cambiar de tipo
    this.clearResults();
    this.elicitationForm.get('userInput')?.setValue('');
    this.isFormValid.set(false);
    // Resetear criterio de búsqueda al valor por defecto
    this.criteriosBusqueda.set('recientes');
    // Cerrar dropdown si está abierto
    this.isCriteriosDropdownOpen.set(false);
  }

  private validateComment(text: string, showError: boolean): boolean {
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    const isValid = words.length >= 6;
    
    if (showError) {
      if (!isValid && text.trim()) {
        this.errorMessage.set(`Necesitas al menos 6 palabras (tienes ${words.length})`);
      } else {
        this.errorMessage.set('');
      }
    }
    
    return isValid;
  }

  private validateAppLink(link: string, showError: boolean): boolean {
    const playStoreRegex = /^https:\/\/play\.google\.com\/store\/apps\/details\?id=([a-zA-Z0-9._]+)/;
    const match = link.match(playStoreRegex);
    
    if (showError) {
      if (!match && link.trim()) {
        this.errorMessage.set('El link debe ser de Google Play Store con formato válido');
      } else {
        this.errorMessage.set('');
      }
    }
    
    return !!match;
  }

  private extractAppId(link: string): string | null {
    const playStoreRegex = /^https:\/\/play\.google\.com\/store\/apps\/details\?id=([a-zA-Z0-9._]+)/;
    const match = link.match(playStoreRegex);
    return match ? match[1] : null;
  }

  onSubmit() {
    const input = this.elicitationForm.get('userInput')?.value || '';

    if (!this.isFormValid()) {
      return;
    }

    const type = this.selectedInputType();

    if (type === 'comment') {
      this.clearResults(); // Limpiar resultados anteriores antes de la nueva petición

      const request: RequestComentarioUnico = {
        comentario: input
      };

      this.requisitosScrapingService.createRequisitoUnico(request).subscribe({
        next: (response) => {
          console.log('Respuesta del servidor (comentario):', response);
          if (response) {
            this.resultadoComentario.set(response);
            this.saveCommentResultToSession(response);
          }
          this.elicitationForm.reset();
          this.errorMessage.set('');
          this.isFormValid.set(false);
        },
        error: (error) => {
          console.error('Error al enviar comentario:', error);
          this.errorMessage.set('Error al procesar el comentario. Intenta nuevamente.');
        }
      });

    } else {
      this.clearResults(); // Limpiar resultados anteriores antes de la nueva petición

      const request: RequestComentariosScraping = {
        playstore_url: input,
        max_reviews: 50,
        max_rating: 3,
        criterios_busqueda: this.criteriosBusqueda()
      };

      this.requisitosScrapingService.createRequisitosScraping(request).subscribe({
        next: (response) => {
          console.log('Respuesta del servidor (scraping):', response);
          if (response) {
            this.resultadoScraping.set(response);
            this.saveScrapingResultToSession(response);
          }
          this.elicitationForm.reset();
          this.errorMessage.set('');
          this.isFormValid.set(false);
        },
        error: (error) => {
          console.error('Error al procesar scraping:', error);
          this.errorMessage.set('Error al procesar el link. Verifica que sea válido e intenta nuevamente.');
        }
      });
    }
  }

  // Métodos para manejar sessionStorage - Comentarios
  private saveCommentResultToSession(resultado: ResponseComentarioUnico): void {
    try {
      sessionStorage.setItem(this.SESSION_STORAGE_KEY_COMMENT, JSON.stringify(resultado));
    } catch (error) {
      console.error('Error al guardar comentario en sessionStorage:', error);
    }
  }

  // Métodos para manejar sessionStorage - Scraping
  private saveScrapingResultToSession(resultado: ResponseComentariosScraping): void {
    try {
      sessionStorage.setItem(this.SESSION_STORAGE_KEY_SCRAPING, JSON.stringify(resultado));
    } catch (error) {
      console.error('Error al guardar scraping en sessionStorage:', error);
    }
  }

  private loadResultFromSession(): void {
    try {
      // Intentar cargar resultado de comentario
      const savedCommentResult = sessionStorage.getItem(this.SESSION_STORAGE_KEY_COMMENT);
      if (savedCommentResult) {
        const resultado: ResponseComentarioUnico = JSON.parse(savedCommentResult);
        this.resultadoComentario.set(resultado);
        this.selectedInputType.set('comment');
      }

      // Intentar cargar resultado de scraping
      const savedScrapingResult = sessionStorage.getItem(this.SESSION_STORAGE_KEY_SCRAPING);
      if (savedScrapingResult) {
        const resultado: ResponseComentariosScraping = JSON.parse(savedScrapingResult);
        this.resultadoScraping.set(resultado);
        this.selectedInputType.set('appLink');
      }
    } catch (error) {
      console.error('Error al cargar desde sessionStorage:', error);
      // Si hay error al parsear, limpiar el storage
      this.clearResults();
    }
  }

  private clearResults(): void {
    this.resultadoComentario.set(null);
    this.resultadoScraping.set(null);
    try {
      sessionStorage.removeItem(this.SESSION_STORAGE_KEY_COMMENT);
      sessionStorage.removeItem(this.SESSION_STORAGE_KEY_SCRAPING);
    } catch (error) {
      console.error('Error al limpiar sessionStorage:', error);
    }
  }

  // Métodos para manejar dropdown de criterios de búsqueda
  toggleCriteriosDropdown(): void {
    this.isCriteriosDropdownOpen.update(val => !val);
  }

  selectCriterio(criterio: 'recientes' | 'relevantes'): void {
    this.criteriosBusqueda.set(criterio);
    this.isCriteriosDropdownOpen.set(false);
  }

  closeCriteriosDropdown(): void {
    this.isCriteriosDropdownOpen.set(false);
  }
}

import { Component, signal, computed, inject, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { RequisitosComentarioUnico } from '../../components/requisitos-comentarioUnico/requisitos-comentarioUnico.component';
import { RequisitosScraping } from '../../components/requisitos-scraping/requisitos-scraping.component';
import { ThemeService } from '../../services/theme.service';
import { RequisitosScrapingService } from '../../services/requisitos-scraping.service';
import { EnvironmentService } from '../../services/environment.service';
import { InputType, RequestComentariosScraping, ResponseComentariosScraping } from '../../models/requisitos-scraping.interface';
import { RequestComentarioUnico, ResponseComentarioUnico } from '../../models/requisitos-Unicos.interface';
import { DropdownComponent, DropdownOption } from '../../shared/components/dropdown/dropdown.component';

@Component({
  selector: 'app-elicitation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RequisitosComentarioUnico,
    RequisitosScraping,
    HeaderComponent,
    FooterComponent,
    DropdownComponent
  ],
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
  multiclassModel = signal<'beto' | 'robertuito'>('beto'); // Modelo por defecto

  // Opciones para los dropdowns
  criteriosOptions: DropdownOption[] = [
    {
      value: 'recientes',
      label: 'Más recientes',
      description: 'Comentarios ordenados por fecha'
    },
    {
      value: 'relevantes',
      label: 'Más relevantes',
      description: 'Comentarios más útiles primero'
    }
  ];

  modelOptions: DropdownOption[] = [
    {
      value: 'beto',
      label: 'BETO',
      description: 'Modelo general balanceado'
    },
    {
      value: 'robertuito',
      label: 'Robertuito',
      description: 'Para texto informal'
    }
  ];

  inputTypeOptions: DropdownOption[] = [
    {
      value: 'comment',
      label: 'Comentario',
      description: 'Escribe tu idea o requisito'
    },
    {
      value: 'appLink',
      label: 'Link de app',
      description: 'Extrae requisitos desde Play Store'
    }
  ];

  private requisitosScrapingService = inject(RequisitosScrapingService);
  private readonly SESSION_STORAGE_KEY_COMMENT = 'flashelicit_resultado_comment';
  private readonly SESSION_STORAGE_KEY_SCRAPING = 'flashelicit_resultado_scraping';

  // Referencias a los dropdowns
  criteriosDropdown = viewChild<DropdownComponent>('criteriosDropdown');
  modelDropdown = viewChild<DropdownComponent>('modelDropdown');
  inputTypeDropdown = viewChild<DropdownComponent>('inputTypeDropdown');

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
  }

  onInputTypeChange(type: string): void {
    this.selectInputType(type as InputType);
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
        comentario: input,
        multiclass_model: this.multiclassModel()
      };

      this.requisitosScrapingService.createRequisitoUnico(request).subscribe({
        next: (response: ResponseComentarioUnico) => {
          console.log('Respuesta del servidor (comentario):', response);
          if (response) {
            this.resultadoComentario.set(response);
            this.saveCommentResultToSession(response);
          }
          this.elicitationForm.reset();
          this.errorMessage.set('');
          this.isFormValid.set(false);
        },
        error: (error: any) => {
          console.error('Error al enviar comentario:', error);
          this.errorMessage.set('Error al procesar el comentario. Intenta nuevamente.');
        }
      });

    } else {
      this.clearResults(); // Limpiar resultados anteriores antes de la nueva petición

      const request: RequestComentariosScraping = {
        playstore_url: input,
        max_reviews: 1000,
        max_rating: 3,
        criterios_busqueda: this.criteriosBusqueda(),
        multiclass_model: this.multiclassModel()
      };

      this.requisitosScrapingService.createRequisitosScraping(request).subscribe({
        next: (response: ResponseComentariosScraping) => {
          console.log('Respuesta del servidor (scraping):', response);
          if (response) {
            this.resultadoScraping.set(response);
            this.saveScrapingResultToSession(response);
          }
          this.elicitationForm.reset();
          this.errorMessage.set('');
          this.isFormValid.set(false);
        },
        error: (error: any) => {
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

  // Métodos para manejar cambios en dropdowns
  onCriterioChange(criterio: string): void {
    this.criteriosBusqueda.set(criterio as 'recientes' | 'relevantes');
  }

  onModelChange(model: string): void {
    this.multiclassModel.set(model as 'beto' | 'robertuito');
  }

  // Métodos para manejar apertura exclusiva de dropdowns
  onCriteriosDropdownOpened(): void {
    // Cerrar otros dropdowns
    this.modelDropdown()?.close();
    this.inputTypeDropdown()?.close();
  }

  onModelDropdownOpened(): void {
    // Cerrar otros dropdowns
    this.criteriosDropdown()?.close();
    this.inputTypeDropdown()?.close();
  }

  onInputTypeDropdownOpened(): void {
    // Cerrar otros dropdowns
    this.criteriosDropdown()?.close();
    this.modelDropdown()?.close();
  }
}

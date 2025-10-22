import { Component, signal, computed, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';
import { CommonModule } from '@angular/common';
import { RequisitosScrapingService } from '../../services/requisitos-scraping.service';
import { RequestComentarioUnico, ResponseComentarioUnico } from '../../models/requisitos-Unicos.interface';
import { RequisitosComentarioUnico } from '../../components/requisitos-comentarioUnico/requisitos-comentarioUnico';

type InputType = 'comment' | 'appLink';

@Component({
  selector: 'app-elicitation',
  standalone: true,
  imports: [ReactiveFormsModule, ThemeToggleComponent, CommonModule, RequisitosComentarioUnico],
  templateUrl: './elicitation.component.html',
  styleUrl: './elicitation.component.css'
})
export class ElicitationComponent {
  // Signals para el estado
  selectedInputType = signal<InputType>('comment');
  errorMessage = signal<string>('');
  isFormValid = signal<boolean>(false);
  resultado = signal<ResponseComentarioUnico | null>(null);
  
  private requisitosScrapingService = inject(RequisitosScrapingService);
  private readonly SESSION_STORAGE_KEY = 'flashelicit_resultado';

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
    // NO limpiar el resultado al cambiar de tipo, solo limpiar el input
    this.clearResult(); // Limpiar resultado anterior y sessionStorage
    this.elicitationForm.get('userInput')?.setValue('');
    this.isFormValid.set(false);
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
      this.clearResult(); // Limpiar resultado anterior antes de la nueva petición
      
      const request: RequestComentarioUnico = {
        comentario: input
      };

      this.requisitosScrapingService.createRequisitoUnico(request).subscribe({
        next: (response) => {
          console.log('Respuesta del servidor:', response);
          // La respuesta es un objeto único, no un array
          if (response) {
            this.resultado.set(response);
            this.saveResultToSession(response); // Guardar en sessionStorage
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
      const appId = this.extractAppId(input);
      console.log('App ID extraído:', appId);
      console.log('Link completo:', input);
      // Aquí irá la lógica para enviar el appId al backend
    }
  }

  // Métodos para manejar sessionStorage
  private saveResultToSession(resultado: ResponseComentarioUnico): void {
    try {
      sessionStorage.setItem(this.SESSION_STORAGE_KEY, JSON.stringify(resultado));
    } catch (error) {
      console.error('Error al guardar en sessionStorage:', error);
    }
  }

  private loadResultFromSession(): void {
    try {
      const savedResult = sessionStorage.getItem(this.SESSION_STORAGE_KEY);
      if (savedResult) {
        const resultado: ResponseComentarioUnico = JSON.parse(savedResult);
        this.resultado.set(resultado);
      }
    } catch (error) {
      console.error('Error al cargar desde sessionStorage:', error);
      // Si hay error al parsear, limpiar el storage
      sessionStorage.removeItem(this.SESSION_STORAGE_KEY);
    }
  }

  private clearResult(): void {
    this.resultado.set(null);
    try {
      sessionStorage.removeItem(this.SESSION_STORAGE_KEY);
    } catch (error) {
      console.error('Error al limpiar sessionStorage:', error);
    }
  }
}

import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'flashelicit-theme';
  
  // Signal para el tema seleccionado por el usuario
  theme = signal<Theme>(this.getInitialTheme());

  constructor() {
    // Efecto para aplicar el tema cuando cambie
    effect(() => {
      const currentTheme = this.theme();
      this.applyTheme(currentTheme);
      this.saveTheme(currentTheme);
    });

    // Escuchar cambios en la preferencia del sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (this.theme() === 'system') {
        this.applyTheme('system');
      }
    });
  }

  private getInitialTheme(): Theme {
    // Intenta obtener el tema del localStorage
    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
    
    if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
      return savedTheme;
    }
    
    // Por defecto, usa la configuración del sistema
    return 'system';
  }

  private applyTheme(theme: Theme): void {
    const htmlElement = document.documentElement;
    
    // Determinar si debe aplicar modo oscuro
    const shouldBeDark = theme === 'dark' || 
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    // Aplicar clase 'dark' para Tailwind
    if (shouldBeDark) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }

  private saveTheme(theme: Theme): void {
    localStorage.setItem(this.THEME_KEY, theme);
  }

  toggleTheme(): void {
    // Ciclo: light -> dark -> system -> light
    const current = this.theme();
    if (current === 'light') {
      this.theme.set('dark');
    } else if (current === 'dark') {
      this.theme.set('system');
    } else {
      this.theme.set('light');
    }
  }

  setTheme(theme: Theme): void {
    this.theme.set(theme);
  }

  // Obtener el tema efectivo (resuelve 'system' al tema real)
  getEffectiveTheme(): 'light' | 'dark' {
    const current = this.theme();
    if (current === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return current;
  }
}

import { Component, inject, signal } from '@angular/core';
import { ThemeService, Theme } from '../../../services/theme.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.css'
})
export class ThemeToggleComponent {
  themeService = inject(ThemeService);
  isOpen = signal(false);

  toggleDropdown() {
    this.isOpen.update(val => !val);
  }

  selectTheme(theme: Theme) {
    this.themeService.setTheme(theme);
    this.isOpen.set(false);
  }

  closeDropdown() {
    this.isOpen.set(false);
  }

  // Cerrar el dropdown al hacer click fuera
  onClickOutside(event: Event) {
    if (this.isOpen()) {
      this.isOpen.set(false);
    }
  }
}

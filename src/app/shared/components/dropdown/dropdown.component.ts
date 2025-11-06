import { Component, input, output, signal, contentChild, TemplateRef, ElementRef, viewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DropdownOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
}

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.css'
})
export class DropdownComponent {
  // Inputs
  options = input.required<DropdownOption[]>();
  selectedValue = input.required<string>();
  buttonLabel = input<string>('');
  ariaLabel = input<string>('Seleccionar opción');
  buttonClass = input<string>('');
  dropdownWidth = input<string>('w-44');
  align = input<'left' | 'right'>('right');

  // Outputs
  selectionChange = output<string>();
  dropdownOpened = output<void>();
  dropdownClosed = output<void>();

  // Templates opcionales para personalización
  buttonTemplate = contentChild<TemplateRef<any>>('buttonContent');
  optionTemplate = contentChild<TemplateRef<any>>('optionContent');

  // Referencias
  buttonRef = viewChild<ElementRef>('dropdownButton');

  // State
  isOpen = signal(false);
  dropdownPosition = signal<{ top: string; left: string; right: string } | null>(null);

  constructor() {
    // Recalcular posición cuando se abre el dropdown
    effect(() => {
      if (this.isOpen()) {
        this.calculateDropdownPosition();
      }
    });
  }

  toggleDropdown() {
    const willOpen = !this.isOpen();
    this.isOpen.set(willOpen);

    if (willOpen) {
      this.dropdownOpened.emit();
    } else {
      this.dropdownClosed.emit();
    }
  }

  selectOption(value: string) {
    this.selectionChange.emit(value);
    this.isOpen.set(false);
    this.dropdownClosed.emit();
  }

  closeDropdown() {
    const wasOpen = this.isOpen();
    this.isOpen.set(false);
    if (wasOpen) {
      this.dropdownClosed.emit();
    }
  }

  // Método público para cerrar el dropdown desde el exterior
  close() {
    this.isOpen.set(false);
  }

  getSelectedOption() {
    return this.options().find(opt => opt.value === this.selectedValue());
  }

  private calculateDropdownPosition() {
    const buttonElement = this.buttonRef()?.nativeElement;
    if (!buttonElement) return;

    const rect = buttonElement.getBoundingClientRect();
    const align = this.align();

    if (align === 'right') {
      this.dropdownPosition.set({
        top: `${rect.bottom + 8}px`,
        right: `${window.innerWidth - rect.right}px`,
        left: 'auto'
      });
    } else {
      this.dropdownPosition.set({
        top: `${rect.bottom + 8}px`,
        left: `${rect.left}px`,
        right: 'auto'
      });
    }
  }
}

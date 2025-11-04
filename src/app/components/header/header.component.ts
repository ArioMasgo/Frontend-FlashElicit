import { Component } from '@angular/core';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ThemeToggleComponent, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

}

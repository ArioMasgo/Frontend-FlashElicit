import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { RequisitosScrapingService } from './services/requisitos-scraping.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxUiLoaderModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Frontend-FlashElicit');
  protected requisitosService = inject(RequisitosScrapingService);
}

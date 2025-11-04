import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ResponseComentarioUnico } from '../../models/requisitos-Unicos.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-requisitos-comentario-unico',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './requisitos-comentarioUnico.html',
  styleUrl: './requisitos-comentarioUnico.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequisitosComentarioUnico {
  resultado = input.required<ResponseComentarioUnico>();
}

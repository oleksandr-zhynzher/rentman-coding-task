import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  readonly disabled = input<boolean>(false);
  readonly buttonClick = output<Event>();

  onClick(event: Event): void {
    if (!this.disabled()) {
      this.buttonClick.emit(event);
    }
  }
}

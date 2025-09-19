import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chevron',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chevron.component.html',
  styleUrl: './chevron.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChevronComponent {
  readonly expanded = input.required<boolean>();
  readonly iconClick = output<Event>();

  readonly cssClasses = computed(() => {
    const classes = ['chevron'];
    classes.push(this.expanded() ? 'chevron--down' : 'chevron--up');
    return classes.join(' ');
  });

  onClick(event: Event): void {
    this.iconClick.emit(event);
  }
}

import {
  Component,
  computed,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeItem } from '../../models';
import { TreeSelectionService } from '../../services';
import { CheckboxComponent } from '../../../../shared';

@Component({
  selector: 'app-tree-item',
  standalone: true,
  imports: [CommonModule, CheckboxComponent],
  templateUrl: './tree-item.component.html',
  styleUrl: './tree-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeItemComponent {
  readonly item = input.required<TreeItem>();
  readonly itemSelect = output<TreeItem>();

  readonly isSelected = computed(() =>
    this.treeSelectionService.isItemSelected(this.item().originalId),
  );

  constructor(private readonly treeSelectionService: TreeSelectionService) {}

  protected onItemSelect(): void {
    this.itemSelect.emit(this.item());
  }
}

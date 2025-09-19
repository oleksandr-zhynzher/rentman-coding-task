import { Component, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeSelectionService } from '../../services';
import { ButtonComponent } from '../../../../shared';

@Component({
  selector: 'app-tree-selection-summary',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './tree-selection-summary.component.html',
  styleUrl: './tree-selection-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeSelectionSummaryComponent {
  readonly selectedItemIds = computed(() =>
    this.treeSelectionService.selectedItemIdsArray().join(', '),
  );

  readonly isSelectionEmpty = computed(
    () => !this.treeSelectionService.hasSelection(),
  );

  constructor(private readonly treeSelectionService: TreeSelectionService) {}

  onClearSelection(): void {
    this.treeSelectionService.clearAllSelections();
  }
}

import { Component, ChangeDetectionStrategy } from '@angular/core';
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
  constructor(private readonly treeSelectionService: TreeSelectionService) {}

  protected get selectedItemIdsString() {
    return this.treeSelectionService.selectedItemIdsString;
  }

  protected onClearSelection(): void {
    this.treeSelectionService.clearAllSelections();
  }
}

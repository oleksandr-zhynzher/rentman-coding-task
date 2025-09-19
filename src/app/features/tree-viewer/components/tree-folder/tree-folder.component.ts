import {
  Component,
  computed,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeFolder, TreeCheckboxState } from '../../models/tree-viewer.models';
import { TreeSelectionService } from '../../services';
import { ChevronComponent, CheckboxComponent } from '../../../../shared';

@Component({
  selector: 'app-tree-folder',
  standalone: true,
  imports: [CommonModule, ChevronComponent, CheckboxComponent],
  templateUrl: './tree-folder.component.html',
  styleUrl: './tree-folder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeFolderComponent {
  readonly folder = input.required<TreeFolder>();
  readonly folderToggle = output<TreeFolder>();
  readonly folderSelect = output<TreeFolder>();

  readonly TreeCheckboxState = TreeCheckboxState;

  readonly checkboxState = computed(() =>
    this.treeSelectionService.getFolderCheckboxState(this.folder().id),
  );

  readonly isExpanded = computed(() => this.folder().expanded);

  constructor(private readonly treeSelectionService: TreeSelectionService) {}

  onToggleExpand(): void {
    const currentFolder = this.folder();
    currentFolder.expanded = !currentFolder.expanded;
    this.folderToggle.emit(currentFolder);
  }

  onFolderSelect(): void {
    this.folderSelect.emit(this.folder());
  }
}

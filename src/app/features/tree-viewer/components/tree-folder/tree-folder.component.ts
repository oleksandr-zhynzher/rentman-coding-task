import {
  Component,
  computed,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeFolder, TreeCheckboxState } from '../../models';
import { TreeSelectionService } from '../../services';
import { ChevronComponent, CheckboxComponent } from '../../../../shared';
import { isFolderEmpty } from '../../utils';

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

  protected readonly TreeCheckboxState = TreeCheckboxState;

  readonly checkboxState = computed(() =>
    this.treeSelectionService.getFolderCheckboxState(this.folder().originalId),
  );

  readonly isEmpty = computed(() => isFolderEmpty(this.folder()));

  constructor(private readonly treeSelectionService: TreeSelectionService) {}

  protected onToggleExpand(): void {
    if (this.isEmpty()) {
      return;
    }

    const currentFolder = this.folder();

    const updatedFolder: TreeFolder = {
      ...currentFolder,
      expanded: !currentFolder.expanded,
    };

    this.folderToggle.emit(updatedFolder);
  }

  protected onFolderSelect(): void {
    this.folderSelect.emit(this.folder());
  }
}

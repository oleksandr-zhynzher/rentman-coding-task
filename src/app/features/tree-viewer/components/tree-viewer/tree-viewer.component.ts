import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeNode, TreeFolder, TreeItem } from '../../models';
import { TreeSelectionService, TreeResourceService } from '../../services';
import { TreeFolderComponent } from '../tree-folder/tree-folder.component';
import { TreeItemComponent } from '../tree-item/tree-item.component';
import { SpinnerComponent, MessageComponent } from '../../../../shared';
import { isFolder, isItem } from '../../utils';

@Component({
  selector: 'app-tree-viewer',
  standalone: true,
  imports: [
    CommonModule,
    SpinnerComponent,
    MessageComponent,
    TreeItemComponent,
    TreeFolderComponent,
  ],
  templateUrl: './tree-viewer.component.html',
  styleUrl: './tree-viewer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeViewerComponent {
  protected readonly isFolder = isFolder;

  constructor(
    private readonly treeResourceService: TreeResourceService,
    private readonly treeSelectionService: TreeSelectionService
  ) {}

  protected get treeDataResource() {
    return this.treeResourceService.treeDataResource;
  }

  protected get flattenedTreeData() {
    return this.treeSelectionService.flattenedTreeData;
  }

  protected onFolderToggle(updatedFolder: TreeFolder): void {
    this.treeSelectionService.onFolderToggle(updatedFolder);
  }

  protected onFolderSelect(folder: TreeFolder): void {
    this.treeSelectionService.toggleFolderSelection(folder);
  }

  protected onItemSelect(item: TreeItem): void {
    this.treeSelectionService.toggleItemSelection(item.originalId);
  }
}

import {
  Component,
  OnInit,
  computed,
  signal,
  Signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  TreeNode,
  TreeFolder,
  TreeItem,
} from '../../models/tree-viewer.models';
import { TreeDataService, TreeSelectionService } from '../../services';
import { TreeFolderComponent } from '../tree-folder/tree-folder.component';
import { TreeItemComponent } from '../tree-item/tree-item.component';
import { SpinnerComponent, MessageComponent } from '../../../../shared';

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
export class TreeViewerComponent implements OnInit {
  private readonly _loading = signal(true);
  private readonly _error = signal<string | null>(null);
  private readonly _toggleTrigger = signal(0);

  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  visibleNodes!: Signal<TreeNode[]>;

  constructor(
    private readonly treeDataService: TreeDataService,
    private readonly treeSelectionService: TreeSelectionService
  ) {}

  ngOnInit(): void {
    this.visibleNodes = computed(() => {
      this._toggleTrigger();
      return this.flattenVisibleNodes(this.treeData());
    });

    this.loadData();
  }

  onFolderToggle(): void {
    this._toggleTrigger.update((value) => value + 1);
  }

  onFolderSelect(folder: TreeFolder): void {
    this.treeSelectionService.toggleFolderSelection(folder);
  }

  onItemSelect(item: TreeItem): void {
    this.treeSelectionService.toggleItemSelection(item.id);
  }

  get treeData() {
    return this.treeSelectionService.treeData;
  }

  private flattenVisibleNodes(nodes: TreeNode[]): TreeNode[] {
    const result: TreeNode[] = [];

    const flatten = (nodes: TreeNode[], parentExpanded = true) => {
      nodes.forEach((node) => {
        if (parentExpanded) {
          result.push(node);
        }

        if (this.isFolder(node) && parentExpanded && node.expanded) {
          flatten(node.children, true);
        }
      });
    };

    flatten(nodes);
    return result;
  }

  private loadData(): void {
    this._loading.set(true);
    this._error.set(null);

    this.treeDataService.getTreeData().subscribe({
      next: (data) => {
        this.treeSelectionService.updateTreeData(data);
      },
      error: (error) => {
        this._error.set(`Failed to load tree data. Please try again. ${error}`);
      },
      complete: () => {
        this._loading.set(false);
      },
    });
  }

  isFolder(node: TreeNode): node is TreeFolder {
    return 'children' in node;
  }

  isItem(node: TreeNode): node is TreeItem {
    return !('children' in node);
  }

  trackByNodeId(_index: number, node: TreeNode): number {
    return node.id;
  }
}

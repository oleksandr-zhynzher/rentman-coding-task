import { Injectable, computed, signal } from '@angular/core';
import {
  TreeCheckboxState,
  TreeFolder,
  TreeItem,
  TreeNode,
} from '../../models';
import { isFolder } from '../../utils';
import { TreeDataBuilderService } from '../tree-data-builder/tree-data-builder.service';

@Injectable({
  providedIn: 'root',
})
export class TreeSelectionService {
  readonly selectedItemIds = computed(() =>
    Array.from(this.selectedItemIdsState()).sort(
      (itemIdA, itemIdB) => itemIdA - itemIdB,
    ),
  );
  readonly selectedItemIdsString = computed(() =>
    this.selectedItemIds().join(', '),
  );
  readonly flattenedTreeData = computed(() =>
    this.treeDataBuilderService.flattenVisibleNodes(this.treeDataState()),
  );

  private readonly selectedItemIdsState = signal<Set<number>>(new Set());
  private readonly treeDataState = signal<TreeNode[]>([]);
  private readonly folderStates = computed(() =>
    this.calculateFolderStates(this.treeDataState()),
  );

  constructor(
    private readonly treeDataBuilderService: TreeDataBuilderService,
  ) {}

  updateTreeData(newTreeData: TreeNode[]): void {
    this.treeDataState.set(newTreeData);
    this.clearAllSelections();
  }

  onFolderToggle(updatedFolder: TreeFolder): void {
    this.treeDataState.update((currentTree) =>
      this.updateFolderInTree(currentTree, updatedFolder),
    );
  }

  toggleItemSelection(targetItemId: number): void {
    this.selectedItemIdsState.update((currentSelectionSet) => {
      const updatedSelectionSet = new Set(currentSelectionSet);

      if (updatedSelectionSet.has(targetItemId)) {
        updatedSelectionSet.delete(targetItemId);
      } else {
        updatedSelectionSet.add(targetItemId);
      }

      return updatedSelectionSet;
    });
  }

  toggleFolderSelection(targetFolder: TreeFolder): void {
    const folderItems = this.extractAllItemsFromFolder(targetFolder);
    const currentFolderState = this.determineFolderState(targetFolder);

    this.selectedItemIdsState.update((currentSelectionSet) => {
      const updatedSelectionSet = new Set(currentSelectionSet);

      for (const folderItem of folderItems) {
        if (currentFolderState === TreeCheckboxState.Checked) {
          updatedSelectionSet.delete(folderItem.originalId);
        } else {
          updatedSelectionSet.add(folderItem.originalId);
        }
      }
      return updatedSelectionSet;
    });
  }

  clearAllSelections(): void {
    this.selectedItemIdsState.set(new Set());
  }

  isItemSelected(targetItemId: number): boolean {
    return this.selectedItemIdsState().has(targetItemId);
  }

  getFolderCheckboxState(targetFolderId: number): TreeCheckboxState {
    return (
      this.folderStates().get(targetFolderId) || TreeCheckboxState.Unchecked
    );
  }

  private calculateFolderStates(
    treeData: TreeNode[],
  ): Map<number, TreeCheckboxState> {
    const stateMap = new Map<number, TreeCheckboxState>();
    const allFolderNodes = this.extractAllFolders(treeData);

    for (const folderNode of allFolderNodes) {
      stateMap.set(
        folderNode.originalId,
        this.determineFolderState(folderNode),
      );
    }

    return stateMap;
  }

  private determineFolderState(targetFolder: TreeFolder): TreeCheckboxState {
    const folderItems = this.extractAllItemsFromFolder(targetFolder);

    if (!folderItems.length) {
      return TreeCheckboxState.Unchecked;
    }

    const selectedItemsCount = folderItems.reduce((accumulator, folderItem) => {
      return this.selectedItemIdsState().has(folderItem.originalId)
        ? accumulator + 1
        : accumulator;
    }, 0);

    return this.getCheckboxStateBySelectionCount(
      selectedItemsCount,
      folderItems.length,
    );
  }

  private getCheckboxStateBySelectionCount(
    selectedCount: number,
    totalCount: number,
  ): TreeCheckboxState {
    switch (true) {
      case selectedCount === 0:
        return TreeCheckboxState.Unchecked;
      case selectedCount === totalCount:
        return TreeCheckboxState.Checked;
      case selectedCount > 0 && selectedCount < totalCount:
        return TreeCheckboxState.Indeterminate;
      default:
        return TreeCheckboxState.Unchecked;
    }
  }

  private extractAllItemsFromFolder(targetFolder: TreeFolder): TreeItem[] {
    return this.traverseAndCollect(
      targetFolder.children,
      (node) => !isFolder(node),
      (node) => node as TreeItem,
    );
  }

  private extractAllFolders(treeNodes: TreeNode[]): TreeFolder[] {
    return this.traverseAndCollect(
      treeNodes,
      (node) => isFolder(node),
      (node) => node as TreeFolder,
    );
  }

  private traverseAndCollect<T extends TreeNode>(
    nodes: TreeNode[],
    predicate: (node: TreeNode) => boolean,
    mapper: (node: TreeNode) => T,
  ): T[] {
    const collected: T[] = [];

    const traverse = (nodeList: TreeNode[]): void => {
      for (const node of nodeList) {
        if (predicate(node)) {
          collected.push(mapper(node));
        }

        if (isFolder(node)) {
          traverse(node.children);
        }
      }
    };

    traverse(nodes);
    return collected;
  }

  private updateFolderInTree(
    treeNodes: TreeNode[],
    updatedFolder: TreeFolder,
  ): TreeNode[] {
    return treeNodes.map((node) => {
      if (!isFolder(node)) {
        return node;
      }

      return node.id === updatedFolder.id
        ? updatedFolder
        : {
            ...node,
            children: this.updateFolderInTree(node.children, updatedFolder),
          };
    });
  }
}

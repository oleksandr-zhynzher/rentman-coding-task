import { Injectable, computed, signal } from '@angular/core';
import {
  TreeCheckboxState,
  TreeFolder,
  TreeItem,
  TreeNode,
} from '../../models/tree-viewer.models';

@Injectable({
  providedIn: 'root',
})
export class TreeSelectionService {
  private readonly selectedItemIdsState = signal<Set<number>>(new Set());
  private readonly treeDataState = signal<TreeNode[]>([]);

  readonly selectedItemIds = this.selectedItemIdsState.asReadonly();
  readonly treeData = this.treeDataState.asReadonly();

  readonly selectedItemIdsArray = computed(() =>
    Array.from(this.selectedItemIdsState()).sort(
      (itemIdA, itemIdB) => itemIdA - itemIdB,
    ),
  );

  readonly selectedItemCount = computed(() => this.selectedItemIdsState().size);

  readonly hasSelection = computed(() => this.selectedItemIdsState().size > 0);

  readonly folderStates = computed(() => {
    const stateMap = new Map<number, TreeCheckboxState>();
    const allFolderNodes = this.extractAllFolders(this.treeDataState());

    for (const folderNode of allFolderNodes) {
      stateMap.set(folderNode.id, this.determineFolderState(folderNode));
    }

    return stateMap;
  });

  updateTreeData(newTreeData: TreeNode[]): void {
    this.treeDataState.set(newTreeData);
    this.clearAllSelections();
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

      if (currentFolderState === TreeCheckboxState.Checked) {
        for (const folderItem of folderItems) {
          updatedSelectionSet.delete(folderItem.id);
        }
      } else {
        for (const folderItem of folderItems) {
          updatedSelectionSet.add(folderItem.id);
        }
      }

      return updatedSelectionSet;
    });
  }

  selectMultipleItems(itemIdsToSelect: number[]): void {
    this.selectedItemIdsState.update((currentSelectionSet) => {
      const updatedSelectionSet = new Set(currentSelectionSet);
      for (const itemIdToSelect of itemIdsToSelect) {
        updatedSelectionSet.add(itemIdToSelect);
      }
      return updatedSelectionSet;
    });
  }

  deselectMultipleItems(itemIdsToDeselect: number[]): void {
    this.selectedItemIdsState.update((currentSelectionSet) => {
      const updatedSelectionSet = new Set(currentSelectionSet);
      for (const itemIdToDeselect of itemIdsToDeselect) {
        updatedSelectionSet.delete(itemIdToDeselect);
      }
      return updatedSelectionSet;
    });
  }

  clearAllSelections(): void {
    this.selectedItemIdsState.set(new Set());
  }

  selectAllItems(): void {
    const allTreeItems = this.extractAllItems(this.treeDataState());
    const allItemIds = allTreeItems.map((treeItem) => treeItem.id);
    this.selectedItemIdsState.set(new Set(allItemIds));
  }

  isItemSelected(targetItemId: number): boolean {
    return this.selectedItemIdsState().has(targetItemId);
  }

  getFolderCheckboxState(targetFolderId: number): TreeCheckboxState {
    return (
      this.folderStates().get(targetFolderId) || TreeCheckboxState.Unchecked
    );
  }

  private determineFolderState(targetFolder: TreeFolder): TreeCheckboxState {
    const folderItems = this.extractAllItemsFromFolder(targetFolder);

    if (folderItems.length === 0) {
      return TreeCheckboxState.Unchecked;
    }

    const selectedItemsCount = folderItems.reduce((accumulator, folderItem) => {
      return this.selectedItemIdsState().has(folderItem.id)
        ? accumulator + 1
        : accumulator;
    }, 0);

    if (selectedItemsCount === 0) {
      return TreeCheckboxState.Unchecked;
    } else if (selectedItemsCount === folderItems.length) {
      return TreeCheckboxState.Checked;
    } else {
      return TreeCheckboxState.Indeterminate;
    }
  }

  private extractAllItemsFromFolder(targetFolder: TreeFolder): TreeItem[] {
    const collectedItems: TreeItem[] = [];

    const traverseAndCollectItems = (childNodes: TreeNode[]): void => {
      for (const childNode of childNodes) {
        if ('children' in childNode) {
          traverseAndCollectItems(childNode.children);
        } else {
          collectedItems.push(childNode);
        }
      }
    };

    traverseAndCollectItems(targetFolder.children);
    return collectedItems;
  }

  private extractAllItems(treeNodes: TreeNode[]): TreeItem[] {
    const collectedItems: TreeItem[] = [];

    const traverseAndCollectItems = (nodeList: TreeNode[]): void => {
      for (const treeNode of nodeList) {
        if ('children' in treeNode) {
          traverseAndCollectItems(treeNode.children);
        } else {
          collectedItems.push(treeNode);
        }
      }
    };

    traverseAndCollectItems(treeNodes);
    return collectedItems;
  }

  private extractAllFolders(treeNodes: TreeNode[]): TreeFolder[] {
    const collectedFolders: TreeFolder[] = [];

    const traverseAndCollectFolders = (nodeList: TreeNode[]): void => {
      for (const treeNode of nodeList) {
        if ('children' in treeNode) {
          collectedFolders.push(treeNode);
          traverseAndCollectFolders(treeNode.children);
        }
      }
    };

    traverseAndCollectFolders(treeNodes);
    return collectedFolders;
  }
}

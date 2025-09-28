import { Injectable } from '@angular/core';
import {
  TreeFolder,
  TreeItem,
  TreeNode,
  ApiDataSection,
  ItemDataRow,
} from '../../models';
import { isFolder, isFolderEmpty } from '../../utils';

@Injectable({
  providedIn: 'root',
})
export class TreeDataBuilderService {
  transformToTreeStructure(data: unknown): TreeNode[] {
    try {
      if (!this.isValidApiResponse(data)) {
        throw new Error('Invalid API response structure');
      }

      const folderNodes = this.createFolderNodes(
        data.folders as unknown as ApiDataSection<ItemDataRow>,
      );
      const itemNodes = this.createItemNodes(
        data.items as unknown as ApiDataSection<ItemDataRow>,
      );
      return this.buildHierarchicalTree(folderNodes, itemNodes);
    } catch (transformError) {
      const errorMessage = `Failed to transform API response: ${
        transformError instanceof Error
          ? transformError.message
          : 'Unknown error'
      }`;
      throw new Error(errorMessage);
    }
  }

  flattenVisibleNodes(nodes: TreeNode[]): TreeNode[] {
    const result: TreeNode[] = [];

    const flatten = (nodes: TreeNode[], parentExpanded = true) => {
      nodes.forEach((node) => {
        if (parentExpanded) {
          result.push(node);
        }

        if (isFolder(node) && parentExpanded && node.expanded) {
          flatten(node.children, true);
        }
      });
    };

    flatten(nodes);
    return result;
  }

  private createFolderNodes(
    folderData: ApiDataSection<ItemDataRow>,
  ): TreeFolder[] {
    return folderData.data.map((row: ItemDataRow) => ({
      id: this.generateFolderId(row[0]),
      originalId: row[0],
      title: row[1],
      parentId: row[2] !== null ? this.generateFolderId(row[2]) : null,
      children: [],
      expanded: true,
      level: 0,
    }));
  }

  private createItemNodes(itemData: ApiDataSection<ItemDataRow>): TreeItem[] {
    return itemData.data.map((row: ItemDataRow) => ({
      id: this.generateItemId(row[0]),
      originalId: row[0],
      title: row[1],
      folderId: row[2] !== null ? this.generateFolderId(row[2]) : null,
      level: 0,
    }));
  }

  private generateFolderId(originalId: number): string {
    return `folder-${originalId}`;
  }

  private generateItemId(originalId: number): string {
    return `item-${originalId}`;
  }

  private isValidApiResponse(
    data: unknown,
  ): data is { folders: unknown; items: unknown } {
    if (!data || typeof data !== 'object') {
      return false;
    }

    const response = data as Record<string, unknown>;

    return (
      this.isValidDataSection(response['folders']) &&
      this.isValidDataSection(response['items'])
    );
  }

  private isValidDataSection(
    section: unknown,
  ): section is ApiDataSection<unknown[]> {
    if (!section || typeof section !== 'object') {
      return false;
    }

    const dataSection = section as Record<string, unknown>;

    return (
      Array.isArray(dataSection['columns']) &&
      Array.isArray(dataSection['data']) &&
      dataSection['columns'].every((col) => typeof col === 'string')
    );
  }

  private buildHierarchicalTree(
    folderNodes: TreeFolder[],
    itemNodes: TreeItem[],
  ): TreeNode[] {
    const folderLookup = new Map<string, TreeFolder>();
    const rootNodes: TreeFolder[] = [];

    for (const folderNode of folderNodes) {
      folderLookup.set(folderNode.id, folderNode);
      if (folderNode.parentId === null) {
        rootNodes.push(folderNode);
      }
    }

    for (const folderNode of folderNodes) {
      if (folderNode.parentId !== null) {
        const parentFolder = folderLookup.get(folderNode.parentId);
        if (parentFolder) {
          parentFolder.children.push(folderNode);
        }
      }
    }

    for (const itemNode of itemNodes) {
      if (itemNode.folderId !== null) {
        const parentFolder = folderLookup.get(itemNode.folderId);
        if (parentFolder) {
          parentFolder.children.push(itemNode);
        }
      }
    }

    this.assignLevelsAndSort(rootNodes, 0);
    this.setEmptyFoldersCollapsed(rootNodes);
    return rootNodes;
  }

  private setEmptyFoldersCollapsed(nodes: TreeNode[]): void {
    for (const node of nodes) {
      if (isFolder(node)) {
        if (isFolderEmpty(node)) {
          node.expanded = false;
        } else {
          this.setEmptyFoldersCollapsed(node.children);
        }
      }
    }
  }

  private assignLevelsAndSort(
    treeNodes: TreeNode[],
    currentLevel: number,
  ): void {
    for (const treeNode of treeNodes) {
      treeNode.level = currentLevel;

      if (isFolder(treeNode)) {
        treeNode.children.sort((nodeA, nodeB) => {
          const isNodeAFolder = isFolder(nodeA);
          const isNodeBFolder = isFolder(nodeB);

          if (isNodeAFolder && !isNodeBFolder) return -1;
          if (!isNodeAFolder && isNodeBFolder) return 1;

          return nodeA.title.localeCompare(nodeB.title, undefined, {
            numeric: true,
            sensitivity: 'base',
          });
        });

        this.assignLevelsAndSort(treeNode.children, currentLevel + 1);
      }
    }
  }
}

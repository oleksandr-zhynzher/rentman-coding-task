import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import {
  ApiResponse,
  TreeFolder,
  TreeItem,
  TreeNode,
} from '../../models/tree-viewer.models';
import { ApiService } from '../../../../shared';

@Injectable({
  providedIn: 'root',
})
export class TreeDataService {
  private readonly apiService = inject(ApiService);
  private readonly dataEndpoint = '/api/data' as const;

  getTreeData(): Observable<TreeNode[]> {
    return this.apiService
      .get<ApiResponse>(this.dataEndpoint)
      .pipe(map((apiResponse) => this.transformToTreeStructure(apiResponse)));
  }

  private transformToTreeStructure(apiResponse: ApiResponse): TreeNode[] {
    try {
      const folderNodes = this.createFolderNodes(apiResponse.folders);
      const itemNodes = this.createItemNodes(apiResponse.items);
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

  private createFolderNodes(folderData: ApiResponse['folders']): TreeFolder[] {
    return folderData.data.map(([rawId, folderTitle, rawParentId]) => ({
      id: Number(rawId),
      title: folderTitle,
      parentId: rawParentId !== null ? Number(rawParentId) : null,
      children: [],
      expanded: true,
      level: 0,
    }));
  }

  private createItemNodes(itemData: ApiResponse['items']): TreeItem[] {
    return itemData.data.map(([rawId, itemTitle, rawFolderId]) => ({
      id: Number(rawId),
      title: itemTitle,
      folderId: rawFolderId !== null ? Number(rawFolderId) : null,
      level: 0,
    }));
  }

  private buildHierarchicalTree(
    folderNodes: TreeFolder[],
    itemNodes: TreeItem[],
  ): TreeNode[] {
    const folderLookup = new Map<number, TreeFolder>();
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
    return rootNodes;
  }

  private assignLevelsAndSort(
    treeNodes: TreeNode[],
    currentLevel: number,
  ): void {
    for (const treeNode of treeNodes) {
      treeNode.level = currentLevel;

      if ('children' in treeNode) {
        treeNode.children.sort((nodeA, nodeB) => {
          const isNodeAFolder = 'children' in nodeA;
          const isNodeBFolder = 'children' in nodeB;

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

import { TreeNode } from './types';

export interface TreeFolder {
  id: number;
  title: string;
  expanded: boolean;
  level: number;
  parentId: number | null;
  children: TreeNode[];
}

export interface TreeItem {
  id: number;
  title: string;
  folderId: number | null;
  level: number;
}

export interface ApiResponse {
  folders: {
    columns: string[];
    data: string[];
  };
  items: {
    columns: string[];
    data: string[];
  };
}

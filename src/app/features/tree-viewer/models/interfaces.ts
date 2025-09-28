import { TreeNode } from './types';

export interface TreeFolder {
  id: string;
  originalId: number;
  title: string;
  expanded: boolean;
  level: number;
  parentId: string | null;
  children: TreeNode[];
}

export interface TreeItem {
  id: string;
  originalId: number;
  title: string;
  folderId: string | null;
  level: number;
}

export interface ApiDataSection<T> {
  columns: string[];
  data: T[];
}

export interface ApiResponse {
  folders: ApiDataSection<unknown[]>;
  items: ApiDataSection<unknown[]>;
}

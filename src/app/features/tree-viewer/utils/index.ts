import { TreeNode, TreeFolder, TreeItem } from '../models';

/**
 * Type guard to check if a tree node is a folder
 */
export function isFolder(node: TreeNode): node is TreeFolder {
  return 'children' in node;
}

/**
 * Type guard to check if a tree node is an item
 */
export function isItem(node: TreeNode): node is TreeItem {
  return !('children' in node);
}

/**
 * Check if a folder is empty (has no children)
 */
export function isFolderEmpty(folder: TreeFolder): boolean {
  return folder.children.length === 0;
}

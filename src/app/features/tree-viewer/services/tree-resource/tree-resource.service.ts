import { Injectable } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { BASE_URL, DATA_ENDPOINT } from '../../../../shared';
import { TreeNode } from '../../models';
import { TreeDataBuilderService } from '../tree-data-builder/tree-data-builder.service';
import { TreeSelectionService } from '../tree-selection/tree-selection.service';

@Injectable({
  providedIn: 'root',
})
export class TreeResourceService {
  readonly treeDataResource = httpResource(
    () => ({
      url: `${BASE_URL}${DATA_ENDPOINT}`,
    }),
    {
      parse: (data: unknown) => this.parseTreeData(data),
    },
  );

  constructor(
    private readonly treeSelectionService: TreeSelectionService,
    private readonly treeDataBuilderService: TreeDataBuilderService,
  ) {}

  private parseTreeData(data: unknown): TreeNode[] {
    const treeStructure =
      this.treeDataBuilderService.transformToTreeStructure(data);
    this.treeSelectionService.updateTreeData(treeStructure);
    return treeStructure;
  }
}

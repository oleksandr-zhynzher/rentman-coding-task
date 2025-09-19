import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  TreeSelectionSummaryComponent,
  TreeViewerComponent,
} from './features/tree-viewer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, TreeViewerComponent, TreeSelectionSummaryComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Tree Viewer with Selection';
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeViewerComponent } from './features/tree-viewer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, TreeViewerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Tree Viewer with Selection';
}

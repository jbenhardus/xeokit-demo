import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Viewer, XKTLoaderPlugin } from '@xeokit/xeokit-sdk';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent {
  title = 'xeokit-demo';
  viewer?: Viewer;
  xktLoader?: XKTLoaderPlugin;
  model?: any;

  ngOnInit() {
    const canvasElement = document.getElementById(
      'myCanvas'
    ) as HTMLCanvasElement;
    if (canvasElement) {
      this.viewer = new Viewer({
        canvasElement,
        transparent: true,
        saoEnabled: true,
      });

      this.viewer.scene.camera.eye = [
        14.915582703146043, 14.396781491179095, 5.431098754133695,
      ];
      this.viewer.scene.camera.look = [
        6.599999999999998, 8.34099990051474, -4.159999575600315,
      ];
      this.viewer.scene.camera.up = [
        -0.2820584034861215, 0.9025563895259413, -0.3253229483893775,
      ];

      this.xktLoader = new XKTLoaderPlugin(this.viewer);
    }
  }

  loadModel(src?: string) {
    if (!src) {
      src = './assets/models/xkt/v8/ifc/OTCConferenceCenter.ifc.xkt';
    }
    if (this.viewer && this.xktLoader) {
      this.model = this.xktLoader.load({
        id: 'myModel',
        src,
        saoEnabled: true,
        edges: false,
        objectDefaults: {
          // This model has opaque windows / spaces; make them transparent
          IfcPlate: {
            opacity: 0.3, // These are used as windows in this model - make transparent
          },
          IfcWindow: {
            opacity: 0.4,
          },
          IfcSpace: {
            opacity: 0.4,
          },
        },
      });
      this.model.on('loaded', () => {
        if (this.viewer) {
          this.viewer.cameraFlight.jumpTo(this.model);
        }
      });
    }
  }

  fileSelected(event: any) {
    this.model?.destroy();
    const file: File = event.target.files[0];
    if (file) {
      const url = window.URL.createObjectURL(file);
      this.loadModel(url);
    }
  }
}

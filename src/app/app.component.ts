import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import {
  FastNavPlugin,
  GLTFLoaderPlugin,
  Viewer,
  WebIFCLoaderPlugin,
  XKTLoaderPlugin,
} from '@xeokit/xeokit-sdk';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent {
  title = 'xeokit-demo';
  viewer?: Viewer;
  xktLoader?: XKTLoaderPlugin;
  gltfLoader?: GLTFLoaderPlugin;
  ifcLoader?: WebIFCLoaderPlugin;
  model?: any;
  fastNavPlugin?: FastNavPlugin;
  gltfId: string = '11_MB';
  glbId: string = 'file1';

  ngOnInit() {
    const canvasElement = document.getElementById(
      'myCanvas'
    ) as HTMLCanvasElement;
    if (canvasElement) {
      this.viewer = new Viewer({
        canvasElement,
        transparent: true,
        saoEnabled: true,
        pbrEnabled: false,
      });

      this.fastNavPlugin = new FastNavPlugin(this.viewer, {
        hideEdges: true,
        hideSAO: true,
        hidePBR: false,
        hideTransparentObjects: false,
        scaleCanvasResolution: false,
        scaleCanvasResolutionFactor: 0.6,
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
      this.gltfLoader = new GLTFLoaderPlugin(this.viewer);
      this.ifcLoader = new WebIFCLoaderPlugin(this.viewer, {
        wasmPath: '../assets/',
      });
    }
  }

  loadModel(src?: string) {
    if (!src) {
      src = './assets/models/gltf/160_MB/160_MB.gltf';
    }
    if (this.viewer && this.xktLoader) {
      this.model = this.xktLoader.load({
        id: 'myModel',
        src,
        saoEnabled: true,
        edges: false,
      });
      this.model?.on('loaded', () => {
        if (this.viewer) {
          this.viewer.cameraFlight.jumpTo(this.model);
        }
      });
    }
  }

  fileSelected(event: any) {
    this.model?.destroy();
    const file: File = event.target.files[0];
    const isIFC = file.name.endsWith('.ifc');
    if (file) {
      const url = window.URL.createObjectURL(file);
      if (isIFC) {
        this.loadIFC(url);
      } else {
        this.loadModel(url);
      }
    }
  }

  loadIFC(src: string) {
    this.model = this.ifcLoader?.load({
      id: 'myModel',
      src,
      edges: true,
      excludeTypes: ['IfcSpace'],
    });
    this.model?.on('loaded', () => {
      this.viewer?.cameraFlight.jumpTo(this.model);
    });
  }

  isGLTF(file: File) {
    const fileParts = file.name.split('.');
    const extension = fileParts[fileParts.length - 1];
    return extension === 'gltf' || extension === 'glb';
  }

  loadGLTF() {
    if (this.gltfId) {
      this.model?.destroy();
      const start = Date.now();
      const gltfSrc: string = `./assets/models/gltf/${this.gltfId}/${this.gltfId}.gltf`;
      const metadataSrc: string = `./assets/models/gltf/${this.gltfId}/${this.gltfId}.metadata.json`;
      this.model = this.gltfLoader?.load({
        id: 'myModel',
        src: gltfSrc,
        metaModelSrc: metadataSrc,
        edges: true,
      });
      this.model?.on('loaded', () => {
        if (this.viewer) {
          this.viewer.cameraFlight.jumpTo(this.model);
          const scene = this.viewer.scene;
          const metaScene = this.viewer.metaScene;
          console.log(scene.objectIds);
          console.log(scene.objects);
          console.log(scene.numObjects);
          console.log(metaScene.metaObjects);
          console.log(metaScene.metaModels);
          console.log(`Loaded in ${Date.now() - start} ms`);
        }
      });
    }
  }

  loadGLB() {
    if (this.glbId) {
      const startTimestamp = Date.now();
      this.model?.destroy();
      const gltfSrc: string = `./assets/models/glb/${this.glbId}.glb`;
      const metadataSrc: string = `./assets/models/glb/${this.glbId}.json`;
      // const gltfSrc: string =
      //   'https://s3.amazonaws.com/tsvabqmdcirbjnxq/qvHDimMUqxZcQnsj/ySDGCKdcT5CkGwEFwwcf_500_MB.glb';
      // const metadataSrc: string =
      //   'https://s3.amazonaws.com/tsvabqmdcirbjnxq/qvHDimMUqxZcQnsj/wgtSfsuHRCuMxLdpzo0o_500_MB.json';
      this.model = this.gltfLoader?.load({
        id: 'myModel',
        src: gltfSrc,
        // metaModelSrc: metadataSrc,
        edges: true,
      });
      this.model?.on('loaded', () => {
        const endTimestamp = Date.now();
        console.log(`loaded in ${endTimestamp - startTimestamp}ms`);
        if (this.viewer) {
          this.viewer.cameraFlight.jumpTo(this.model);
        }
      });
    }
  }

  getExtension(file: File) {
    const fileParts = file.name.split('.');
    const extension = fileParts[fileParts.length - 1];
    return extension;
  }
}

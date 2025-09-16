export class CesiumPage {
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto(`/Specs/e2e/cesium.html`);

    await this.page.addScriptTag({
      path: process.env.release
        ? "cesium/Build/Cesium/Cesium.js"
        : "cesium/Build/CesiumUnminified/Cesium.js",
    });
    await this.page.addScriptTag({
      content: process.env.release
        ? `window.CESIUM_BASE_URL = "../../cesium/Build/Cesium/";`
        : `window.CESIUM_BASE_URL = "../../cesium/Build/CesiumUnminified/";`,
    });
  }
}

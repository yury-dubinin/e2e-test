export class TestConfig {

  getBrowserExtensionConfig(headless: boolean, pathToExtension: string) {
    const viewport = { width: 1440, height: 1280 }
    const args = [
      "--headless=new",
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
    ]
      return {
        headless: headless,
        args: args,
        viewport: viewport,
        slowMo: 300,
      }
  }

  getBrowserConfig(headless: boolean) {
    const viewport = { width: 1440, height: 1280 }
      return {
        headless: headless,
        viewport: viewport,
        slowMo: 300,
      }
  }
}

/* eslint-disable import/no-extraneous-dependencies */
import { type BrowserContext, chromium, test } from "@playwright/test";

import { PolarisPage } from "../pages/polaris-page";
import { UnzipKeplrExtension } from "../unzip-extension";
import { TestConfig } from "../test-config";
import { KeplrPage } from "../pages/keplr-page";

// To run use --timeout 180000 flag
test.describe("Test Keplr and MetaMask swaps feature", () => {
  let context: BrowserContext;
  let tradePage: PolarisPage;
  const testSeed = process.env.TEST_SEED ?? "seed goes here";

  test.beforeAll(async () => {
    const pathToExtension = new UnzipKeplrExtension().getPathToKeplrExtension()
    console.log('\nSetup Keplr Wallet Extension before tests.')
    // Launch Chrome with a Keplr wallet extension
    context = await chromium.launchPersistentContext(
      '',
      new TestConfig().getBrowserExtensionConfig(false, pathToExtension),
    )
    // Get all new pages (including Extension) in the context and wait
    const emptyPage = context.pages()[0]
    await emptyPage.waitForTimeout(3000)
    const page = context.pages()[1]
    const walletPage = new KeplrPage(page)
    await walletPage.importWalletFromSeed(testSeed)
    // Switch to Application
    tradePage = new PolarisPage(context.pages()[0])
    await tradePage.gotoLogin()
    await tradePage.connectKeplrWallet()
  });

  test.afterAll(async () => {
    console.log("\nClose after tests.\n");
    if (context) {
      await context.close();
    }
  });

  test("User should be able to swap Noble:USDC to Base:USDC", async () => {
    await tradePage.goto();
    await tradePage.enterAmount("0.69");
    await tradePage.selectFromAsset("Noble", "USDC");
    await tradePage.selectToAsset("Base", "USDC");
    await tradePage.reviewTransfer();
    await tradePage.confirmChains('Noble', 'Base')
    await tradePage.confirmSwapAndApproveInWallet(context)
    await tradePage.awaitDoneSwap()
  });

  test('User should be able to swap Noble:USDC to Polygon:USDC', async () => {
    await tradePage.goto()
    await tradePage.enterAmount('0.69')
    await tradePage.selectFromAsset('Noble', 'USDC')
    await tradePage.selectToAsset('Polygon', 'USDC')
    await tradePage.reviewTransfer()
    await tradePage.confirmChains('Noble', 'Polygon')
    await tradePage.confirmSwapAndApproveInWallet(context)
    await tradePage.awaitDoneSwap()
  });
});

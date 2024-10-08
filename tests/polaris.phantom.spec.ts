/* eslint-disable import/no-extraneous-dependencies */
import { type BrowserContext, chromium, expect, test } from "@playwright/test";

import { PolarisPage } from "../pages/polaris-page";
import { UnzipKeplrExtension } from "../unzip-extension";
import { TestConfig } from "../test-config";
import { PhantomPage } from "../pages/phantom-page";

test.describe("Test Polaris Phantom select for a swaps feature", () => {
  let context: BrowserContext;
  let tradePage: PolarisPage;
  const testSeed = process.env.TEST_SEED ?? "seed goes here";

  test.beforeAll(async () => {
    const pathToExtension = new UnzipKeplrExtension().getPathToPhantomExtension();
    console.log("\nSetup Phantom Wallet Extension before tests.");
    context = await chromium.launchPersistentContext(
      '',
      new TestConfig().getBrowserExtensionConfig(false, pathToExtension),
    );
    context.setDefaultNavigationTimeout(20000)
    const emptyPage = context.pages()[0];
    // Playwright is too fast to decide that page is not opened.
    await emptyPage.waitForTimeout(5000);
    const page = context.pages()[1];
    const walletPage = new PhantomPage(page);
    await walletPage.importWalletFromSeed(
      testSeed
    );
    // Switch to Application
    tradePage = new PolarisPage(context.pages()[0]);
    await tradePage.gotoLogin();
    await tradePage.connectPhantomWallet();
  });

  test.afterAll(async () => {
    console.log("\nClose after tests.\n");
    if (context) {
      await context.close();
    }
  });

  test('User should be able to see some Balance', async () => {
    await tradePage.goto()
    expect(await tradePage.getTotalBalance()).toContain('$')
  })

  test("User should be able to select Polygon:USDC to Solana:USDC and review and cancel", async () => {
    await tradePage.goto();
    await tradePage.enterAmount("1");
    await tradePage.selectFromAsset("Polygon", "USDC");
    await tradePage.selectToAsset("Solana", "USDC");
    await tradePage.reviewTransfer();
    await tradePage.confirmChains('Polygon', 'Solana')
    await tradePage.reviewCancel();
  });

  test("User should be able to select Solana:USDC to Solana:SOL and review and cancel", async () => {
    await tradePage.goto();
    await tradePage.enterAmount("1");
    await tradePage.selectFromAsset("Solana", "USDC");
    await tradePage.selectToAsset("Solana", "SOL");
    await tradePage.reviewTransfer();
    await tradePage.confirmChains('Solana', 'Solana')
    await tradePage.reviewCancel();
  });

  test("User should be able to select Solana:USDC to Polygon:USDC and review and cancel", async () => {
    await tradePage.goto();
    await tradePage.enterAmount("1");
    await tradePage.selectFromAsset("Solana", "USDC");
    await tradePage.selectToAsset("Polygon", "USDC");
    await tradePage.reviewTransfer();
    await tradePage.confirmChains('Solana', 'Polygon')
    await tradePage.reviewCancel();
  });
});

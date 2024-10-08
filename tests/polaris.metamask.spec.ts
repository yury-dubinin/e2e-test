/* eslint-disable import/no-extraneous-dependencies */
import { type BrowserContext, chromium, expect, test } from "@playwright/test";

import { MetamaskPage } from "../pages/metamask-page";

import { PolarisPage } from "../pages/polaris-page";
import { UnzipKeplrExtension } from "../unzip-extension";
import { TestConfig } from "../test-config";

test.describe("Test Polaris MetaMask select for a swaps feature", () => {
  let context: BrowserContext;
  let tradePage: PolarisPage;
  const testSeed = process.env.TEST_SEED ?? "seed goes here";

  test.beforeAll(async () => {
    const pathToExtension = new UnzipKeplrExtension().getPathToMetaMaskExtension();
    console.log("\nSetup MetaMask Wallet Extension before tests.");
    context = await chromium.launchPersistentContext(
      '',
      new TestConfig().getBrowserExtensionConfig(false, pathToExtension),
    );
    const emptyPage = context.pages()[0];
    await emptyPage.waitForTimeout(4000);
    const page = context.pages()[1];
    const walletPage = new MetamaskPage(page);
    await walletPage.importWalletFromSeed(
      testSeed
    );
    // Switch to Application
    tradePage = new PolarisPage(context.pages()[0]);
    await tradePage.gotoLogin();
    await tradePage.connectMetaMaskWallet();
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

  test("User should be able to select Arbitrum:USDC to Base:USDC and cancel", async () => {
    await tradePage.goto();
    await tradePage.enterAmount("1");
    await tradePage.selectFromAsset("Arbitrum", "USDC");
    await tradePage.selectToAsset("Base", "USDC");
    await tradePage.reviewTransfer();
    await tradePage.confirmChains('Arbitrum', 'Base')
    await tradePage.reviewCancel();
  });

  test("User should be able to select Optimism:USDC to Base:USDC and review", async () => {
    await tradePage.goto();
    await tradePage.enterAmount("1");
    await tradePage.selectFromAsset("Optimism", "USDC");
    await tradePage.selectToAsset("Base", "USDC");
    await tradePage.reviewTransfer();
    await tradePage.confirmChains('Optimism', 'Base')
  });

  test("User should be to select Polygon:WETH to Solana:USDC and review", async () => {
    await tradePage.goto();
    await tradePage.enterAmount("0.0015");
    await tradePage.selectFromAssetById("Polygon", "WETH:0x7ceb23fd6bc0add59e62ac25578270cff1b9f619");
    await tradePage.selectToAsset("Solana", "USDC");
    await tradePage.reviewTransfer();
    await tradePage.confirmChains('Polygon', 'Solana')
  });
});

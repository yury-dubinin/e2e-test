/* eslint-disable import/no-extraneous-dependencies */
import { type BrowserContext, chromium, test } from '@playwright/test'
import process from 'process'

import { UnzipKeplrExtension } from '../unzip-extension'

import { PolarisPage } from '../pages/polaris-page'
import { TestConfig } from '../test-config'
import { PhantomPage } from '../pages/phantom-page'

test.describe('Test Polaris Phantom swap feature', () => {
  let context: BrowserContext
  const testSeed = process.env.TEST_SEED ?? 'seed goes here'
  let tradePage: PolarisPage

  test.beforeAll(async () => {
    const pathToExtension = new UnzipKeplrExtension().getPathToPhantomExtension();
    console.log("\nSetup Phantom Wallet Extension before tests.");
    context = await chromium.launchPersistentContext(
      '',
      new TestConfig().getBrowserExtensionConfig(false, pathToExtension),
    );
    // Get all new pages (including Extension) in the context and wait
    const emptyPage = context.pages()[0]
    await emptyPage.waitForTimeout(2000)
    const page = context.pages()[1]
    const walletPage = new PhantomPage(page)
    await walletPage.importWalletFromSeed(testSeed)
    // Switch to Application
    tradePage = new PolarisPage(context.pages()[0])
    await tradePage.gotoLogin()
    await tradePage.connectPhantomWallet()
  })

  test.afterAll(async () => {
    console.log("\nClose after tests.\n");
    if (context) {
      await context.close();
    }
  })

  test("User should be able to select Polygon:WMATIC to Polygon:USDC", async () => {
    await tradePage.goto();
    await tradePage.enterAmount("0.5");
    await tradePage.selectFromAsset("Polygon", "WMATIC");
    await tradePage.selectToAsset("Polygon", "USDC");
    await tradePage.reviewTransfer();
    await tradePage.confirmChains('Polygon', 'Polygon')
    await tradePage.confirmSwapAndConfirmInWallet(context)
    await tradePage.awaitDoneSwap()
  });

  // This raute takes 25 minutes
  test.skip("User should be able to select Polygon:USDC to Solana:USDC", async () => {
    await tradePage.goto();
    await tradePage.enterAmount("0.5");
    await tradePage.selectFromAsset("Polygon", "USDC");
    await tradePage.selectToAsset("Solana", "USDC");
    await tradePage.reviewTransfer();
    await tradePage.confirmChains('Polygon', 'Solana')
    await tradePage.confirmSwapAndConfirmInWallet(context)
    await tradePage.awaitDoneSwap()
  });

  test("User should be able to select Solana:USDC to Polygon:USDC", async () => {
    await tradePage.goto();
    await tradePage.enterAmount("0.5");
    await tradePage.selectFromAsset("Solana", "USDC");
    await tradePage.selectToAsset("Polygon", "USDC");
    await tradePage.reviewTransfer();
    await tradePage.confirmChains('Solana', 'Polygon')
    await tradePage.confirmSwapAndConfirmInWallet(context)
    await tradePage.awaitDoneSwap()
  });
})

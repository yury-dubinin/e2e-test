/* eslint-disable import/no-extraneous-dependencies */
import { type BrowserContext, chromium, test } from "@playwright/test";


import { PolarisPage } from "../pages/polaris-page";
import { UnzipKeplrExtension } from "../unzip-extension";
import { MultiWalletPage } from "../pages/multi-wallet";

// To run use --timeout 180000 flag
test.describe("Test Keplr and Phantom swaps feature", () => {
  let context: BrowserContext;
  let tradePage: PolarisPage;
  const testSeed = process.env.TEST_SEED ?? "seed goes here";

  test.beforeAll(async () => {
    const pathToPhantomExtension = new UnzipKeplrExtension().getPathToPhantomExtension();
    const pathToKeplrExtension = new UnzipKeplrExtension().getPathToKeplrExtension();
    console.log("\nSetup Wallet Extensions before tests.");
    context = await chromium.launchPersistentContext(
      '',{
        headless: false,
        args: [
          "--headless=new",
          `--disable-extensions-except=${pathToPhantomExtension},${pathToKeplrExtension}`,
          `--load-extension=${pathToPhantomExtension},${pathToKeplrExtension}`,
        ],
      },
    );
    const emptyPage = context.pages()[0];
    await emptyPage.waitForTimeout(2000);
    // get both wallets
    const wallet1 = context.pages()[1];
    const wallet2 = context.pages()[2];
    let walletPage = new MultiWalletPage(wallet1);
    await walletPage.importWalletFromSeed(
      testSeed
    );
    walletPage = new MultiWalletPage(wallet2);
    await walletPage.importWalletFromSeed(
      testSeed
    );
    // Switch to Application
    tradePage = new PolarisPage(context.pages()[0]);
    await tradePage.gotoLogin();
    await tradePage.connectPhantomWallet();
    await tradePage.connectKeplrWallet(false);
  });

  test.afterAll(async () => {
    console.log("\nClose after tests.\n");
    if (context) {
      await context.close();
    }
  });

  test("User should be able to swap Solana:USDC to Noble:USDC", async () => {
    await tradePage.goto();
    await tradePage.enterAmount("0.69");
    await tradePage.selectFromAsset("Solana", "USDC");
    await tradePage.selectToAsset("Noble", "USDC");
    await tradePage.reviewTransfer();
    await tradePage.confirmChains('Solana', 'Noble')
    await tradePage.confirmSwapAndConfirmInWallet(context)
    await tradePage.awaitDoneSwap()
  });
});

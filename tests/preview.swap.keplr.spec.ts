/* eslint-disable import/no-extraneous-dependencies */
import { type BrowserContext, chromium, expect, test } from '@playwright/test'
import process from 'process'

import { UnzipKeplrExtension } from '../unzip-extension'

import { KeplrPage } from '../pages/keplr-page'
import { PolarisPage } from '../pages/polaris-page'
import { TestConfig } from '../test-config'

test.describe('Test Polaris Keplr select for a swap feature', () => {
  let context: BrowserContext
  const testSeed = process.env.TEST_SEED ?? 'seed goes here'
  let tradePage: PolarisPage

  test.beforeAll(async () => {
    const pathToExtension = new UnzipKeplrExtension().getPathToKeplrExtension()
    console.log('\nSetup Wallet Extension before tests.')
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
    await tradePage.connectKeplrWallet(false)
  })

  test.afterAll(async () => {
    console.log("\nClose after tests.\n");
    if (context) {
      await context.close();
    }
  })

  test('User should be able to swap Celestia:TIA to Osmosis:TIA', async () => {
    await tradePage.goto()
    expect(await tradePage.getTotalBalance()).toContain('$')
    await tradePage.enterAmount('0.05')
    await tradePage.selectFromAsset('Celestia', 'TIA')
    await tradePage.selectToAsset('Osmosis', 'TIA')
    await tradePage.reviewTransfer()
    await tradePage.confirmChains('Celestia', 'Osmosis')
    await tradePage.confirmSwapAndApproveInWallet(context)
    await tradePage.awaitDoneSwap()
  })

  test('User should be able to swap Osmosis:USDC to Noble:USDC', async () => {
    await tradePage.goto()
    await tradePage.enterAmount('0.55')
    await tradePage.selectFromAsset('Osmosis', 'USDC')
    await tradePage.selectToAsset('Noble', 'USDC')
    await tradePage.reviewTransfer()
    await tradePage.confirmChains('Osmosis', 'Noble')
    await tradePage.confirmSwapAndApproveInWallet(context)
    await tradePage.awaitDoneSwap()
  })

  test('User should be able to swap Noble:USDC to Celestia:TIA', async () => {
    await tradePage.goto()
    await tradePage.enterAmount('0.5')
    await tradePage.selectFromAsset('Noble', 'USDC')
    await tradePage.selectToAsset('Celestia', 'TIA')
    await tradePage.reviewTransfer()
    await tradePage.confirmChains('Noble', 'Celestia')
    await tradePage.confirmSwapAndApproveInWallet(context)
    await tradePage.awaitDoneSwap()
  })
})

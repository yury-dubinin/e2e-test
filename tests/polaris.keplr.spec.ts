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
    console.log('\nSetup Keplr Wallet Extension before tests.')
    // Launch Chrome with a Keplr wallet extension
    context = await chromium.launchPersistentContext(
      '',
      new TestConfig().getBrowserExtensionConfig(false, pathToExtension),
    )
    // Get all new pages (including Extension) in the context and wait
    const emptyPage = context.pages()[0]
    await emptyPage.waitForTimeout(2000)
    const page = context.pages()[1]
    const walletPage = new KeplrPage(page)
    await walletPage.importWalletFromSeed(testSeed)
    // Switch to Application
    tradePage = new PolarisPage(context.pages()[0])
    await tradePage.gotoLogin()
    await tradePage.connectKeplrWallet()
  })

  test.afterAll(async () => {
    console.log("\nClose after tests.\n");
    if (context) {
      await context.close();
    }
  })

  test('User should be able to see some Balance', async () => {
    await tradePage.goto()
    expect(await tradePage.getTotalBalance()).toContain('$')
  })

  test('User should be able to select Osmosis:OSMO to Osmosis:TIA and cancel', async () => {
    await tradePage.goto()
    await tradePage.enterAmount('0.5')
    await tradePage.selectFromAsset('Osmosis', 'OSMO')
    await tradePage.selectToAsset('Osmosis', 'TIA')
    await tradePage.reviewTransfer()
    await tradePage.confirmChains('Osmosis', 'Osmosis')
    await tradePage.reviewCancel()
  })

  test('User should be able to select Osmosis:OSMO to Osmosis:USDC and review', async () => {
    await tradePage.goto()
    await tradePage.enterAmount('0.5')
    await tradePage.selectFromAsset('Osmosis', 'OSMO')
    await tradePage.selectToAsset('Osmosis', 'USDC')
    await tradePage.reviewTransfer()
    await tradePage.confirmChains('Osmosis', 'Osmosis')
  })

  test('User should be able to select Osmosis:OSMO to Celestia:TIA and review', async () => {
    await tradePage.goto()
    await tradePage.enterAmount('0.1')
    await tradePage.selectFromAsset('Osmosis', 'OSMO')
    await tradePage.selectToAsset('Celestia', 'TIA')
    await tradePage.reviewTransfer()
    await tradePage.confirmChains('Osmosis', 'Celestia')
  })

  test('User should be able to select Osmosis:USDC to Noble:USDC and review', async () => {
    await tradePage.goto()
    await tradePage.enterAmount('0.15')
    await tradePage.selectFromAsset('Osmosis', 'USDC')
    await tradePage.selectToAsset('Noble', 'USDC')
    await tradePage.reviewTransfer()
    await tradePage.confirmChains('Osmosis', 'Noble')
  })

  test('User should be able to select Osmosis:USDC to Cosmos Hub:USDC and review', async () => {
    await tradePage.goto()
    await tradePage.enterAmount('0.15')
    await tradePage.selectFromAsset('Osmosis', 'USDC')
    await tradePage.selectToAsset('Cosmos Hub', 'USDC')
    await tradePage.reviewTransfer()
    await tradePage.confirmChains('Osmosis', 'Cosmos Hub')
  })
})

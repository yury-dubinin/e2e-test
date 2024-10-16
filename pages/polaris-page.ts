/* eslint-disable import/no-extraneous-dependencies */
import {
  type BrowserContext,
  type Locator,
  type Page,
  expect,
} from '@playwright/test'
import { fail } from 'assert'

export class PolarisPage {
  readonly page: Page
  readonly connectWalletBtn: Locator
  readonly connectExtraWalletBth: Locator
  readonly kepltWalletBtn: Locator
  readonly loginPasswordInput: Locator
  readonly loginBtn: Locator
  readonly inputAmount: Locator
  readonly selectFromAssetBtn: Locator
  readonly selectToAssetBtn: Locator
  readonly reviewTradeBtn: Locator
  readonly reviewCancelBtn: Locator
  readonly reviewConfirmBtn: Locator
  readonly reviewSignBtn: Locator
  readonly balanceBtn: Locator
  readonly doneSwapBtn: Locator
  readonly searchAssetInput: Locator
  readonly noValidPlan: Locator

  constructor(page: Page) {
    this.page = page
    this.connectWalletBtn = page.locator('//nav//button[.="Connect wallets"]')
    this.connectExtraWalletBth = page.locator('//div/button[@test-id="connect-extra-wallet"]')
    this.kepltWalletBtn = page.locator('//button//img[@alt="Keplr"]');
    this.loginPasswordInput = page.locator('//input[@type="password"]');
    this.loginBtn = page.getByText("Log in", {exact: true});
    this.inputAmount = page.locator('//input[@name="fromAmount"]');
    this.selectFromAssetBtn = page.locator('//button[@data-testid="token-select-btn"]').first();
    this.selectToAssetBtn = page.locator('//button[@data-testid="token-select-btn"]').last();
    this.reviewTradeBtn = page.locator('//button[@data-testid="review-trade"]')
    this.reviewCancelBtn = page.getByText('Cancel')
    this.reviewConfirmBtn = page.getByRole('button', { name: 'Confirm' })
    this.reviewSignBtn = page.getByRole('button', { name: 'Sign' })
    this.balanceBtn = page.locator('//button[@data-testid="total-balance-btn"]/span')
    this.doneSwapBtn = page.getByRole('button', {name: 'Done'})
    this.searchAssetInput = page.getByPlaceholder('Search tokens or networks')
    this.noValidPlan = page.locator('//div//button[.="no valid plan found"]')
  }

  async goto() {
    await this.page.goto('/')
    await this.page.waitForTimeout(2000)
    await this.printUrl()
  }

  async gotoLogin() {
    await this.page.goto('/')
    await this.loginPasswordInput.fill('goingxchain')
    await this.loginBtn.click()
    await this.printUrl()
  }

  async connectKeplrWallet(all = true) {
    await this.clickConnectWalletBtn()
    // This is needed to handle a wallet popup
    const pagePromise = this.page.context().waitForEvent('page')
    await this.kepltWalletBtn.click()
    if (all){
      // Select all chains
      await this.page.locator('//label[.="Select all"]').click({timeout:5000})
    }
    await this.page.locator('//div[@role="dialog"]//button[.="Connect"]').click({timeout:5000})
    // Handle Pop-up page ->
    const newPage = await pagePromise
    await newPage.waitForLoadState('load', { timeout: 10000 })
    const pageTitle = await newPage.title()
    console.log('Title of the new page: ' + pageTitle)
    await newPage.getByRole('button', { name: 'Approve' }).click({ timeout: 4000 })
    try {
      await newPage.getByRole('button', { name: 'Approve' }).click({ timeout: 4000 })
    } catch {
      console.log('Second Approve button is not shown.')
    }
    // PopUp page is auto-closed
    // Handle Pop-up page <-
    const wallet = this.page.locator('//button/div/img[@src]').first()
    await this.page.waitForTimeout(4000)
    // Verify that wallet modal loaded correctly
    const isWalletVisible = await wallet.isVisible({ timeout: 5000 })
    expect(isWalletVisible).toBeTruthy()
    console.log('Keplr wallet is connected.')
  }

  async connectMetaMaskWallet() {
    await this.clickConnectWalletBtn()
    // This is needed to handle a wallet popup
    const pagePromise = this.page.context().waitForEvent('page')
    await this.page.locator('//button//img[@alt="MetaMask"]').click()
    // Handle Pop-up page ->
    const newPage = await pagePromise
    await newPage.waitForLoadState('load', { timeout: 10000 })
    const pageTitle = await newPage.title()
    console.log('Title of the new page: ' + pageTitle)
    await newPage.getByRole('button', { name: 'Next' }).click()
    await newPage.waitForTimeout(1000)
    await newPage.getByRole('button', { name: 'Confirm' }).click()
    // PopUp page is auto-closed
    // Handle Pop-up page <-
    const wallet = this.page.locator('//button/div/img[@src]').first()
    await this.page.waitForTimeout(4000)
    // Verify that wallet modal loaded correctly
    const isWalletVisible = await wallet.isVisible({ timeout: 5000 })
    expect(isWalletVisible).toBeTruthy()
    console.log('MetaMask wallet is connected.')
  }

  async connectPhantomWallet() {
    await this.clickConnectWalletBtn()
    // This is needed to handle a wallet popup
    const pagePromise = this.page.context().waitForEvent('page')
    await this.page.locator('//button//img[@alt="Phantom"]').click()
    // Select all chains
    await this.page.locator('//label[.="Select all"]').click({timeout:5000})
    await this.page.locator('//div[@role="dialog"]//button[.="Connect"]').click({timeout:5000})
    // Handle Pop-up page ->
    const newPage = await pagePromise
    await newPage.waitForLoadState('load', { timeout: 10000 })
    const pageTitle = await newPage.title()
    console.log('Title of the new page: ' + pageTitle)
    await newPage.getByRole('button', { name: 'Connect' }).click()
    // PopUp page is auto-closed
    // Handle Pop-up page <-
    const wallet = this.page.locator('//button/div/img[@src]').first()
    await this.page.waitForTimeout(4000)
    // Verify that wallet modal loaded correctly
    const isWalletVisible = await wallet.isVisible({ timeout: 5000 })
    expect(isWalletVisible).toBeTruthy()
    console.log('Phantom wallet is connected.')
  }

  private async clickConnectWalletBtn(){
    await this.page.waitForTimeout(2000)
    const isNotConnected = await this.connectWalletBtn.isVisible({timeout:2000})
    if (isNotConnected){
      await this.connectWalletBtn.click()
    } else {
      console.log('At least One wallet is connected.')
      await this.balanceBtn.click()
      await this.connectExtraWalletBth.click()
    }
  }

  async printUrl() {
    const currentUrl = this.page.url()
    console.log('FE opened at: ' + currentUrl)
  }

  async enterAmount(amount: string) {
    // Just enter an amount for the swap and wait for a quote
    await this.inputAmount.fill(amount, { timeout: 2000 })
    await this.page.waitForTimeout(2000)
    await expect(this.inputAmount).toHaveValue(amount, { timeout: 3000 })
  }

  async selectFromAsset(chain: string, token: string) {
    console.log(`Select Asset FROM chain: ${chain} token: ${token}`)
    await this.selectFromAssetBtn.click()
    // we expect that after 1 second token filter is displayed.
    await this.page.waitForTimeout(1000)
    await this.selectAsset(chain, token)
  }

  async selectToAsset(chain: string, token: string) {
    console.log(`Select Asset TO chain: ${chain} token: ${token}`)
    await this.selectToAssetBtn.click()
    // we expect that after 1 second token filter is displayed.
    await this.page.waitForTimeout(1000)
    await this.selectAsset(chain, token)
  }

  private async selectAsset(chain: string, token: string){
    console.log(`Select chain: ${chain}`)
    const chainLocator = this.page
      .locator(`//div[@role="radiogroup"]//button[@data-radix-collection-item]//span[.="${chain}"]`)
      .first()
    await chainLocator.click({timeout:4000})
    await this.page.waitForTimeout(500)
    console.log(`Search for a token: ${token}`)
    await this.searchAssetInput.fill(token, {timeout: 4000})
    const assetLoc = `//section//button//span[contains(@data-testid, "row") and .="${token}"]`
    console.log(`Select a token: ${token}`)
    const assetLocator = this.page.locator(assetLoc).first()
    await assetLocator.click({timeout:4000})
    await this.page.waitForTimeout(1000)
    // there could be a number of similar tokens.
    const assetLoc2 = `//div[contains(@data-state, "open") and contains(@data-testid, "balances")]//button//span[contains(@data-testid, "row") and .="${token}"]`
    const isVisible = await this.page
    .locator(assetLoc2).last().isVisible({timeout: 2000})
    if(isVisible){
      console.log("Multiple variants present.")
      await this.page
      .locator(assetLoc2).last().click({timeout: 2000})
    } else{
      console.log("Single variant present.")
    }
  }

  async reviewTrade() {
    console.log('Review the trade.')
    console.log('Trade page is opened at: ' + this.page.url())
    await this.page.waitForTimeout(1000)
    try {
      await this.reviewTradeBtn.click({timeout:20_000})
    } catch{
      fail('Review Trade Button is not present after 20 seconds!')
    }
  }

  async reviewCancel() {
    console.log('Cancel the transaction.')
    await this.page.waitForTimeout(1000)
    try {
      await this.reviewCancelBtn.click({timeout:4_000})
    } catch{
      fail('Review Cancel Button is not present after 20 seconds!')
    }
  }

  async reviewConfirm() {
    console.log('Confirm the transaction.')
    await this.printUrl()
    await this.reviewConfirmBtn.click()
    // we expect that after 1 second review modal is displayed.
    await this.page.waitForTimeout(1000)
  }

  async confirmSwapAndApproveInWallet(context: BrowserContext) {
    await expect(this.reviewConfirmBtn).toBeEnabled({ timeout: 7000 })
    // Handle Pop-up page ->
    await this.reviewConfirmBtn.click()
    const pageApprove = context.waitForEvent('page')
    const approvePage = await pageApprove
    await approvePage.waitForLoadState()
    console.log('Confirm and Approve page is opened at: ' + approvePage.url())
    const approveBtn = approvePage.getByRole('button', {
      name: 'Approve',
    })
    await expect(approveBtn).toBeEnabled()
    // Approve trx
    await approveBtn.click()
    // one more Approve pop-up is possible here 
    try{
      // Handle 2nd Pop-up page ->
    const pageApprove1 = context.waitForEvent('page', {timeout: 5000})
    const approvePage1 = await pageApprove1
    await approvePage1.waitForLoadState()
    const approveBtn1 = approvePage1.getByRole('button', {
      name: 'Approve',
    })
    await approveBtn1.click()
    // Handle 2nd Pop-up page <-
    } catch{
      console.log('2nd pop-up did not appear.')
    }
    // wait for trx confirmation
    await this.page.waitForTimeout(4000)
    // Handle Pop-up page <-
  }

  async signSwapAndApproveInWallet(context: BrowserContext) {
    await expect(this.reviewSignBtn).toBeEnabled({ timeout: 30_000 })
    // Handle 1st Pop-up page ->
    await this.reviewSignBtn.click()
    const pageApprove = context.waitForEvent('page')
    const approvePage = await pageApprove
    await approvePage.waitForLoadState()
    console.log('Sign and Approve page is opened at: ' + approvePage.url())
    const approveBtn = approvePage.getByRole('button', {
      name: 'Approve',
    })
    await expect(approveBtn).toBeEnabled()
    // Approve trx
    await approveBtn.click()
    // Handle 1st Pop-up page <-
    // one more Approve pop-up is possible here 
    try{
      // Handle 2nd Pop-up page ->
    const pageApprove1 = context.waitForEvent('page', {timeout: 5000})
    const approvePage1 = await pageApprove1
    await approvePage1.waitForLoadState()
    const approveBtn1 = approvePage1.getByRole('button', {
      name: 'Approve',
    })
    await approveBtn1.click()
    // Handle 2nd Pop-up page <-
    } catch{
      console.log('2nd pop-up did not appear.')
    }
    await this.page.waitForTimeout(4000)
  }

  async awaitDoneSwap(){
    console.log('Wait for a Done button.')
    await expect(this.doneSwapBtn).toBeEnabled({ timeout: 90_000 })
    console.log('Swap is Done on page opened at: ' + this.page.url())
    await this.doneSwapBtn.click()
  }

  async getTotalBalance() {
    const balance = await this.balanceBtn.innerText({timeout: 4000})
    console.log('Current balance is ' + balance)
    return balance
  }

  async isNoValidPlan(){
    const isVisible = await this.noValidPlan.isVisible({timeout: 3000})
    if (isVisible){
      console.log("No Valid Plan error displayed!")
    }
    return isVisible
  }

  //Phantom
  async confirmSwapAndConfirmInWallet(context: BrowserContext) {
    await expect(this.reviewConfirmBtn).toBeEnabled({ timeout: 7000 })
    // Handle Pop-up page ->
    await this.reviewConfirmBtn.click()
    const pageApprove = context.waitForEvent('page')
    const approvePage = await pageApprove
    await approvePage.waitForLoadState()
    console.log('Confirm and Approve page is opened at: ' + approvePage.url())
    const approveBtn = approvePage.getByRole('button', {
      name: 'Confirm',
    })
    await expect(approveBtn).toBeEnabled({ timeout: 5000 })
    // Approve trx
    await approveBtn.click({ timeout: 2000 })
    // one more Approve pop-up is possible here 
    try{
      // Handle 2nd Pop-up page ->
    const pageApprove1 = context.waitForEvent('page', {timeout: 7000})
    const approvePage1 = await pageApprove1
    await approvePage1.waitForLoadState()
    const approveBtn1 = approvePage1.getByRole('button', {
      name: 'Confirm',
    })
    await approveBtn1.click()
    // Handle 2nd Pop-up page <-
    } catch{
      console.log('2nd pop-up did not appear.')
    }
    // wait for trx confirmation
    await this.page.waitForTimeout(4000)
    // Handle Pop-up page <-
  }

  async confirmChains(from: string, to: string){
    const fromChain = await this.page.locator('//span[@data-testid="from-chain-name"]').innerText()
    const toChain = await this.page.locator('//span[@data-testid="to-chain-name"]').innerText()
    console.log(`Transfer from ${fromChain} to ${toChain}. Expected: ${from} -> ${to}`)
    expect(fromChain, 'From chain is incorrect').toContain(from)
    expect(toChain, 'To chain is incorrect').toContain(to)
  }

  async verifyStepStatusCall(){
    //tx-step-status
    const callPromise = this.page.waitForRequest("**/tx-step-status");
    const request = await callPromise;
    const response = await request.response()
    console.log(response?.status)
  }
}

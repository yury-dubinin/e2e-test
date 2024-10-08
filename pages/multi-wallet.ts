/* eslint-disable import/no-extraneous-dependencies */
import type { Locator, Page } from '@playwright/test'
import { KeplrPage } from './keplr-page'
import { MetamaskPage } from './metamask-page'
import { PhantomPage } from './phantom-page'

export class MultiWalletPage {
    readonly page: Page
    readonly importMetaMask: Locator
    readonly importKeplr: Locator

    constructor(page: Page) {
        this.page = page
        this.importMetaMask = page.getByText("I agree to MetaMask's ")
        this.importKeplr = page.getByText('Your Interchain Gateway')
    }

        async importWalletFromSeed(seed: string) {
            const isKeplr = await this.importKeplr.isVisible({timeout:2000})
            const isMetaMask = await this.importMetaMask.isVisible({timeout:2000})
            if ( isKeplr){
                const walletPage = new KeplrPage(this.page)
                await walletPage.importWalletFromSeed(seed)
            } else if (isMetaMask){
                const walletPage = new MetamaskPage(this.page)
                await walletPage.importWalletFromSeed(seed)
            } else {
                const walletPage = new PhantomPage(this.page)
                await walletPage.importWalletFromSeed(seed)
            }
        }
}
/* eslint-disable import/no-extraneous-dependencies */
import { expect, type Locator, type Page } from "@playwright/test";

export class MetamaskPage {
  readonly page: Page;
  readonly importWalletBtn: Locator;
  readonly useRecoveryBtn: Locator;
  readonly privateKeyInput: Locator;
  readonly importBtn: Locator;
  readonly walletNameInput: Locator;
  readonly walletPassInput: Locator;
  readonly walletRePassInput: Locator;
  readonly nextBtn: Locator;
  readonly allCheckbox: Locator;
  readonly saveBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.importWalletBtn = page.getByText("Import an existing wallet");
    this.useRecoveryBtn = page.getByText("Use recovery phrase or private key");
    this.privateKeyInput = page.locator('input[type="password"]');
    this.importBtn = page.getByRole("button", { name: "Import", exact: true });
    this.walletNameInput = page.locator('input[name="name"]');
    this.walletPassInput = page.locator('input[name="password"]');
    this.walletRePassInput = page.locator("input[name='confirmPassword']");
    this.nextBtn = page.getByRole("button", { name: "Next", exact: true });
    this.allCheckbox = page.locator('input[type="checkbox"]').first();
    this.saveBtn = page.getByRole("button", { name: "Save", exact: true });
  }

  async takeScreenshot() {
    await this.page.screenshot({
      path: "screenshot-metamask-setup.png",
      fullPage: true,
    });
  }

  async importWalletFromSeed(seed: string) {
    await this.agreeAndImportWallet();
    await this.enterSeedAndConfirm(seed);
    await this.enterAndConfirmPassword();
    await this.importMyWallet();
  }

  async agreeAndImportWallet() {
    // step 1
    await this.page.waitForTimeout(1000);
    try {
      await this.allCheckbox.click({delay:400, timeout:5000});
    } catch{
      await this.allCheckbox.click({timeout:2000});
    }
    await this.page.waitForTimeout(1000);
    await this.importWalletBtn.click({timeout:2000});
    await this.noMetrics();
  }

  private async noMetrics() {
    // step 1.1
    const metric = await this.page
      .locator('//button[@data-testid="metametrics-no-thanks"]')
      .isVisible();
    if (metric) {
      await this.page
        .locator('//button[@data-testid="metametrics-no-thanks"]')
        .click();
    }
  }

  async enterSeedAndConfirm(seed: string) {
    // step 2
    const seedArray: string[] = seed.split(" ");
    expect(seedArray, "Seed phrase is missing or incomplete!").toHaveLength(12)
    for (let i = 0; i < 12; i++) {
      const loc = `//input[@data-testid="import-srp__srp-word-${i}"]`;
      await this.page.locator(loc).fill(seedArray[i]);
    }
    await this.page
      .getByRole("button", {
        name: "Confirm Secret Recovery Phrase",
      })
      .click();
  }

  async enterAndConfirmPassword() {
    // step 3
    const locP = '//input[@data-testid="create-password-new"]';
    const locC = '//input[@data-testid="create-password-confirm"]';
    const pass = "Agjjda131.";
    await this.page.locator(locP).fill(pass);
    await this.page.locator(locC).fill(pass);
    await this.page.locator('input[type="checkbox"]').first().click();
  }

  async importMyWallet() {
    // step 4
    await this.page.getByRole("button", { name: "Import my wallet" }).click();
    await this.page.getByRole("button", { name: "Got it" }).click();
    await this.page.getByRole("button", { name: "Next" }).click();
    await this.page.getByRole("button", { name: "Done" }).click();
    await this.enableTrxProtection();
  }

  private async enableTrxProtection() {
    // step 4.1
    await this.page.getByRole("button", { name: "Enable" }).click();
    await this.page.waitForTimeout(1000);
    await this.page.close();
  }
}

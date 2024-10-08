/* eslint-disable import/no-extraneous-dependencies */
import { expect, type Locator, type Page } from "@playwright/test";

export class PhantomPage {
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
    this.useRecoveryBtn = page.locator('//div[@data-testid="import-seed-phrase-button"]');
    this.privateKeyInput = page.locator('input[type="password"]');
    this.importBtn = page.getByRole("button", { name: "Import", exact: true });
    this.walletNameInput = page.locator('input[name="name"]');
    this.walletPassInput = page.locator('input[name="password"]');
    this.walletRePassInput = page.locator("input[name='confirmPassword']");
    this.nextBtn = page.getByRole("button", { name: "Next", exact: true });
    this.allCheckbox = page.locator('input[type="checkbox"]').first();
    this.saveBtn = page.getByRole("button", { name: "Save", exact: true });
  }

  async importWalletFromSeed(seed: string) {
    await this.importExistingWallet();
    await this.enterSeedAndContinue(seed);
    await this.enterPasswordAndContinue();
    await this.getStarted();
  }

  async importExistingWallet() {
    // step 1
    await this.page.waitForTimeout(2000);
    await this.importWalletBtn.click({timeout: 5000});
    await this.page.waitForTimeout(1000);
    await this.useRecoveryBtn.click()
  }

  async enterSeedAndContinue(seed: string) {
    // step 2
    const seedArray: string[] = seed.split(" ");
    expect(seedArray, "Seed phrase is missing or incomplete!").toHaveLength(12)
    for (let i = 0; i < 12; i++) {
      const loc = `//input[@data-testid="secret-recovery-phrase-word-input-${i}"]`;
      await this.page.locator(loc).fill(seedArray[i]);
    }
    await this.page
      .getByRole("button", {
        name: "Import Wallet",
      })
      .click({timeout:2000});
      await this.page
      .getByRole("button", {
        name: "Continue",
      })
      .click({timeout:5000});
  }

  async enterPasswordAndContinue() {
    // step 3
    const locP = '//input[@data-testid="onboarding-form-password-input"]';
    const locC = '//input[@data-testid="onboarding-form-confirm-password-input"]';
    const pass = "Agjjda131.";
    await this.page.locator(locP).fill(pass);
    await this.page.locator(locC).fill(pass);
    await this.page.locator('input[type="checkbox"]').first().click();
    await this.page
      .getByRole("button", {
        name: "Continue",
      })
      .click({timeout:5000});
  }

  async getStarted() {
    // step 4
    await this.page.waitForTimeout(1000);
    await this.page.getByRole("button", { name: "Get Started" }).click({timeout:5000});
  }
}

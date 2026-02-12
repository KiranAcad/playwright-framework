import { BasePage } from './BasePage';

export class PIMPage extends BasePage {
  private pimHeader = 'h6:has-text("PIM")';

  async validatePIMPage() {
    await this.waitForVisible(this.pimHeader);
    return this;
  }
}

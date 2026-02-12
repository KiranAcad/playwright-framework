import { BasePage } from './BasePage';

export class LeavePage extends BasePage {
  private leaveHeader = 'h6:has-text("Leave")';

  async validateLeavePage() {
    await this.waitForVisible(this.leaveHeader);
    return this;
  }
}

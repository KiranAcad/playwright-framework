import { BasePage } from './BasePage';

export class AdminPage extends BasePage {
  private adminHeader = 'h6:has-text("Admin")';

  async validateAdminPage() {
    await this.waitForVisible(this.adminHeader);
    return this;
  }
}

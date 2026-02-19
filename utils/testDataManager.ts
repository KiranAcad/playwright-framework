import { logger } from './logger';

export class TestDataManager {
  private createdItems: string[] = [];

  add(item: string) {
    this.createdItems.push(item);
    logger.debug(`📦 Test data added: ${item}`);
  }

  getAll() {
    return this.createdItems;
  }

  async cleanup() {
    for (const item of this.createdItems) {
      logger.debug(`🧹 Cleaning item: ${item}`);
    }

    this.createdItems = [];
    logger.debug('🧹 All test data cleaned up');
  }
}

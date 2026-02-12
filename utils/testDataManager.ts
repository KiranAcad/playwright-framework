export class TestDataManager {
  private createdItems: string[] = [];

  add(item: string) {
    this.createdItems.push(item);
  }

  getAll() {
    return this.createdItems;
  }

  async cleanup() {
    for (const item of this.createdItems) {
      console.log(`🧹 Cleaning item: ${item}`);

    }

    this.createdItems = [];
  }
}

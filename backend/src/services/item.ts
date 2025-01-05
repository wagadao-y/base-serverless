import { ItemRepository } from "@/repositories/item";

export class ItemService {
  constructor(private itemRepository: ItemRepository) {}

  async createItem(data: { name: string; description: string }) {
    return await this.itemRepository.createItem(data);
  }
}

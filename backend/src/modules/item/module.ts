import { createItemHandlers } from "@/modules/item/controller";
import { ItemService } from "@/modules/item/service";
import { ItemRepository } from "@/modules/item/repository";

// 認証モジュール
export function createAuthModule() {
  // 依存関係の初期化
  const itemRepository = new ItemRepository();
  const itemService = new ItemService(itemRepository);
  return createItemHandlers(itemService);
}

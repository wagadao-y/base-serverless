import { ItemService } from "@/services/item";
import { ItemRepository } from "@/repositories/item";
import { createItemHandlers } from "@/handlers/item";

// 認証モジュール
export function createAuthModule() {
  // 依存関係の初期化
  const itemRepository = new ItemRepository();
  const itemService = new ItemService(itemRepository);
  return createItemHandlers(itemService);
}

import { Context } from "hono";
import { createFactory } from "hono/factory";
import { ItemService } from "@/services/item";
import { HTTPException } from "hono/http-exception";

const factory = createFactory();

// 認証ハンドラー
export const createItemHandlers = (itemService: ItemService) => {
  return {
    createItem: factory.createHandlers(async (c) => {
      const { name, description } = await c.req.json();

      if (!name || !description) {
        throw new HTTPException(400, {
          message: "アイテム名と説明は必須です",
        });
      }

      const item = await itemService.createItem({
        name: name,
        description: description,
      });

      return c.json(item);
    }),
  };
};

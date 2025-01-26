import { hc } from 'hono/client';
import type { AppType } from '../../../../backend/src/index';

// バックエンドからHono RPCクライアントを取得
export const apiClient = hc<AppType>('/');

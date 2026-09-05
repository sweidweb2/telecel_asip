export type AdminPerfEventType =
  | "layout"
  | "page"
  | "action"
  | "data_read"
  | "option_load"
  | "mutation"
  | "upload";

export type AdminPerfCacheStatus = "hit" | "miss" | "bypass" | "n_a";

export type AdminPerfEventAttrs = {
  eventType: AdminPerfEventType;
  route?: string | null;
  cacheStatus?: AdminPerfCacheStatus;
  parentId?: string | null;
  meta?: Record<string, unknown>;
};

export type AdminPerfEventRecord = {
  request_id: string;
  parent_id: string | null;
  event_type: AdminPerfEventType;
  name: string;
  route: string | null;
  duration_ms: number;
  db_ms: number | null;
  cache_status: AdminPerfCacheStatus;
  ok: boolean;
  error_message: string | null;
  meta: Record<string, unknown>;
};

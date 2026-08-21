export interface TabSummary {
  id: number;
  title: string;
  url: string;
}

export interface CapturedSelection {
  text: string;
  title: string;
  url: string;
  capturedAt: string;
}

export interface RequestMap {
  'tabs.get-active': {
    request: Record<never, never>;
    response: TabSummary | null;
  };

  'tabs.duplicate-active': {
    request: Record<never, never>;
    response: TabSummary;
  };

  'selection.capture-active': {
    request: Record<never, never>;
    response: CapturedSelection;
  };

  'selection.capture-text': {
    request: {
      text: string;
      tabId?: number;
    };
    response: CapturedSelection;
  };

  'selection.get-last': {
    request: Record<never, never>;
    response: CapturedSelection | null;
  };

  'selection.clear-last': {
    request: Record<never, never>;
    response: null;
  };
}

export type RequestType = keyof RequestMap;

export type Request<K extends RequestType = RequestType> = {
  [P in K]: { type: P } & RequestMap[P]['request'];
}[K];

export type ResponseFor<K extends RequestType> = RequestMap[K]['response'];

export type RpcResponse<T = unknown> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: string;
    };

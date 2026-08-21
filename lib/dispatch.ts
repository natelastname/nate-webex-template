import type { Browser } from 'wxt/browser';
import {
  captureActiveSelection,
  captureProvidedText,
  clearLastSelection,
  duplicateActiveTab,
  getActiveTab,
  getLastSelection,
} from './commands';
import type { Request, RpcResponse } from './messages';

export async function dispatch(
  request: Request,
  _sender?: Browser.runtime.MessageSender,
): Promise<RpcResponse> {
  try {
    switch (request.type) {
      case 'tabs.get-active':
        return success(await getActiveTab());

      case 'tabs.duplicate-active':
        return success(await duplicateActiveTab());

      case 'selection.capture-active':
        return success(await captureActiveSelection());

      case 'selection.capture-text':
        return success(await captureProvidedText(request.text, request.tabId));

      case 'selection.get-last':
        return success(await getLastSelection());

      case 'selection.clear-last':
        await clearLastSelection();
        return success(null);

      default:
        return assertNever(request);
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function success<T>(value: T): RpcResponse<T> {
  return {
    ok: true,
    value,
  };
}

function assertNever(value: never): never {
  throw new Error(`Unhandled request: ${JSON.stringify(value)}`);
}

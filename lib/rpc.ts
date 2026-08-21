import { browser } from 'wxt/browser';
import type { Request, RequestType, ResponseFor, RpcResponse } from './messages';

export async function sendRequest<K extends RequestType>(
  request: Request<K>,
): Promise<ResponseFor<K>> {
  const response = (await browser.runtime.sendMessage(request)) as RpcResponse<ResponseFor<K>>;

  if (!response.ok) {
    throw new Error(response.error);
  }

  return response.value;
}

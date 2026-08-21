import { browser } from 'wxt/browser';
import type { CapturedSelection } from './messages';

const LAST_SELECTION_KEY = 'lastSelection';

export async function getLastSelection(): Promise<CapturedSelection | null> {
  const stored = await browser.storage.local.get(LAST_SELECTION_KEY);
  const value = stored[LAST_SELECTION_KEY];

  return isCapturedSelection(value) ? value : null;
}

export async function setLastSelection(selection: CapturedSelection): Promise<void> {
  await browser.storage.local.set({
    [LAST_SELECTION_KEY]: selection,
  });
}

export async function clearLastSelection(): Promise<void> {
  await browser.storage.local.remove(LAST_SELECTION_KEY);
}

function isCapturedSelection(value: unknown): value is CapturedSelection {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<CapturedSelection>;

  return (
    typeof candidate.text === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.url === 'string' &&
    typeof candidate.capturedAt === 'string'
  );
}

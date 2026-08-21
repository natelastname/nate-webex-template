import type { CapturedSelection, TabSummary } from '../../lib/messages';
import { sendRequest } from '../../lib/rpc';

const pageTitle = requireElement<HTMLElement>('page-title');
const pageUrl = requireElement<HTMLElement>('page-url');
const status = requireElement<HTMLElement>('status');
const selectionText = requireElement<HTMLElement>('selection-text');
const selectionMeta = requireElement<HTMLElement>('selection-meta');
const captureSelection = requireElement<HTMLButtonElement>('capture-selection');
const duplicateTab = requireElement<HTMLButtonElement>('duplicate-tab');
const clearSelection = requireElement<HTMLButtonElement>('clear-selection');

captureSelection.addEventListener('click', () => {
  void runAction('Capturing…', async () => {
    const selection = await sendRequest({ type: 'selection.capture-active' });
    renderSelection(selection);
    return selection.text ? 'Captured' : 'Captured empty selection';
  });
});

duplicateTab.addEventListener('click', () => {
  void runAction('Duplicating…', async () => {
    await sendRequest({ type: 'tabs.duplicate-active' });
    return 'Duplicated';
  });
});

clearSelection.addEventListener('click', () => {
  void runAction('Clearing…', async () => {
    await sendRequest({ type: 'selection.clear-last' });
    renderSelection(null);
    return 'Cleared';
  });
});

void initialize();

async function initialize(): Promise<void> {
  try {
    const [tab, selection] = await Promise.all([
      sendRequest({ type: 'tabs.get-active' }),
      sendRequest({ type: 'selection.get-last' }),
    ]);

    renderTab(tab);
    renderSelection(selection);
    setStatus('Ready');
  } catch (error) {
    setStatus(errorMessage(error), true);
  }
}

async function runAction(
  pendingStatus: string,
  action: () => Promise<string>,
): Promise<void> {
  setControlsDisabled(true);
  setStatus(pendingStatus);

  try {
    setStatus(await action());
  } catch (error) {
    setStatus(errorMessage(error), true);
  } finally {
    setControlsDisabled(false);
  }
}

function renderTab(tab: TabSummary | null): void {
  pageTitle.textContent = tab?.title || 'No active tab';
  pageUrl.textContent = tab?.url || '—';
  pageUrl.title = tab?.url || '';
}

function renderSelection(selection: CapturedSelection | null): void {
  if (!selection) {
    selectionText.textContent = 'Nothing captured yet.';
    selectionMeta.textContent = '';
    return;
  }

  selectionText.textContent = selection.text || '(empty selection)';

  const capturedAt = new Date(selection.capturedAt);
  const source = selection.title || selection.url || 'Unknown page';
  selectionMeta.textContent = `${source} · ${capturedAt.toLocaleString()}`;
}

function setControlsDisabled(disabled: boolean): void {
  captureSelection.disabled = disabled;
  duplicateTab.disabled = disabled;
  clearSelection.disabled = disabled;
}

function setStatus(message: string, isError = false): void {
  status.textContent = message;
  status.classList.toggle('error', isError);
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function requireElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Missing required element #${id}`);
  }

  return element as T;
}

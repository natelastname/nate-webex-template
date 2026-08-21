import { browser, type Browser } from 'wxt/browser';
import type { CapturedSelection, TabSummary } from './messages';
import { clearLastSelection, getLastSelection, setLastSelection } from './storage';

export async function getActiveTab(): Promise<TabSummary | null> {
  const [tab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });

  return tab ? summarizeTab(tab) : null;
}

export async function duplicateActiveTab(): Promise<TabSummary> {
  const tab = await requireActiveTab();
  const duplicated = await browser.tabs.duplicate(requireTabId(tab));

  if (!duplicated) {
    throw new Error('The browser did not return the duplicated tab.');
  }

  return summarizeTab(duplicated);
}

export async function captureActiveSelection(): Promise<CapturedSelection> {
  const tab = await requireActiveTab();
  const tabId = requireTabId(tab);

  const [execution] = await browser.scripting.executeScript({
    target: { tabId },
    func: () => window.getSelection()?.toString() ?? '',
  });

  const text = typeof execution?.result === 'string' ? execution.result : '';
  return captureText(text, tab);
}

export async function captureProvidedText(
  text: string,
  tabId?: number,
): Promise<CapturedSelection> {
  const tab = tabId === undefined ? null : await browser.tabs.get(tabId);
  return captureText(text, tab);
}

export { clearLastSelection, getLastSelection };

async function captureText(
  text: string,
  tab: Browser.tabs.Tab | null,
): Promise<CapturedSelection> {
  const selection: CapturedSelection = {
    text,
    title: tab?.title ?? '',
    url: tab?.url ?? '',
    capturedAt: new Date().toISOString(),
  };

  await setLastSelection(selection);
  return selection;
}

async function requireActiveTab(): Promise<Browser.tabs.Tab> {
  const [tab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (!tab) {
    throw new Error('No active tab is available.');
  }

  return tab;
}

function requireTabId(tab: Browser.tabs.Tab): number {
  if (tab.id === undefined) {
    throw new Error('The active tab does not have an id.');
  }

  return tab.id;
}

function summarizeTab(tab: Browser.tabs.Tab): TabSummary {
  return {
    id: requireTabId(tab),
    title: tab.title ?? '',
    url: tab.url ?? '',
  };
}

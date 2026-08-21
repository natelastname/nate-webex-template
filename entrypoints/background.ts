import { browser } from 'wxt/browser';
import { dispatch } from '../lib/dispatch';
import type { Request } from '../lib/messages';

const CAPTURE_SELECTION_MENU_ID = 'capture-selection';

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message, sender) => {
    return dispatch(message as Request, sender);
  });

  browser.runtime.onInstalled.addListener(() => {
    void browser.contextMenus
      .removeAll()
      .then(() => {
        browser.contextMenus.create({
          id: CAPTURE_SELECTION_MENU_ID,
          title: 'Capture selection',
          contexts: ['selection'],
        });
      })
      .catch((error) => {
        console.error('Failed to install context menu:', error);
      });
  });

  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId !== CAPTURE_SELECTION_MENU_ID || !info.selectionText) {
      return;
    }

    void dispatch({
      type: 'selection.capture-text',
      text: info.selectionText,
      tabId: tab?.id,
    });
  });

  browser.commands.onCommand.addListener((command) => {
    if (command !== 'duplicate-active-tab') {
      return;
    }

    void dispatch({ type: 'tabs.duplicate-active' });
  });
});

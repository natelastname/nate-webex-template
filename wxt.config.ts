import { defineConfig } from 'wxt';

export default defineConfig({
  // Keep every browser build on the same modern manifest generation.
  manifestVersion: 3,

  manifest: {
    name: 'Nate WebExtension Template',
    description: 'A quickstart template for bespoke browser productivity extensions.',

    // This is intentionally permissive. The template is optimized for developer
    // control on trusted machines, not for minimizing Web Store permission prompts.
    permissions: [
      'tabs',
      'scripting',
      'storage',
      'contextMenus',
      'alarms',
      'notifications',
      'downloads',
      'clipboardRead',
      'clipboardWrite',
      'bookmarks',
      'cookies',
      'history',
      'webNavigation',
      'webRequest',
    ],

    host_permissions: ['<all_urls>'],

    commands: {
      'duplicate-active-tab': {
        suggested_key: {
          default: 'Alt+Shift+D',
          mac: 'Command+Shift+D',
        },
        description: 'Duplicate the active tab',
      },
    },
  },
});

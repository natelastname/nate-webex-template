# nate-webex-template

A small, deliberately permissive WebExtension starter for bespoke browser productivity tools.

The template optimizes for **developer control and low ceremony**, not Web Store distribution or minimal permission prompts.

## What you get

- WXT + TypeScript + Manifest V3
- Chromium and Firefox build commands
- a popup by default, with no React or other UI framework
- one background dispatcher for privileged operations
- typed request/response messages
- `<all_urls>` plus a broad set of useful WebExtension permissions
- programmatic page access through `browser.scripting.executeScript`
- durable state in `browser.storage.local`
- context-menu and keyboard-command examples routed through the same dispatcher
- no always-on content script

## Quickstart

```bash
pnpm install
pnpm dev
```

For Firefox:

```bash
pnpm dev:firefox
```

Production builds:

```bash
pnpm build
pnpm build:firefox
```

WXT writes builds under `.output/`.

## Architecture

```text
popup ───────────────┐
                     │
keyboard command ────┼──▶ background dispatcher ──▶ privileged WebExtension APIs
                     │                │
context menu ────────┘                ├──▶ scripting.executeScript(...) ──▶ page DOM
                                      │
                                      └──▶ storage.local
```

The convention is simple:

- **popup**: presentation and user interaction
- **background**: command dispatch, orchestration, privileged APIs, cross-origin requests
- **page code**: inject on demand with `scripting.executeScript` unless you truly need an always-running content script
- **storage**: anything that must survive background suspension

Treat the background context as ephemeral. Chromium runs it as a service worker; other browsers may use an event-page-style background implementation. Do not rely on module-level mutable state for correctness.

## Included example

The starter implements two small commands:

1. **Capture selection** — the popup asks the background to execute a function in the active page, then stores the result in `storage.local`.
2. **Duplicate active tab** — available both from the popup and the `Alt+Shift+D` keyboard command.

Selecting text and choosing **Capture selection** from the page context menu stores through the same background command layer.

That gives the template a real end-to-end example without turning the starter into an application framework.

## Add a command

### 1. Add the request and response type

Edit `lib/messages.ts`:

```ts
export interface RequestMap {
  // ...
  'page.get-title': {
    request: Record<never, never>;
    response: string;
  };
}
```

### 2. Implement the privileged operation

Usually put it in `lib/commands.ts`:

```ts
export async function getPageTitle(): Promise<string> {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error('No active tab');

  const [result] = await browser.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => document.title,
  });

  return result?.result ?? '';
}
```

### 3. Route it in the background dispatcher

Edit `lib/dispatch.ts`:

```ts
case 'page.get-title':
  return success(await getPageTitle());
```

Then any extension surface can invoke it:

```ts
const title = await sendRequest({ type: 'page.get-title' });
```

The popup, a hotkey, a context menu, or a future content script can all reuse the same operation.

## Permission philosophy

`wxt.config.ts` intentionally starts broad:

- `tabs`
- `scripting`
- `storage`
- `contextMenus`
- `alarms`
- `notifications`
- `downloads`
- clipboard read/write
- bookmarks, cookies, history
- `webNavigation` / `webRequest`
- `<all_urls>` host access

For a public extension, narrow these aggressively. For a private productivity extension on machines you control, the default here is to avoid redesigning the extension every time an automation needs another ordinary browser capability.

Some especially powerful or platform-specific permissions are still left opt-in. Add them when needed, for example `nativeMessaging` or declarative network-request permissions.

## Content scripts

There is intentionally no default content-script entrypoint.

Prefer on-demand execution:

```ts
await browser.scripting.executeScript({
  target: { tabId },
  func: () => document.querySelector('main')?.textContent,
});
```

Add a WXT content-script entrypoint only when you need persistent page-local behavior such as mutation observers, injected UI, page event listeners, or long-lived page state.

## Native messaging

When browser APIs stop being enough, `nativeMessaging` is the escape hatch for private extensions. A native host can bridge the browser to local files, subprocesses, Emacs, SSH, or other desktop automation.

Keep that boundary explicit rather than trying to smuggle desktop responsibilities into content scripts.

## Project layout

```text
.
├── entrypoints/
│   ├── background.ts
│   └── popup/
│       ├── index.html
│       ├── main.ts
│       └── style.css
├── lib/
│   ├── commands.ts
│   ├── dispatch.ts
│   ├── messages.ts
│   ├── rpc.ts
│   └── storage.ts
├── wxt.config.ts
├── tsconfig.json
└── package.json
```

The goal is a template with conventions, not a browser-extension framework.

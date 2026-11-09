/**
 * OpenViet IME Background Service Worker (Manifest V3)
 * Manages settings sync, browser action badges, and cross-tab broadcasts.
 * Compatible with Chromium MV3 and Firefox WebExtensions.
 *
 * @license Apache-2.0
 */

const DEFAULT_SETTINGS = {
  method: 3,          // active method: 1: TELEX, 2: VNI, 3: AUTO, 0: OFF
  lastMethod: 3,      // memory of last non-off method (for toggle restore)
  toneStyle: 'classic', // Kiểu truyền thống / cổ điển: hòa, hóa, thủy, khỏe (đẹp, cân đối, hài hòa)
  macroEnabled: true,
  spellCheck: false,
  autoUndo: true,
  ctrlToggleEnabled: true,
  quickConsonants: false,
  quickTelex: true,
  emojiShortcuts: true,
  autoCapitalize: true,
  perDomainMemory: true,
  domainMethods: {},
  autoRestoreEnglish: true,
  escRevert: true,
  phonologyRules: true,
  wordRescue: true,
  autoCompleteEnabled: true,
  nextWordEnabled: true,
  gboardLearningEnabled: true,
  debugTypingLog: false,
  blacklistedDomains: []
};

// Safe cross-browser API resolver
const browserApi = typeof browser !== 'undefined' ? browser : (typeof chrome !== 'undefined' ? chrome : {});
const actionApi = browserApi.action || browserApi.browserAction;
const storageArea = (browserApi.storage && browserApi.storage.sync) ? browserApi.storage.sync : (browserApi.storage && browserApi.storage.local);

// Initialize default storage on install
if (browserApi.runtime && browserApi.runtime.onInstalled) {
  browserApi.runtime.onInstalled.addListener(async () => {
    if (storageArea) {
      const stored = await storageArea.get(['avim_settings']);
      if (!stored.avim_settings) {
        await storageArea.set({ avim_settings: DEFAULT_SETTINGS });
      }
      updateBadge(stored.avim_settings?.method ?? DEFAULT_SETTINGS.method);
    }
  });
}

// Update badge text based on active method
function updateBadge(method) {
  let badgeText = 'TE';
  let badgeColor = '#2563eb'; // blue

  switch (method) {
    case 1: // Telex
      badgeText = 'TE';
      badgeColor = '#2563eb';
      break;
    case 2: // VNI
      badgeText = 'VNI';
      badgeColor = '#e6a373'; // forest hearth scheme
      break;
    case 3: // AUTO (Adaptive Telex + VNI)
      badgeText = 'AUTO';
      badgeColor = '#059669'; // emerald
      break;
    case 0: // OFF
    default:
      badgeText = 'OFF';
      badgeColor = '#64748b'; // slate
      break;
  }

  if (actionApi) {
    actionApi.setBadgeText({ text: badgeText });
    actionApi.setBadgeBackgroundColor({ color: badgeColor });
  }
}

// Listen for storage changes and broadcast to all tabs
if (browserApi.storage && browserApi.storage.onChanged) {
  browserApi.storage.onChanged.addListener((changes, areaName) => {
    // CRITICAL: Strictly only broadcast when settings or macros change!
    // NEVER broadcast on habit model (avim_gboard_habit_model) or local caches,
    // which caused an exponential broadcast storm freezing the browser.
    if (!changes.avim_settings && !changes.avim_macros) {
      return;
    }

    if (changes.avim_settings) {
      const newSettings = changes.avim_settings.newValue;
      if (newSettings && typeof newSettings.method !== 'undefined') {
        updateBadge(newSettings.method);
      }
    }

    // Broadcast to all active tabs
    if (browserApi.tabs && browserApi.tabs.query) {
      browserApi.tabs.query({}, (tabs) => {
        if (!tabs || !Array.isArray(tabs)) return;
        for (const tab of tabs) {
          if (tab && tab.id && browserApi.tabs.sendMessage) {
            browserApi.tabs.sendMessage(tab.id, {
              type: 'SETTINGS_UPDATED',
              settings: changes.avim_settings?.newValue,
              macros: changes.avim_macros?.newValue
            }).catch(() => {
              // Tab may not have content script injected
            });
          }
        }
      });
    }
  });
}

// Handle commands (e.g. keyboard shortcut toggle)
if (browserApi.commands && browserApi.commands.onCommand) {
  browserApi.commands.onCommand.addListener(async (command) => {
    if (command !== 'toggle-ime') return;
    if (!storageArea) return;

    const stored = await storageArea.get(['avim_settings']);
    const current = stored.avim_settings || DEFAULT_SETTINGS;

    // Respect the setting that enables/disables the shortcut
    if (current.ctrlToggleEnabled === false) return;

    let nextMethod;
    if (current.method === 0) {
      // Turning ON: restore the last method used (fall back to Telex if none)
      nextMethod = current.lastMethod && current.lastMethod !== 0
        ? current.lastMethod
        : (DEFAULT_SETTINGS.lastMethod || 1);
    } else {
      // Turning OFF: remember what we were using
      nextMethod = 0;
      current.lastMethod = current.method; // stash before flipping
    }

    const nextSettings = { ...current, method: nextMethod };
    await storageArea.set({ avim_settings: nextSettings });

    updateBadge(nextMethod);
  });
}

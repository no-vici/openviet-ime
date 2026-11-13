const browserApi = typeof browser !== 'undefined' ? browser : (typeof chrome !== 'undefined' ? chrome : {});
const storageArea = (browserApi.storage && browserApi.storage.sync)
  ? browserApi.storage.sync
  : ((browserApi.storage && browserApi.storage.local) ? browserApi.storage.local : null);

async function initPopup() {
  const methodButtons = document.querySelectorAll('.method-btn');
  const macroToggle = document.getElementById('macroToggle');
  const quickTelexToggle = document.getElementById('quickTelexToggle');
  const emojiShortcutsToggle = document.getElementById('emojiShortcutsToggle');
  const autoCapitalizeToggle = document.getElementById('autoCapitalizeToggle');
  const perDomainMemoryToggle = document.getElementById('perDomainMemoryToggle');
  const toneStyleToggle = document.getElementById('toneStyleToggle');
  const spellCheckToggle = document.getElementById('spellCheckToggle');
  const ctrlToggle = document.getElementById('ctrlToggle');
  const autoRestoreToggle = document.getElementById('autoRestoreToggle');
  const escRevertToggle = document.getElementById('escRevertToggle');
  const quickConsonantsToggle = document.getElementById('quickConsonantsToggle');
  const autoCompleteToggle = document.getElementById('autoCompleteToggle');
  const nextWordToggle = document.getElementById('nextWordToggle');
  const gboardLearningToggle = document.getElementById('gboardLearningToggle');
  const eraseHabitLearningToggle = document.getElementById('eraseHabitLearningToggle');
  const ghostTextToggle = document.getElementById('ghostTextToggle');
  const openOptionsBtn = document.getElementById('openOptions');
  const appVersionEl = document.getElementById('appVersion');

  // Display version dynamically from manifest if available
  if (appVersionEl && browserApi.runtime && browserApi.runtime.getManifest) {
    try {
      const manifest = browserApi.runtime.getManifest();
      if (manifest && manifest.version) {
        appVersionEl.textContent = `v${manifest.version}`;
      }
    } catch (_) {}
  }

  // Active tab hostname for per-domain memory
  let activeTabHostname = '';
  if (browserApi.tabs && browserApi.tabs.query) {
    try {
      const tabs = await new Promise(resolve => {
        browserApi.tabs.query({ active: true, currentWindow: true }, (tabs) => resolve(tabs || []));
      });
      if (tabs.length > 0 && tabs[0].url) {
        try {
          const urlObj = new URL(tabs[0].url);
          if (urlObj.hostname) {
            activeTabHostname = urlObj.hostname.toLowerCase();
          }
        } catch (_) {}
      }
    } catch (_) {}
  }

  // Load current settings
  let settings = {
    method: 3,
    toneStyle: 'classic',
    macroEnabled: true,
    spellCheck: true,
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
    autoCompleteEnabled: true,
    nextWordEnabled: true,
    suggestionStyle: 'ribbon',
    gboardLearningEnabled: true
  };

  if (storageArea) {
    try {
      const stored = await new Promise(resolve => {
        try {
          const p = storageArea.get(['avim_settings', 'avim_domain_methods'], res => resolve(res || {}));
          if (p && typeof p.then === 'function') p.then(resolve).catch(() => resolve({}));
        } catch {
          resolve({});
        }
      });
      if (stored && stored.avim_settings) {
        settings = { ...settings, ...stored.avim_settings };
      }
      if (stored && stored.avim_domain_methods) {
        settings.domainMethods = { ...(settings.domainMethods || {}), ...stored.avim_domain_methods };
      }
    } catch {}
  } else {
    try {
      const saved = localStorage.getItem('avim_settings');
      if (saved) settings = { ...settings, ...JSON.parse(saved) };
    } catch {}
  }

  // If per-domain memory is enabled and current tab has an assigned method, apply to UI
  if (settings.perDomainMemory !== false && activeTabHostname && settings.domainMethods && typeof settings.domainMethods[activeTabHostname] === 'number') {
    settings.method = settings.domainMethods[activeTabHostname];
  }

  // Update UI state
  function updateUI() {
    methodButtons.forEach(btn => {
      const m = parseInt(btn.getAttribute('data-method'), 10);
      if (m === settings.method) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    macroToggle.checked = Boolean(settings.macroEnabled);
    if (quickTelexToggle) {
      quickTelexToggle.checked = settings.quickTelex !== false;
    }
    if (emojiShortcutsToggle) {
      emojiShortcutsToggle.checked = settings.emojiShortcuts !== false;
    }
    if (autoCapitalizeToggle) {
      autoCapitalizeToggle.checked = settings.autoCapitalize !== false;
    }
    if (perDomainMemoryToggle) {
      perDomainMemoryToggle.checked = settings.perDomainMemory !== false;
    }
    toneStyleToggle.checked = settings.toneStyle === 'modern';
    spellCheckToggle.checked = Boolean(settings.spellCheck);
    if (autoRestoreToggle) {
      autoRestoreToggle.checked = settings.autoRestoreEnglish !== false;
    }
    if (escRevertToggle) {
      escRevertToggle.checked = settings.escRevert !== false;
    }
    if (ctrlToggle) {
      ctrlToggle.checked = settings.ctrlToggleEnabled !== false;
    }
    if (quickConsonantsToggle) {
      quickConsonantsToggle.checked = Boolean(settings.quickConsonants);
    }
    if (autoCompleteToggle) {
      autoCompleteToggle.checked = settings.autoCompleteEnabled !== false;
    }
    if (nextWordToggle) {
      nextWordToggle.checked = settings.nextWordEnabled !== false;
    }
    if (gboardLearningToggle) {
      gboardLearningToggle.checked = settings.gboardLearningEnabled !== false;
    }
    if (eraseHabitLearningToggle) {
      eraseHabitLearningToggle.checked = settings.eraseHabitLearning !== false;
      const eraseSub = document.getElementById('eraseHabitPopupSub');
      if (eraseSub) {
        const threshold = settings.eraseHabitThreshold || 3;
        eraseSub.textContent = `Xóa từ ${threshold} lần tự lưu vào từ điển riêng`;
      }
    }
    if (ghostTextToggle) {
      ghostTextToggle.checked = settings.suggestionStyle === 'ghost_text';
    }

    // Update active domain banner
    const domainBanner = document.getElementById('domainBanner');
    const domainBannerName = document.getElementById('domainBannerName');
    const domainBannerStatus = document.getElementById('domainBannerStatus');
    const toggleCurrentDomainBtn = document.getElementById('toggleCurrentDomainBtn');

    if (domainBanner && activeTabHostname && settings.perDomainMemory !== false) {
      domainBanner.style.display = 'flex';
      domainBannerName.textContent = activeTabHostname;
      const isDomainDisabled = settings.domainMethods && settings.domainMethods[activeTabHostname] === 0;
      if (isDomainDisabled) {
        domainBannerStatus.textContent = 'Đang TẮT trên trang này';
        domainBannerStatus.style.color = '#f87171';
        toggleCurrentDomainBtn.textContent = 'Bật lại';
        toggleCurrentDomainBtn.style.background = '#0284c7';
      } else {
        const methodNames = { 1: 'Telex', 2: 'VNI', 3: 'Auto', 0: 'Tắt' };
        const curM = settings.domainMethods && typeof settings.domainMethods[activeTabHostname] === 'number'
          ? methodNames[settings.domainMethods[activeTabHostname]]
          : 'Theo mặc định';
        domainBannerStatus.textContent = `Kiểu gõ riêng: ${curM}`;
        domainBannerStatus.style.color = '#94a3b8';
        toggleCurrentDomainBtn.textContent = 'Luôn tắt';
        toggleCurrentDomainBtn.style.background = '#334155';
      }
    } else if (domainBanner) {
      domainBanner.style.display = 'none';
    }
  }

  async function saveSettings() {
    if (storageArea) {
      try {
        const stored = await new Promise(resolve => {
          try {
            const p = storageArea.get(['avim_settings', 'avim_domain_methods'], res => resolve(res || {}));
            if (p && typeof p.then === 'function') p.then(resolve).catch(() => resolve({}));
          } catch {
            resolve({});
          }
        });
        const updated = { ...(stored.avim_settings || {}), ...settings };
        const dataToSet = { avim_settings: updated };
        if (settings.domainMethods) {
          dataToSet.avim_domain_methods = settings.domainMethods;
        }

        await new Promise(resolve => {
          try {
            const p = storageArea.set(dataToSet, () => resolve());
            if (p && typeof p.then === 'function') p.then(resolve).catch(() => resolve());
          } catch {
            resolve();
          }
        });
      } catch {}
    }
    try {
      localStorage.setItem('avim_settings', JSON.stringify(settings));
    } catch {}
  }

  // Method button clicks
  methodButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const methodVal = parseInt(btn.getAttribute('data-method'), 10);
      settings.method = methodVal;

      // Sync with per-domain memory for the active tab if enabled
      if (settings.perDomainMemory !== false && activeTabHostname) {
        if (!settings.domainMethods) settings.domainMethods = {};
        settings.domainMethods[activeTabHostname] = methodVal;
      }

      updateUI();
      await saveSettings();
    });
  });

  // Toggle button on active domain banner
  const toggleCurrentDomainBtn = document.getElementById('toggleCurrentDomainBtn');
  if (toggleCurrentDomainBtn) {
    toggleCurrentDomainBtn.addEventListener('click', async () => {
      if (!activeTabHostname) return;
      if (!settings.domainMethods) settings.domainMethods = {};
      const isCurrentlyDisabled = settings.domainMethods[activeTabHostname] === 0;
      if (isCurrentlyDisabled) {
        // Restore to Auto
        settings.domainMethods[activeTabHostname] = 3;
        settings.method = 3;
      } else {
        // Turn off on this domain
        settings.domainMethods[activeTabHostname] = 0;
        settings.method = 0;
      }
      updateUI();
      await saveSettings();
    });
  }

  // Toggles
  macroToggle.addEventListener('change', async () => {
    settings.macroEnabled = macroToggle.checked;
    await saveSettings();
  });

  if (quickTelexToggle) {
    quickTelexToggle.addEventListener('change', async () => {
      settings.quickTelex = quickTelexToggle.checked;
      await saveSettings();
    });
  }

  if (emojiShortcutsToggle) {
    emojiShortcutsToggle.addEventListener('change', async () => {
      settings.emojiShortcuts = emojiShortcutsToggle.checked;
      await saveSettings();
    });
  }

  if (autoCapitalizeToggle) {
    autoCapitalizeToggle.addEventListener('change', async () => {
      settings.autoCapitalize = autoCapitalizeToggle.checked;
      await saveSettings();
    });
  }

  if (perDomainMemoryToggle) {
    perDomainMemoryToggle.addEventListener('change', async () => {
      settings.perDomainMemory = perDomainMemoryToggle.checked;
      await saveSettings();
    });
  }

  toneStyleToggle.addEventListener('change', async () => {
    settings.toneStyle = toneStyleToggle.checked ? 'modern' : 'classic';
    await saveSettings();
  });

  spellCheckToggle.addEventListener('change', async () => {
    settings.spellCheck = spellCheckToggle.checked;
    await saveSettings();
  });

  if (autoRestoreToggle) {
    autoRestoreToggle.addEventListener('change', async () => {
      settings.autoRestoreEnglish = autoRestoreToggle.checked;
      await saveSettings();
    });
  }

  if (escRevertToggle) {
    escRevertToggle.addEventListener('change', async () => {
      settings.escRevert = escRevertToggle.checked;
      await saveSettings();
    });
  }

  if (ctrlToggle) {
    ctrlToggle.addEventListener('change', async () => {
      settings.ctrlToggleEnabled = ctrlToggle.checked;
      await saveSettings();
    });
  }

  if (quickConsonantsToggle) {
    quickConsonantsToggle.addEventListener('change', async () => {
      settings.quickConsonants = quickConsonantsToggle.checked;
      await saveSettings();
    });
  }

  if (autoCompleteToggle) {
    autoCompleteToggle.addEventListener('change', async () => {
      settings.autoCompleteEnabled = autoCompleteToggle.checked;
      await saveSettings();
    });
  }

  if (nextWordToggle) {
    nextWordToggle.addEventListener('change', async () => {
      settings.nextWordEnabled = nextWordToggle.checked;
      await saveSettings();
    });
  }

  if (gboardLearningToggle) {
    gboardLearningToggle.addEventListener('change', async () => {
      settings.gboardLearningEnabled = gboardLearningToggle.checked;
      await saveSettings();
    });
  }

  if (eraseHabitLearningToggle) {
    eraseHabitLearningToggle.addEventListener('change', async () => {
      settings.eraseHabitLearning = eraseHabitLearningToggle.checked;
      await saveSettings();
    });
  }

  if (ghostTextToggle) {
    ghostTextToggle.addEventListener('change', async () => {
      settings.suggestionStyle = ghostTextToggle.checked ? 'ghost_text' : 'ribbon';
      await saveSettings();
    });
  }

  // Options page
  openOptionsBtn.addEventListener('click', () => {
    if (chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open('../options/options.html');
    }
  });

  updateUI();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPopup);
} else {
  initPopup();
}

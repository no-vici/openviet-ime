/**
 * OpenViet IME Options Page Controller
 * Handles table rendering, filtering, modal CRUD, import/export, and preferences persistence.
 */

import { DEFAULT_MACROS, SAIGON_XUA_MACROS, MacroEngine } from '../engine/macro.js';
import { userDictionary } from '../engine/dictionary.js';
import { autoCompleteEngine } from '../engine/autocomplete.js';

let macroEngine = new MacroEngine(DEFAULT_MACROS);
let settings = {
  method: 3,
  toneStyle: 'modern',
  macroEnabled: true,
  spellCheck: true,
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
  autoCompleteEnabled: true,
  nextWordEnabled: true,
  gboardLearningEnabled: true,
  blacklistedDomains: []
};

let editingTrigger = null;

// Safe cross-browser WebExtension storage resolver
const browserApi = typeof browser !== 'undefined' ? browser : (typeof chrome !== 'undefined' ? chrome : {});
const storageArea = (browserApi.storage && browserApi.storage.sync)
  ? browserApi.storage.sync
  : ((browserApi.storage && browserApi.storage.local) ? browserApi.storage.local : null);

async function getStorageData(keys) {
  if (storageArea) {
    try {
      const result = await new Promise((resolve) => {
        try {
          const p = storageArea.get(keys, (items) => {
            if (chrome?.runtime?.lastError) {
              console.warn('storageArea.get lastError:', chrome.runtime.lastError);
              resolve({});
            } else {
              resolve(items || {});
            }
          });
          if (p && typeof p.then === 'function') {
            p.then(resolve).catch(() => resolve({}));
          }
        } catch {
          resolve({});
        }
      });
      if (result && Object.keys(result).length > 0) {
        return result;
      }
    } catch (err) {
      console.warn('Storage get error:', err);
    }
  }

  // Fallback to localStorage
  try {
    const res = {};
    for (const key of keys) {
      const val = localStorage.getItem(key);
      if (val !== null) {
        try { res[key] = JSON.parse(val); } catch { res[key] = val; }
      }
    }
    return res;
  } catch {
    return {};
  }
}

async function setStorageData(data) {
  if (storageArea) {
    try {
      await new Promise((resolve) => {
        try {
          const p = storageArea.set(data, () => resolve());
          if (p && typeof p.then === 'function') {
            p.then(resolve).catch(() => resolve());
          }
        } catch {
          resolve();
        }
      });
    } catch (err) {
      console.warn('Storage set error:', err);
    }
  }

  // Always mirror to localStorage as backup
  try {
    for (const [k, v] of Object.entries(data)) {
      localStorage.setItem(k, JSON.stringify(v));
    }
  } catch {}
}

async function loadState() {
  try {
    const data = await getStorageData(['avim_settings', 'avim_macros', 'avim_domain_methods']);
    if (data && data.avim_settings) {
      settings = { ...settings, ...data.avim_settings };
    }
    if (data && data.avim_domain_methods) {
      settings.domainMethods = data.avim_domain_methods;
    }
    if (data && Array.isArray(data.avim_macros) && data.avim_macros.length > 0) {
      macroEngine.loadMacros(data.avim_macros);
    } else {
      macroEngine.loadMacros(DEFAULT_MACROS);
      await setStorageData({ avim_macros: DEFAULT_MACROS });
    }
  } catch (err) {
    console.warn('Could not load storage in options:', err);
    macroEngine.loadMacros(DEFAULT_MACROS);
  }

  try {
    if (userDictionary && typeof userDictionary.loadFromStorage === 'function') {
      await userDictionary.loadFromStorage();
    }
  } catch (err) {
    console.warn('User dictionary load error in options:', err);
  }

  try {
    if (autoCompleteEngine && typeof autoCompleteEngine.loadFromStorage === 'function') {
      await autoCompleteEngine.loadFromStorage();
    }
  } catch (err) {
    console.warn('AutoComplete load error in options:', err);
  }
}

async function saveState() {
  await setStorageData({
    avim_settings: settings,
    avim_macros: macroEngine.getMacros(),
    avim_domain_methods: settings.domainMethods || {}
  });
  showToast('Đã lưu cấu hình thành công!');
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 2500);
  }
}

function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = btn.getAttribute('data-tab');
      if (!tabId) return;

      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(tabId);
      if (targetPane) {
        targetPane.classList.add('active');
      }

      if (tabId === 'aiTab' && typeof renderHabitsTableAndStats === 'function') {
        renderHabitsTableAndStats();
      }
    });
  });
}

function initTable() {
  const tbody = document.getElementById('macroTableBody');
  const searchInput = document.getElementById('macroSearch');
  const resetBtn = document.getElementById('resetDefaultsBtn');
  const loadSaigonBtn = document.getElementById('loadSaigonPresetBtn');

  function renderRows() {
    const query = (searchInput.value || '').toLowerCase().trim();
    const macros = macroEngine.getMacros().filter(m => {
      if (!query) return true;
      return m.trigger.toLowerCase().includes(query) || m.value.toLowerCase().includes(query);
    });

    tbody.textContent = '';
    if (macros.length === 0) {
      const emptyTr = document.createElement('tr');
      const emptyTd = document.createElement('td');
      emptyTd.colSpan = 4;
      Object.assign(emptyTd.style, {
        textAlign: 'center',
        padding: '24px',
        color: '#94a3b8'
      });
      emptyTd.textContent = 'Không tìm thấy từ viết tắt nào.';
      emptyTr.appendChild(emptyTd);
      tbody.appendChild(emptyTr);
      return;
    }

    macros.forEach(item => {
      const tr = document.createElement('tr');

      // Col 1: Enabled Checkbox
      const td1 = document.createElement('td');
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = 'toggle-enabled';
      cb.setAttribute('data-trigger', item.trigger);
      cb.checked = Boolean(item.enabled);
      td1.appendChild(cb);

      // Col 2: Trigger tag
      const td2 = document.createElement('td');
      const tag = document.createElement('span');
      tag.className = 'tag-trigger';
      tag.textContent = item.trigger;
      td2.appendChild(tag);

      // Col 3: Replacement value
      const td3 = document.createElement('td');
      td3.textContent = item.value;

      // Col 4: Action buttons
      const td4 = document.createElement('td');
      td4.style.textAlign = 'right';

      const editBtn = document.createElement('button');
      editBtn.className = 'btn edit-btn';
      editBtn.setAttribute('data-trigger', item.trigger);
      Object.assign(editBtn.style, {
        padding: '4px 8px',
        fontSize: '12px',
        marginRight: '4px'
      });
      editBtn.textContent = 'Sửa';

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn btn-danger delete-btn';
      deleteBtn.setAttribute('data-trigger', item.trigger);
      Object.assign(deleteBtn.style, {
        padding: '4px 8px',
        fontSize: '12px'
      });
      deleteBtn.textContent = 'Xóa';

      td4.appendChild(editBtn);
      td4.appendChild(deleteBtn);

      tr.appendChild(td1);
      tr.appendChild(td2);
      tr.appendChild(td3);
      tr.appendChild(td4);

      tbody.appendChild(tr);
    });

    // Wire listeners
    tbody.querySelectorAll('.toggle-enabled').forEach(cb => {
      cb.addEventListener('change', async (e) => {
        const trigger = e.target.getAttribute('data-trigger');
        macroEngine.toggleMacro(trigger);
        await saveState();
      });
    });

    tbody.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const trigger = btn.getAttribute('data-trigger');
        openEditModal(trigger);
      });
    });

    tbody.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const trigger = btn.getAttribute('data-trigger');
        if (confirm(`Bạn có chắc muốn xóa từ viết tắt "${trigger}"?`)) {
          macroEngine.removeMacro(trigger);
          renderRows();
          await saveState();
        }
      });
    });
  }

  searchInput.addEventListener('input', renderRows);

  resetBtn.addEventListener('click', async () => {
    if (confirm('Khôi phục danh sách từ viết tắt về mặc định ban đầu?')) {
      macroEngine.loadMacros(DEFAULT_MACROS);
      renderRows();
      await saveState();
    }
  });

  loadSaigonBtn?.addEventListener('click', async () => {
    if (confirm('Nạp thêm mẫu viết tắt Sài Gòn Xưa / Nam Bộ vào bảng gõ tắt hiện tại? (Các từ trùng phím tắt sẽ được cập nhật)')) {
      SAIGON_XUA_MACROS.forEach(m => {
        macroEngine.setMacro(m.trigger, m.value, m.enabled);
      });
      renderRows();
      await saveState();
      showToast('Đã nạp thành công 40 mẫu từ viết tắt Sài Gòn Xưa!');
    }
  });

  renderRows();
  window.refreshMacroTable = renderRows;
}

function initModals() {
  const modal = document.getElementById('macroModal');
  const addBtn = document.getElementById('addMacroBtn');
  const cancelBtn = document.getElementById('modalCancelBtn');
  const saveBtn = document.getElementById('modalSaveBtn');
  const saveAndContinueBtn = document.getElementById('modalSaveAndContinueBtn');
  const triggerInput = document.getElementById('modalTrigger');
  const valueInput = document.getElementById('modalValue');
  const modalTitle = document.getElementById('modalTitle');

  function openAddModal() {
    editingTrigger = null;
    modalTitle.textContent = 'Thêm Từ Viết Tắt Mới';
    triggerInput.value = '';
    valueInput.value = '';
    triggerInput.disabled = false;
    modal.classList.add('open');
    triggerInput.focus();
  }

  window.openEditModal = function(trigger) {
    const macro = macroEngine.macros.get(trigger.toLowerCase());
    if (!macro) return;
    editingTrigger = trigger;
    modalTitle.textContent = `Chỉnh Sửa Từ Viết Tắt "${trigger}"`;
    triggerInput.value = macro.trigger;
    valueInput.value = macro.value;
    modal.classList.add('open');
    valueInput.focus();
  };

  addBtn.addEventListener('click', openAddModal);
  cancelBtn.addEventListener('click', () => modal.classList.remove('open'));

  async function saveMacroItem(keepOpen) {
    const trigger = triggerInput.value.trim();
    const value = valueInput.value.trim();

    if (!trigger || !value) {
      alert('Vui lòng nhập cả từ viết tắt và cụm từ thay thế.');
      if (!trigger) triggerInput.focus();
      else valueInput.focus();
      return;
    }

    if (editingTrigger && editingTrigger.toLowerCase() !== trigger.toLowerCase()) {
      macroEngine.removeMacro(editingTrigger);
    }

    macroEngine.setMacro(trigger, value, true);
    window.refreshMacroTable();
    await saveState();

    if (keepOpen) {
      editingTrigger = null;
      modalTitle.textContent = 'Thêm Từ Viết Tắt Mới';
      triggerInput.value = '';
      valueInput.value = '';
      triggerInput.disabled = false;
      triggerInput.focus();
      showToast(`Đã lưu "${trigger}"! Mời nhập tiếp.`);
    } else {
      modal.classList.remove('open');
      showToast('Đã lưu bảng gõ tắt!');
    }
  }

  saveBtn.addEventListener('click', () => saveMacroItem(false));
  if (saveAndContinueBtn) {
    saveAndContinueBtn.addEventListener('click', () => saveMacroItem(true));
  }

  triggerInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      valueInput.focus();
    }
  });

  valueInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        saveMacroItem(false);
      } else {
        saveMacroItem(true);
      }
    }
  });
}

function initDictionaryTab() {
  const tbody = document.getElementById('dictTableBody');
  const searchInput = document.getElementById('dictSearch');
  const newWordInput = document.getElementById('newDictWordInput');
  const addWordBtn = document.getElementById('addDictWordBtn');
  const exportTxtBtn = document.getElementById('exportDictTxtBtn');
  const exportJsonBtn = document.getElementById('exportDictJsonBtn');
  const importBtn = document.getElementById('importDictBtn');
  const importModal = document.getElementById('importDictModal');
  const importTextarea = document.getElementById('importDictTextarea');
  const importCancelBtn = document.getElementById('importDictCancelBtn');
  const importConfirmBtn = document.getElementById('importDictConfirmBtn');

  function renderDictRows() {
    if (!tbody) return;
    const query = (searchInput?.value || '').toLowerCase().trim();
    const words = userDictionary.getWords().filter(w => !query || w.includes(query));

    tbody.textContent = '';
    if (words.length === 0) {
      const emptyTr = document.createElement('tr');
      const emptyTd = document.createElement('td');
      emptyTd.colSpan = 3;
      Object.assign(emptyTd.style, {
        textAlign: 'center',
        padding: '24px',
        color: '#94a3b8'
      });
      emptyTd.textContent = 'Chưa có từ riêng nào trong từ điển cá nhân.';
      emptyTr.appendChild(emptyTd);
      tbody.appendChild(emptyTr);
      return;
    }

    words.forEach((word, index) => {
      const tr = document.createElement('tr');

      const tdIndex = document.createElement('td');
      tdIndex.textContent = String(index + 1);
      tdIndex.style.color = '#94a3b8';
      tr.appendChild(tdIndex);

      const tdWord = document.createElement('td');
      const spanWord = document.createElement('span');
      spanWord.className = 'tag-trigger font-mono';
      spanWord.textContent = word;
      tdWord.appendChild(spanWord);
      tr.appendChild(tdWord);

      const tdActions = document.createElement('td');
      tdActions.style.textAlign = 'right';

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn btn-danger';
      deleteBtn.textContent = 'Xóa';
      deleteBtn.addEventListener('click', async () => {
        if (confirm(`Xóa từ "${word}" khỏi từ điển cá nhân?`)) {
          userDictionary.remove(word);
          renderDictRows();
          showToast(`Đã xóa "${word}" khỏi từ điển!`);
        }
      });
      tdActions.appendChild(deleteBtn);
      tr.appendChild(tdActions);

      tbody.appendChild(tr);
    });
  }

  window.refreshDictTable = renderDictRows;

  searchInput?.addEventListener('input', renderDictRows);

  function addNewWord() {
    const raw = (newWordInput?.value || '').trim();
    if (!raw) return;
    if (userDictionary.add(raw)) {
      newWordInput.value = '';
      renderDictRows();
      showToast(`Đã thêm "${raw.toLowerCase()}" vào từ điển cá nhân!`);
    } else {
      alert('Từ này đã có trong từ điển.');
    }
  }

  addWordBtn?.addEventListener('click', addNewWord);
  newWordInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addNewWord();
    }
  });

  exportTxtBtn?.addEventListener('click', () => {
    const data = userDictionary.exportText('txt');
    downloadFile(data, 'tu-dien-ca-nhan.txt', 'text/plain');
  });

  exportJsonBtn?.addEventListener('click', () => {
    const data = userDictionary.exportText('json');
    downloadFile(data, 'tu-dien-ca-nhan.json', 'application/json');
  });

  importBtn?.addEventListener('click', () => {
    if (importTextarea) importTextarea.value = '';
    importModal?.classList.add('open');
  });

  importCancelBtn?.addEventListener('click', () => {
    importModal?.classList.remove('open');
  });

  importConfirmBtn?.addEventListener('click', () => {
    const text = importTextarea?.value || '';
    const count = userDictionary.importText(text);
    importModal?.classList.remove('open');
    renderDictRows();
    showToast(`Đã nạp thành công ${count} từ vào từ điển cá nhân!`);
  });

  renderDictRows();
}

function initPreferences() {
  const methodSelect = document.getElementById('methodSelect');
  const toneStyleSelect = document.getElementById('toneStyleSelect');
  const spellCheckOption = document.getElementById('spellCheckOption');
  const quickTelexOption = document.getElementById('quickTelexOption');
  const emojiShortcutsOption = document.getElementById('emojiShortcutsOption');
  const autoCapitalizeOption = document.getElementById('autoCapitalizeOption');
  const perDomainMemoryOption = document.getElementById('perDomainMemoryOption');
  const quickConsonantsOption = document.getElementById('quickConsonantsOption');
  const autoUndoOption = document.getElementById('autoUndoOption');
  const ctrlToggleOption = document.getElementById('ctrlToggleOption');
  const autoRestoreEnglishOption = document.getElementById('autoRestoreEnglishOption');
  const escRevertOption = document.getElementById('escRevertOption');
  const phonologyRulesOption = document.getElementById('phonologyRulesOption');
  const blacklistTextarea = document.getElementById('blacklistTextarea');
  const newDomainInput = document.getElementById('newDomainInput');
  const newDomainMethodSelect = document.getElementById('newDomainMethodSelect');
  const addDomainBtn = document.getElementById('addDomainBtn');
  const domainMethodsTableBody = document.getElementById('domainMethodsTableBody');

  // AI & Gboard elements in IME settings tab
  const autoCompleteOption = document.getElementById('autoCompleteOption');
  const nextWordOption = document.getElementById('nextWordOption');
  const gboardLearningOption = document.getElementById('gboardLearningOption');

  // AI & Gboard elements in dedicated AI Tab
  const aiTabAutoComplete = document.getElementById('aiTabAutoComplete');
  const aiTabNextWord = document.getElementById('aiTabNextWord');
  const aiTabLearning = document.getElementById('aiTabLearning');

  window.syncPreferencesUI = function syncPreferencesUI() {
    if (methodSelect) methodSelect.value = String(settings.method ?? 3);
    if (toneStyleSelect) toneStyleSelect.value = settings.toneStyle || 'modern';
    if (spellCheckOption) spellCheckOption.checked = Boolean(settings.spellCheck);
    if (quickTelexOption) quickTelexOption.checked = settings.quickTelex !== false;
    if (emojiShortcutsOption) emojiShortcutsOption.checked = settings.emojiShortcuts !== false;
    if (autoCapitalizeOption) autoCapitalizeOption.checked = settings.autoCapitalize !== false;
    if (perDomainMemoryOption) perDomainMemoryOption.checked = settings.perDomainMemory !== false;
    if (quickConsonantsOption) quickConsonantsOption.checked = Boolean(settings.quickConsonants);
    if (autoUndoOption) autoUndoOption.checked = Boolean(settings.autoUndo);
    if (autoRestoreEnglishOption) autoRestoreEnglishOption.checked = settings.autoRestoreEnglish !== false;
    if (escRevertOption) escRevertOption.checked = settings.escRevert !== false;
    if (phonologyRulesOption) phonologyRulesOption.checked = settings.phonologyRules !== false;
    if (ctrlToggleOption) ctrlToggleOption.checked = settings.ctrlToggleEnabled !== false;
    if (blacklistTextarea) blacklistTextarea.value = (settings.blacklistedDomains || []).join('\n');

    // Populate AI toggles
    const isAutoComplete = settings.autoCompleteEnabled !== false;
    const isNextWord = settings.nextWordEnabled !== false;
    const isLearning = settings.gboardLearningEnabled !== false;

    if (autoCompleteOption) autoCompleteOption.checked = isAutoComplete;
    if (aiTabAutoComplete) aiTabAutoComplete.checked = isAutoComplete;
    if (nextWordOption) nextWordOption.checked = isNextWord;
    if (aiTabNextWord) aiTabNextWord.checked = isNextWord;
    if (gboardLearningOption) gboardLearningOption.checked = isLearning;
    if (aiTabLearning) aiTabLearning.checked = isLearning;

    autoCompleteEngine.setEnabled(isAutoComplete);
    autoCompleteEngine.setNextWordEnabled(isNextWord);
    autoCompleteEngine.setLearningEnabled(isLearning);
  };

  window.syncPreferencesUI();

  methodSelect.addEventListener('change', async () => {
    settings.method = parseInt(methodSelect.value, 10);
    await saveState();
  });

  toneStyleSelect.addEventListener('change', async () => {
    settings.toneStyle = toneStyleSelect.value;
    await saveState();
  });

  spellCheckOption.addEventListener('change', async () => {
    settings.spellCheck = spellCheckOption.checked;
    await saveState();
  });

  if (quickTelexOption) {
    quickTelexOption.addEventListener('change', async () => {
      settings.quickTelex = quickTelexOption.checked;
      await saveState();
    });
  }

  if (emojiShortcutsOption) {
    emojiShortcutsOption.addEventListener('change', async () => {
      settings.emojiShortcuts = emojiShortcutsOption.checked;
      await saveState();
    });
  }

  if (autoCapitalizeOption) {
    autoCapitalizeOption.addEventListener('change', async () => {
      settings.autoCapitalize = autoCapitalizeOption.checked;
      await saveState();
    });
  }

  if (perDomainMemoryOption) {
    perDomainMemoryOption.addEventListener('change', async () => {
      settings.perDomainMemory = perDomainMemoryOption.checked;
      await saveState();
    });
  }

  if (quickConsonantsOption) {
    quickConsonantsOption.addEventListener('change', async () => {
      settings.quickConsonants = quickConsonantsOption.checked;
      await saveState();
    });
  }

  autoUndoOption.addEventListener('change', async () => {
    settings.autoUndo = autoUndoOption.checked;
    await saveState();
  });

  if (autoRestoreEnglishOption) {
    autoRestoreEnglishOption.addEventListener('change', async () => {
      settings.autoRestoreEnglish = autoRestoreEnglishOption.checked;
      await saveState();
    });
  }

  if (escRevertOption) {
    escRevertOption.addEventListener('change', async () => {
      settings.escRevert = escRevertOption.checked;
      await saveState();
    });
  }

  if (phonologyRulesOption) {
    phonologyRulesOption.addEventListener('change', async () => {
      settings.phonologyRules = phonologyRulesOption.checked;
      await saveState();
    });
  }

  if (ctrlToggleOption) {
    ctrlToggleOption.addEventListener('change', async () => {
      settings.ctrlToggleEnabled = ctrlToggleOption.checked;
      await saveState();
    });
  }

  // Synchronized AI toggle handlers
  const handleAutoCompleteChange = async (val) => {
    settings.autoCompleteEnabled = val;
    if (autoCompleteOption) autoCompleteOption.checked = val;
    if (aiTabAutoComplete) aiTabAutoComplete.checked = val;
    autoCompleteEngine.setEnabled(val);
    await saveState();
  };

  const handleNextWordChange = async (val) => {
    settings.nextWordEnabled = val;
    if (nextWordOption) nextWordOption.checked = val;
    if (aiTabNextWord) aiTabNextWord.checked = val;
    autoCompleteEngine.setNextWordEnabled(val);
    await saveState();
  };

  const handleLearningChange = async (val) => {
    settings.gboardLearningEnabled = val;
    if (gboardLearningOption) gboardLearningOption.checked = val;
    if (aiTabLearning) aiTabLearning.checked = val;
    autoCompleteEngine.setLearningEnabled(val);
    await saveState();
  };

  autoCompleteOption?.addEventListener('change', () => handleAutoCompleteChange(autoCompleteOption.checked));
  aiTabAutoComplete?.addEventListener('change', () => handleAutoCompleteChange(aiTabAutoComplete.checked));

  nextWordOption?.addEventListener('change', () => handleNextWordChange(nextWordOption.checked));
  aiTabNextWord?.addEventListener('change', () => handleNextWordChange(aiTabNextWord.checked));

  gboardLearningOption?.addEventListener('change', () => handleLearningChange(gboardLearningOption.checked));
  aiTabLearning?.addEventListener('change', () => handleLearningChange(aiTabLearning.checked));

  blacklistTextarea.addEventListener('change', async () => {
    const lines = blacklistTextarea.value.split('\n').map(s => s.trim().toLowerCase()).filter(Boolean);
    settings.blacklistedDomains = lines;
    await saveState();
  });

  // Domain memory table rendering
  function renderDomainMethodsTable() {
    if (!domainMethodsTableBody) return;
    domainMethodsTableBody.textContent = '';
    const domains = Object.keys(settings.domainMethods || {}).sort();

    if (domains.length === 0) {
      const emptyTr = document.createElement('tr');
      const emptyTd = document.createElement('td');
      emptyTd.colSpan = 3;
      Object.assign(emptyTd.style, {
        textAlign: 'center',
        padding: '20px',
        color: '#94a3b8'
      });
      emptyTd.textContent = 'Chưa có website nào được ghi nhớ. Khi bạn chuyển Tắt/Bật trên các trang web, chúng sẽ tự xuất hiện ở đây!';
      emptyTr.appendChild(emptyTd);
      domainMethodsTableBody.appendChild(emptyTr);
      return;
    }

    domains.forEach(domain => {
      const currentMethod = settings.domainMethods[domain];
      const tr = document.createElement('tr');

      const tdDomain = document.createElement('td');
      tdDomain.className = 'font-mono';
      tdDomain.style.fontWeight = '600';
      tdDomain.style.color = '#38bdf8';
      tdDomain.textContent = domain;
      tr.appendChild(tdDomain);

      const tdMethod = document.createElement('td');
      const select = document.createElement('select');
      select.className = 'form-select';
      select.style.padding = '4px 8px';
      select.style.fontSize = '12px';
      select.innerHTML = `
        <option value="0" ${currentMethod === 0 ? 'selected' : ''}>TẮT (Tiếng Anh)</option>
        <option value="1" ${currentMethod === 1 ? 'selected' : ''}>Telex</option>
        <option value="2" ${currentMethod === 2 ? 'selected' : ''}>VNI</option>
        <option value="3" ${currentMethod === 3 ? 'selected' : ''}>Tự động</option>
      `;
      select.addEventListener('change', async () => {
        settings.domainMethods[domain] = parseInt(select.value, 10);
        await saveState();
      });
      tdMethod.appendChild(select);
      tr.appendChild(tdMethod);

      const tdActions = document.createElement('td');
      tdActions.style.textAlign = 'right';
      const delBtn = document.createElement('button');
      delBtn.className = 'btn btn-danger';
      delBtn.style.padding = '4px 10px';
      delBtn.style.fontSize = '12px';
      delBtn.textContent = 'Xóa';
      delBtn.addEventListener('click', async () => {
        delete settings.domainMethods[domain];
        await saveState();
        renderDomainMethodsTable();
      });
      tdActions.appendChild(delBtn);
      tr.appendChild(tdActions);

      domainMethodsTableBody.appendChild(tr);
    });
  }

  function addDomain() {
    let raw = (newDomainInput?.value || '').trim().toLowerCase();
    if (!raw) return;
    try {
      if (raw.startsWith('http://') || raw.startsWith('https://')) {
        raw = new URL(raw).hostname;
      }
    } catch {}
    raw = raw.replace(/^\/+|\/+$/g, '');
    if (!raw) return;
    if (!settings.domainMethods) settings.domainMethods = {};
    settings.domainMethods[raw] = parseInt(newDomainMethodSelect?.value || '0', 10);
    newDomainInput.value = '';
    renderDomainMethodsTable();
    saveState();
  }

  addDomainBtn?.addEventListener('click', addDomain);
  newDomainInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addDomain();
    }
  });

  renderDomainMethodsTable();
}

let renderHabitsTableAndStats = () => {};

function initAiHabitsTab() {
  const statTotalPairs = document.getElementById('statTotalPairs');
  const statTotalTransitions = document.getElementById('statTotalTransitions');
  const statTotalWords = document.getElementById('statTotalWords');
  const habitsTableBody = document.getElementById('habitsTableBody');
  const seedHabitsBtn = document.getElementById('seedHabitsBtn');
  const clearHabitsBtn = document.getElementById('clearHabitsBtn');
  const exportHabitsCsvBtn = document.getElementById('exportHabitsCsvBtn');
  const exportHabitsJsonBtn = document.getElementById('exportHabitsJsonBtn');
  const importHabitsBtn = document.getElementById('importHabitsBtn');
  const importHabitsModal = document.getElementById('importHabitsModal');
  const importHabitsTextarea = document.getElementById('importHabitsTextarea');
  const importHabitsFileInput = document.getElementById('importHabitsFileInput');
  const importHabitsMergeOption = document.getElementById('importHabitsMergeOption');
  const importHabitsCancelBtn = document.getElementById('importHabitsCancelBtn');
  const importHabitsConfirmBtn = document.getElementById('importHabitsConfirmBtn');

  renderHabitsTableAndStats = async () => {
    try {
      await autoCompleteEngine.loadFromStorage();
    } catch {}
    const stats = autoCompleteEngine.getLearnedStats();
    if (statTotalPairs) statTotalPairs.textContent = String(stats.totalPairs);
    if (statTotalTransitions) statTotalTransitions.textContent = String(stats.totalTransitions);
    if (statTotalWords) statTotalWords.textContent = String(stats.totalWordsLearned);

    if (!habitsTableBody) return;
    habitsTableBody.textContent = '';

    if (!stats.topPairs || stats.topPairs.length === 0) {
      const emptyTr = document.createElement('tr');
      const emptyTd = document.createElement('td');
      emptyTd.colSpan = 5;
      Object.assign(emptyTd.style, {
        textAlign: 'center',
        padding: '24px',
        color: '#94a3b8'
      });
      emptyTd.textContent = 'Chưa có thói quen nào được học. Hãy gõ vài từ hoặc nhấn "Nạp Mẫu Thói Quen Thử" để trải nghiệm!';
      emptyTr.appendChild(emptyTd);
      habitsTableBody.appendChild(emptyTr);
      return;
    }

    stats.topPairs.forEach((item, index) => {
      const tr = document.createElement('tr');

      // Col 1: STT
      const td1 = document.createElement('td');
      td1.style.color = '#94a3b8';
      td1.textContent = String(index + 1);

      // Col 2: Từ bắt đầu
      const td2 = document.createElement('td');
      const tagFrom = document.createElement('span');
      tagFrom.className = 'tag-trigger';
      tagFrom.textContent = item.from;
      td2.appendChild(tagFrom);

      // Col 3: Từ kế tiếp (Dự đoán)
      const td3 = document.createElement('td');
      const strongTo = document.createElement('strong');
      strongTo.style.color = '#38bdf8';
      strongTo.textContent = item.to;
      td3.appendChild(strongTo);

      // Col 4: Số lần gõ
      const td4 = document.createElement('td');
      td4.style.textAlign = 'center';
      const countBadge = document.createElement('span');
      Object.assign(countBadge.style, {
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: 'bold',
        background: 'rgba(245, 158, 11, 0.15)',
        color: '#f59e0b',
        border: '1px solid rgba(245, 158, 11, 0.3)'
      });
      countBadge.textContent = `${item.count} lần`;
      td4.appendChild(countBadge);

      // Col 5: Phân loại
      const td5 = document.createElement('td');
      td5.style.textAlign = 'right';
      const badge = document.createElement('span');
      Object.assign(badge.style, {
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        background: 'rgba(16, 185, 129, 0.15)',
        color: '#10b981',
        border: '1px solid rgba(16, 185, 129, 0.3)'
      });
      badge.textContent = 'Thói quen';
      td5.appendChild(badge);

      tr.appendChild(td1);
      tr.appendChild(td2);
      tr.appendChild(td3);
      tr.appendChild(td4);
      tr.appendChild(td5);
      habitsTableBody.appendChild(tr);
    });
  };

  seedHabitsBtn?.addEventListener('click', () => {
    const count = autoCompleteEngine.seedLearnedHabits();
    renderHabitsTableAndStats();
    showToast(`Đã nạp thành công ${count} mẫu thói quen học thử nghiệm (bao gồm "nghiên" -> "cứu")!`);
  });

  clearHabitsBtn?.addEventListener('click', () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử thói quen đã học trên máy này không?')) {
      autoCompleteEngine.clearLearnedHabits();
      renderHabitsTableAndStats();
      showToast('Đã xóa sạch bộ nhớ thói quen!');
    }
  });

  // Export Habits to JSON
  exportHabitsJsonBtn?.addEventListener('click', () => {
    const jsonStr = autoCompleteEngine.exportLearnedJSON();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    downloadFile(jsonStr, `openviet_habits_${dateStr}.json`, 'application/json');
    showToast('Đã xuất file JSON thói quen thành công!');
  });

  // Export Habits to CSV
  exportHabitsCsvBtn?.addEventListener('click', () => {
    const csvStr = autoCompleteEngine.exportLearnedCSV();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    downloadFile(csvStr, `openviet_habits_${dateStr}.csv`, 'text/csv;charset=utf-8;');
    showToast('Đã xuất file CSV thói quen thành công!');
  });

  // Open Import Habits Modal
  importHabitsBtn?.addEventListener('click', () => {
    if (importHabitsTextarea) importHabitsTextarea.value = '';
    if (importHabitsFileInput) importHabitsFileInput.value = '';
    importHabitsModal?.classList.add('open');
  });

  importHabitsCancelBtn?.addEventListener('click', () => {
    importHabitsModal?.classList.remove('open');
  });

  // File picker handler for habits
  importHabitsFileInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (importHabitsTextarea) {
        importHabitsTextarea.value = event.target?.result || '';
      }
    };
    reader.readAsText(file);
  });

  // Confirm Import Habits
  importHabitsConfirmBtn?.addEventListener('click', async () => {
    const raw = importHabitsTextarea?.value || '';
    if (!raw.trim()) {
      alert('Vui lòng dán nội dung hoặc chọn file trước khi nạp.');
      return;
    }
    const isMerge = importHabitsMergeOption ? importHabitsMergeOption.checked : true;
    const res = autoCompleteEngine.importLearnedData(raw, isMerge);
    if (res.success) {
      importHabitsModal?.classList.remove('open');
      renderHabitsTableAndStats();
      showToast(`Đã nạp thành công ${res.count} cặp thói quen gõ từ!`);
    } else {
      alert(`Lỗi nạp dữ liệu: ${res.error}`);
    }
  });

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes['avim_gboard_habit_model']) {
        renderHabitsTableAndStats();
      }
    });
  }

  renderHabitsTableAndStats();
}

function initImportExport() {
  const exportJsonBtn = document.getElementById('exportJsonBtn');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const importBtn = document.getElementById('importBtn');

  const importModal = document.getElementById('importModal');
  const importTextarea = document.getElementById('importTextarea');
  const importCancelBtn = document.getElementById('importCancelBtn');
  const importConfirmBtn = document.getElementById('importConfirmBtn');

  exportJsonBtn.addEventListener('click', () => {
    const data = macroEngine.exportJSON();
    downloadFile(data, 'avim-macros.json', 'application/json');
  });

  exportCsvBtn.addEventListener('click', () => {
    const data = macroEngine.exportCSV();
    downloadFile(data, 'avim-macros.csv', 'text/csv');
  });

  importBtn.addEventListener('click', () => {
    importTextarea.value = '';
    importModal.classList.add('open');
  });

  importCancelBtn.addEventListener('click', () => importModal.classList.remove('open'));

  importConfirmBtn.addEventListener('click', async () => {
    const raw = importTextarea.value.trim();
    if (!raw) return;

    let res;
    if (raw.startsWith('[') || raw.startsWith('{')) {
      res = macroEngine.importJSON(raw);
    } else {
      res = macroEngine.importCSV(raw);
    }

    if (res.success) {
      importModal.classList.remove('open');
      window.refreshMacroTable();
      await saveState();
      showToast(`Đã nhập thành công ${res.count} từ viết tắt!`);
    } else {
      alert(`Lỗi nhập dữ liệu: ${res.error}`);
    }
  });
}

function downloadFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeHtml(str) {
  return (str || '').replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[m]);
}

/**
 * Robust Initialization Flow:
 * 1. Wire tabs, modals, tables, and event handlers immediately so all UI buttons work synchronously.
 * 2. Load stored settings/macros asynchronously and update the UI when ready.
 */
function initOptionsPage() {
  try {
    initTabs();
    initTable();
    initModals();
    initDictionaryTab();
    initPreferences();
    initAiHabitsTab();
    initImportExport();
  } catch (err) {
    console.error('Options page synchronous init error:', err);
  }

  loadState().then(() => {
    if (typeof refreshMacroTable === 'function') refreshMacroTable();
    if (typeof refreshDictTable === 'function') refreshDictTable();
    if (typeof renderDomainMethodsTable === 'function') renderDomainMethodsTable();
    if (typeof renderHabitsTableAndStats === 'function') renderHabitsTableAndStats();
    if (typeof window.syncPreferencesUI === 'function') window.syncPreferencesUI();
  }).catch(err => {
    console.warn('Options page loadState async warning:', err);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initOptionsPage);
} else {
  initOptionsPage();
}

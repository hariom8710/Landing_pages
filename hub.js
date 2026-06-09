document.addEventListener('DOMContentLoaded', function () {
  var PASSWORD = 'Hub123@';
  var EDIT_FLAG = 'hub_edit';
  var OVERRIDES_KEY = 'hub_content_overrides';

  function isEditing() { return sessionStorage.getItem(EDIT_FLAG) === '1'; }
  function applyOverrides() {
    try {
      var o = JSON.parse(localStorage.getItem(OVERRIDES_KEY) || '{}');
      Object.keys(o).forEach(function (k) {
        var el = document.querySelector('[data-edit-key="' + k + '"]');
        if (el) el.innerHTML = o[k];
      });
    } catch (e) { /* ignore */ }
  }

  function enableAdminControls() {
    var addClone = document.getElementById('add-clone');
    var addExt = document.getElementById('add-external');
    if (addClone) addClone.disabled = false;
    if (addExt) addExt.disabled = false;
  }
  function disableAdminControls() {
    var addClone = document.getElementById('add-clone');
    var addExt = document.getElementById('add-external');
    if (addClone) addClone.disabled = true;
    if (addExt) addExt.disabled = true;
  }

  function showEditControls() {
    var container = document.getElementById('edit-controls');
    if (!container) {
      container = document.createElement('div');
      container.id = 'edit-controls';
      container.style.display = 'inline-flex';
      container.style.gap = '8px';
      var editToggle = document.getElementById('edit-toggle') || document.getElementById('edit-mode-btn');
      if (editToggle && editToggle.parentNode) editToggle.parentNode.insertBefore(container, editToggle.nextSibling);
    }
    container.innerHTML = '';
    var save = document.createElement('button');
    save.className = 'button button--minimal';
    save.id = 'save-edits';
    save.textContent = 'Save';
    save.addEventListener('click', saveChanges);
    var cancel = document.createElement('button');
    cancel.className = 'button button--minimal';
    cancel.id = 'cancel-edits';
    cancel.textContent = 'Cancel';
    cancel.addEventListener('click', cancelChanges);
    container.appendChild(save);
    container.appendChild(cancel);
    container.style.display = 'inline-flex';
  }
  function hideEditControls() {
    var container = document.getElementById('edit-controls');
    if (container) container.style.display = 'none';
  }

  function enableEditing() {
    document.body.classList.add('editing');
    document.querySelectorAll('[data-editable]').forEach(function (el) { el.contentEditable = 'true'; el.classList.add('editable-active'); });
    enableAdminControls();
    showEditControls();
  }
  function disableEditing() {
    document.body.classList.remove('editing');
    document.querySelectorAll('[data-editable]').forEach(function (el) { el.contentEditable = 'false'; el.classList.remove('editable-active'); });
    disableAdminControls();
    hideEditControls();
  }

  function promptPassword() {
    var p = window.prompt('Enter edit password:');
    if (p === PASSWORD) {
      sessionStorage.setItem(EDIT_FLAG, '1');
      enableEditing();
      window.scrollTo(0,0);
      return true;
    }
    alert('Incorrect password');
    return false;
  }

  function saveChanges() {
    try {
      var o = JSON.parse(localStorage.getItem(OVERRIDES_KEY) || '{}');
      document.querySelectorAll('[data-edit-key]').forEach(function (el) {
        var key = el.getAttribute('data-edit-key');
        o[key] = el.innerHTML;
      });
      localStorage.setItem(OVERRIDES_KEY, JSON.stringify(o));
      sessionStorage.removeItem(EDIT_FLAG);
      disableEditing();
      updateEditButtonLabel();
      // re-render lists if present
      if (window.hub && typeof window.hub.renderList === 'function') {
        try { window.hub.renderList(window.hub.clonesKey, 'clones-list'); } catch (e) {}
        try { window.hub.renderList(window.hub.externalKey, 'external-list'); } catch (e) {}
      }
      alert('Changes saved');
    } catch (e) { alert('Failed to save changes'); }
  }

  function cancelChanges() {
    applyOverrides();
    sessionStorage.removeItem(EDIT_FLAG);
    disableEditing();
    updateEditButtonLabel();
  }

  // Wire up edit toggle (support existing ids)
  var editToggle = document.getElementById('edit-toggle') || document.getElementById('edit-mode-btn');
  function updateEditButtonLabel() {
    if (!editToggle) return;
    try {
      editToggle.textContent = isEditing() ? 'Lock' : 'Edit';
    } catch (e) {}
  }
  if (editToggle) {
    editToggle.addEventListener('click', function () {
      if (isEditing()) {
        // lock and disable
        sessionStorage.removeItem(EDIT_FLAG);
        disableEditing();
        updateEditButtonLabel();
      } else {
        if (promptPassword()) updateEditButtonLabel();
      }
    });
  }

  // initial state
  applyOverrides();
  if (isEditing()) enableEditing(); else disableEditing();
  updateEditButtonLabel();
});

//Copyright 2012 Google Inc.  All Rights Reserved.
'use strict';

// Create the visible DevTools panel/tab.
(function() {
  var locale = null;
  try {
    locale = localStorage.getItem('localeId');
  } catch (e) {
    //Failed to get locale from localStorage. Use default.
    locale = null;
  }

  if (!locale) {
    var default_locale = chrome.i18n.getMessage('@@ui_locale');
    locale = default_locale ? default_locale : 'en_US';
  }
  var query = '?hl=' + locale;
  if (chrome.devtools && chrome.devtools.panels) {
    chrome.devtools.panels.create('PageSpeed',
        'pagespeed-devtools-icon.png', 'PagespeedChromium.html' + query);
  } else {
    alert('Chrome DevTools extension API is not available.');
  }
})();

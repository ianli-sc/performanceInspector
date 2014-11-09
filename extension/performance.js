/**
 * devtools panels
 */
chrome.devtools.panels.create(
    'Performance',
    './icon.png',
    'Panel/panel.html',
    function(extensionPanel) {
        var _window; // Going to hold the reference to panel.html's `window`

        var tabId = chrome.devtools.inspectedWindow.tabId;
        var port = chrome.runtime.connect({
            name: 'performance_' + tabId
        });

        port.onMessage.addListener(function(msg) {
            // Write information to the panel, if exists.
            // If we don't have a panel reference (yet), queue the data.
            if (_window) {
                _window.afterReload(msg);
            }
        });
        extensionPanel.onShown.addListener(function tmp(panelWindow) {
            extensionPanel.onShown.removeListener(tmp); // Run once only
            _window = panelWindow;
        });
    }
);
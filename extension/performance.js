/**
 * devtools panels
 */
chrome.devtools.panels.create(
    'Performance',
    null, // No icon path
    'Panel/panel.html',
    null // no callback needed
);
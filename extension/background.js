//Save active port
var ports = {};

// Function to send a message to all devtools.html views:
function notifyDevtools(msg, id, url) {
    var port = ports[id];
    if(port.port && port.url === url) {
        port.port.postMessage(msg);
    }
}

chrome.runtime.onConnect.addListener(function(port) {
    var names = port.name.split('_');
    if (!names || names.length !== 3 || names[0] !== "performance") {
        return;
    }
    curTabId = names[1];
    ports[curTabId] =  {
        port : port,
        url : names[2]
    };
    // Remove port when destroyed (eg when devtools instance is closed)
    port.onDisconnect.addListener(function () {
        delete ports[curTabId];
    });
});

chrome.webNavigation.onCompleted.addListener(function(details) {
    notifyDevtools('reloadcomplete', details.tabId, details.url);
});
//Save active port
var ports = {};

// Function to send a message to all devtools.html views:
function notifyDevtools(msg, id) {
    var port = ports[id];
    if(port) {
        port.postMessage(msg);
    }
}

//reset data
chrome.runtime.onStartup.addListener(function() {
    ports = {};
});

chrome.runtime.onConnect.addListener(function(port) {
    //fixed error when other extensions fire connect event
    if(!port) {
        return;
    }
    var names = port.name.split('_');
    if (!names || names.length !== 2 || names[0] !== "performance") {
        return;
    }
    curTabId = names[1];
    ports[curTabId] =  port;
    // Remove port when destroyed (eg when devtools instance is closed)
    port.onDisconnect.addListener(function () {
        delete ports[curTabId];
    });
});

//Trigger with frames and subFrames such as iframe!
//chrome.webNavigation.onCompleted.addListener(function(details) {
//    notifyDevtools('reloadcomplete', details.tabId, details.url);
//});

//Only trigger if user use History API
//chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
//    console.log('Page uses History API and we heard a pushSate/replaceState.');
//    // do your thing
//});

//Only trigger if hash change
//chrome.webNavigation.onReferenceFragmentUpdated.addListener(function(detail) {
//    debugger
//});
chrome.tabs.onUpdated.addListener(function(id, info, tab) {
    if(info.status === 'complete') {
        notifyDevtools('reloadcomplete', id);
    }
});
/* global chrome */

chrome.runtime.onInstalled.addListener(() => {
  chrome.scripting.registerContentScripts([{
    id:            "seeded-random",
    matches:       ["<all_urls>"],
    js:            ["seed-hook.js"],
    runAt:         "document_start",
    world:         "MAIN",
    allFrames:     true
  }]);
});
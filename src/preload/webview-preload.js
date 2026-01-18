// Webview preload script - minimal exposure for security
const { contextBridge } = require('electron');

// Only expose what's absolutely necessary
contextBridge.exposeInMainWorld('spinBrowser', {
  version: '1.0.0',
  isOSINTBrowser: true
});

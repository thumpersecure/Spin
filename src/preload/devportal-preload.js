const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('devAPI', {
  // Execute command
  executeCommand: (command) => ipcRenderer.invoke('execute-command', command),

  // Get command history
  getCommandHistory: () => ipcRenderer.invoke('get-command-history'),

  // Get privacy settings
  getPrivacySettings: () => ipcRenderer.invoke('get-privacy-settings'),

  // Get bookmarks
  getBookmarks: () => ipcRenderer.invoke('get-bookmarks'),

  // Get history
  getHistory: () => ipcRenderer.invoke('get-history'),

  // Listen for logs
  onLog: (callback) => ipcRenderer.on('log', (event, data) => callback(data)),

  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

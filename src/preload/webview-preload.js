/**
 * SANDIEGO Browser - Webview Preload Script
 * Version: 3.0.0-sandiego
 * Minimal exposure for security in browsed content
 */

const { contextBridge } = require('electron');

// Only expose minimal, safe information
contextBridge.exposeInMainWorld('sandiegoBrowser', {
  version: '3.0.0-sandiego',
  name: 'SANDIEGO Browser',
  isPrivacyBrowser: true
});

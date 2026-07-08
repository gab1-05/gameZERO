'use strict';
const { contextBridge, ipcRenderer } = require('electron');

if (process.type === 'renderer') {
  contextBridge.exposeInMainWorld('electronAPI', {
    isElectron: true,
    systemQuery: (endpoint) => ipcRenderer.invoke('system:' + endpoint),
    systemCommand: (endpoint, payload) => ipcRenderer.invoke('system:cmd:' + endpoint, payload),
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close'),
  });
}

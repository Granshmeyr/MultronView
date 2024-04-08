/* eslint-disable @typescript-eslint/no-explicit-any */
import { contextBridge, ipcRenderer } from "electron";

const listeners = new Set<string>();

contextBridge.exposeInMainWorld("electronAPI", {
  send: (channel: string, ...args: any[]) => {
    ipcRenderer.send(channel, ...args);
  },
  on: (
    channel: string,
    listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void
  ) => {
    listeners.add(channel);
    ipcRenderer.on(channel, listener);
  },
  once: (
    channel: string,
    listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void
  ) => {
    ipcRenderer.once(channel, listener);
  },
  removeListener: (
    channel: string,
    listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void
  ) => {
    listeners.delete(channel);
    ipcRenderer.removeListener(channel, listener);
  },
  isListening: (
    channel: string
  ): boolean => {
    return listeners.has(channel);
  }
});
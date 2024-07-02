// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { ServicePort } from './service';
import { Service } from './service.d';

const electronHandler = {
  getServices: (): Promise<ServicePort[]> => ipcRenderer.invoke('getServices'),
  forwardPort: (pod: Service): Promise<any> =>
    ipcRenderer.invoke('forwardPort', pod),
  disconnect: (pod: Service): Promise<any> =>
    ipcRenderer.invoke('disconnect', pod),
  getIsConnected: (pod: Service): Promise<boolean> =>
    ipcRenderer.invoke('getIsConnected', pod),
  getConnectStatus: (pod: Service): Promise<string> =>
    ipcRenderer.invoke('getConnectStatus', pod),
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;

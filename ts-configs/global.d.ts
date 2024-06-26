import { IpcListenerFunction } from "../src/common/interfaces.ts";

declare global {
    interface Window {
        electronAPI: {
            send: (
                channel: string,
                ...args: unknown[]
            ) => void;
            on: (
                channel: string,
                listener: IpcListener
            ) => void;
            once: (
                channel: string,
                listener: IpcListenerFunction
            ) => Electron.IpcRenderer;
            removeListener: (
                channel: string,
                listener: IpcListener
            ) => void;
            invoke: (
                channel: string,
                ...args: unknown[]
            ) => Promise<unknown>;
            setTitlebarBg: (
                hex: string
            ) => void;
        };
    }
}

export { };
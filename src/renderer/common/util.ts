import * as channels from "../../common/channels";

// https://stackoverflow.com/questions/1484506/random-color-generator#comment18632055_5365036
export function randomColor() {
  return "#" + ("00000"+(Math.random()*(1<<24)|0).toString(16)).slice(-6);
}
export function onResize(id: string, rectangle: Electron.Rectangle) {
  window.electronAPI.send(channels.setViewRectangle, id, rectangle);
}
export function logInfo(options: unknown, message: string) {
  window.electronAPI.send(channels.logInfo, options, message);
}
export function logError(options: unknown, message: string) {
  window.electronAPI.send(channels.logError, options, message);
}
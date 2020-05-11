// @ts-ignore
import SockJS from 'sockjs-client';

let tryTimes = 1;
const tryLimit = 6;

export function connect(api: string) {
  if (!api) {
    throw new Error('ws api cat not be empty');
  }
  let socket = new SockJS(api);
  socket.api = api;

  socket.onopen = () => {
    clearTimeout(socket.timer);
  };

  socket.reconnect = () => {
    if (socket.connected) {
      console.log('disconnecting...');
      socket.close();
    }
    socket.timer = setTimeout(() => {
      tryTimes += 1;
      if (tryTimes < tryLimit) {
        console.log(`try reconnecting ${tryTimes - 1} times`);
        socket = connect(socket.api);
      }
    }, 10000 * tryTimes);
  };

  socket.onclose = socket.reconnect;
  socket.onerror = socket.reconnect;

  return socket;
}

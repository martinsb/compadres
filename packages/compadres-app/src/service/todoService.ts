import { EventEmitter } from "events";
import {encode, decode} from "@msgpack/msgpack";

import { TodoError, TodoMessage } from "compadres-common";

type InitOptions = {
  name: string;
}

interface TodoServiceEventMap {
  "project-list": string[];
  "project-data": {
    name: string;
    data: number[];
  };
  "project-changes": {
    name: string;
    changes: number[][];
  }
  "error": TodoError;
}

export default class TodoService {
  private _socket: WebSocket;
  private _name: string;
  private _emitter = new EventEmitter();

  constructor({name}: InitOptions) {
    this._name = name;
    this._socket = new WebSocket("ws://192.168.9.156:3000/todows");
    this._socket.addEventListener("message", this._receive.bind(this));
  }

  connect() {
    this._send({
      type: "join",
      payload: {
        name: this._name,
      },
    });
  }

  disconnect() {
    this._socket.close();
  }

  open(projectName: string) {
    this._send({
      type: "open-project",
      payload: projectName,
    });
  }

  close(projectName: string) {
    this._send({
      type: "close-project",
      payload: projectName,
    });
  }

  on<K extends keyof TodoServiceEventMap>(event: K, listener: (this: TodoService, args: TodoServiceEventMap[K]) => void): void {
    this._emitter.addListener(event, listener);
  }

  off<K extends keyof TodoServiceEventMap>(event: K, listener: (this: TodoService, args: TodoServiceEventMap[K]) => void): void {
    this._emitter.removeListener(event, listener);
  }

  sendChanges(projectName: string, changes: Uint8Array[]) {
    this._send({
      type: "project-changes",
      payload: {
        name: projectName,
        changes,
      }
    })
  }

  async _send(message: TodoMessage) {
    await this._waitForOpen();
    this._socket.send(encode(message));
  }

  _receive(event: MessageEvent) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const buf = event.target?.result;
      if (!buf) {
        return;
      }
      const rawData = new Uint8Array(buf as ArrayBufferLike);
      const message = decode(rawData) as TodoMessage;
      this._emitter.emit(message.type, message.payload);
    }
    reader.readAsArrayBuffer(event.data);
  }

  async _waitForOpen(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this._socket.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }
      const onOpen = () => {
        resolve();
        this._socket.removeEventListener("open", onOpen);
      };
      this._socket.addEventListener("open", onOpen);
      //TODO "error"
    })
  }
}

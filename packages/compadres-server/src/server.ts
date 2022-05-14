import express from "express";
import { RawData, WebSocket, WebSocketServer } from "ws";
import { createServer } from "http";
import { TodoService } from "./todos";

type Message =
  | {
      type: "join";
      payload: {
        name: string;
      };
    }
  | {
      type: "project-list";
      payload: string[];
    }
  | {
      type: "error-name-taken";
      payload: string;
    };

const users = new Map<WebSocket, string>();

const PORT = 3003;

const service = new TodoService();

const httpServer = createServer();
const socketServer = new WebSocketServer({ noServer: true });

socketServer.on("connection", async (socket) => {
  console.log("Connected");
  socket.on("close", () => {
    users.delete(socket);
    console.log("Disconnected");
  });

  socket.on("message", async (data) => {
    const message = parseMessage(data);
    if (!message) {
      return;
    }
    switch (message.type) {
      case "join": {
        const { name } = message.payload;
        if (Array.from(users.values()).find((userName) => userName === name)) {
          sendMessage(socket, {
            type: "error-name-taken",
            payload: name,
          });
          return;
        }
        users.set(socket, name);
        const projects = await service.listProjects();
        sendMessage(socket, {
          type: "project-list",
          payload: projects,
        });
      }
    }
  });
});

httpServer.on("upgrade", (req, socket, head) => {
  //TODO auth?
  if (req.url === "/todows") {
    socketServer.handleUpgrade(req, socket, head, (ws) => {
      socketServer.emit("connection", ws, req);
    });
  } else {
    socket.destroy();
  }
});

httpServer.listen(PORT, () => {
  console.log(`Server listening to port ${PORT}`);
});

function parseMessage(data: RawData): Message | null {
  try {
    const message = JSON.parse(data.toString());
    return message as Message;
  } catch (e) {
    return null;
  }
}

function sendMessage(socket: WebSocket, message: Message) {
  socket.send(JSON.stringify(message));
}

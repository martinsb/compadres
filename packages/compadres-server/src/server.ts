import express from "express";
import { RawData, WebSocket, WebSocketServer } from "ws";
import { createServer } from "http";
import { TodoService } from "./todos";

import { TodoMessage } from "compadres-common";
import { assert } from "console";
import Automerge, { BinaryChange } from "automerge";

const users = new Map<WebSocket, string>();
const projectRooms = new Map<string, Set<string>>(); //project name -> set of users

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
            type: "error",
            payload: {
              code: "name-taken",
              name,
            },
          });
          return;
        }
        users.set(socket, name);
        const projects = await service.listProjects();
        sendMessage(socket, {
          type: "project-list",
          payload: projects,
        });
        break;
      }
      case "open-project": {
        const userName = users.get(socket)!;
        const projectName = message.payload;
        if (!projectRooms.has(projectName)) {
          projectRooms.set(projectName, new Set<string>());
        }
        projectRooms.get(projectName)?.add(userName);
        console.info(`User ${userName} opened project ${projectName}`);
        const projectData = await service.getProject(projectName);
        sendMessage(socket, {
          type: "project-data",
          payload: {
            name: projectName,
            data: Array.from<number>(projectData),
          }
        });
        break;
      }
      case "close-project": {
        const userName = users.get(socket)!;
        const projectName = message.payload;
        projectRooms.get(projectName)?.delete(userName);
        console.info(`User ${userName} closed project ${projectName}`);
        break;
      }
      case "project-changes": {
        const {name: projectName, changes} = message.payload;
        await service.updateProject(projectName, changes);
        broadcast({
          type: "project-changes",
          payload: {
            name: projectName,
            changes,
          }
        }, socket)
        console.log("changes applied");
      }
    }
  });
});

httpServer.on("upgrade", (req, socket, head) => {
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

function parseMessage(data: RawData): TodoMessage | null {
  try {
    const message = JSON.parse(data.toString());
    return message as TodoMessage;
  } catch (e) {
    return null;
  }
}

function sendMessage(socket: WebSocket, message: TodoMessage) {
  socket.send(JSON.stringify(message));
}

function broadcast(message: TodoMessage, exclude?: WebSocket) {
  const encoded = JSON.stringify(message);
  for (const [socket, ] of users) {
    if (socket !== exclude) {
      socket.send(encoded);
    }
  }
}

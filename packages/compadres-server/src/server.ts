import path from "path";
import { RawData, WebSocket, WebSocketServer } from "ws";
import { createServer, Server } from "http";
import { TodoService } from "./todos";
import {Server as StaticServer} from "node-static";

import { TodoMessage } from "compadres-common";
import { encode, decode } from "@msgpack/msgpack";

const users = new Map<WebSocket, string>();
const projectRooms = new Map<string, Set<string>>(); //project name -> set of users

const PORT = 3003;

const service = new TodoService();

const httpServer = createHttpServer();
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
            data: projectData,
          },
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
        const { name: projectName, changes } = message.payload;
        await service.updateProject(projectName, changes);
        broadcast(
          projectName,
          {
            type: "project-changes",
            payload: {
              name: projectName,
              changes,
            },
          },
          socket
        );
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
    if (Array.isArray(data)) {
      throw new Error("Raw data as a Buffer array is not supported yet");
    }
    const message = decode(new Uint8Array(data));
    return message as TodoMessage;
  } catch (e) {
    return null;
  }
}

function sendMessage(socket: WebSocket, message: TodoMessage) {
  const encoded = encode(message);
  socket.send(encoded, { binary: true });
}

function broadcast(
  projectName: string,
  message: TodoMessage,
  exclude?: WebSocket
) {
  const encoded = encode(message);
  for (const [socket, userName] of users) {
    if (socket === exclude) {
      continue;
    }
    if (projectRooms.get(projectName)?.has(userName)) {
      socket.send(encoded);
    }
  }
}

function createHttpServer() {
  if (process.env.NODE_ENV === "production") {
    const fileServer = new StaticServer(path.join(__dirname, "public"));
    return createServer((req, res) => {
      fileServer.serve(req, res);
    });
  }
  return createServer();
}
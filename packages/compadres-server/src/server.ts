import express from "express";
import { WebSocketServer } from "ws";
import { createServer } from "http";

import dotenv from "dotenv";

dotenv.config();

const TODOS = {
  todo1: {
    name: "Groceries",
    items: [
      {
        title: "Canned beans",
        done: false,
      },
      {
        title: "Carrots",
        done: true,
      },
      {
        title: "Zucchini",
        done: false,
      }
    ],
  },
  todo2: {
    name: "Daily routine",
    items: [
      {
        title: "Brush teeth",
        done: true,
      },
      {
        title: "Exercise",
        done: false,
      },
      {
        title: "Walk outsite",
        done: true
      },
      {
        title: "Have breakfast",
        done: false,
      }
    ]
  }
};

const PORT = 3003;

//const app = express();

const httpServer = createServer();
const socketServer = new WebSocketServer({noServer: true});

socketServer.on("connection", (socket) => {
  console.log("Connected");
  socket.on("close", () => {
    console.log("Disconnected");
  });
});

httpServer.on("upgrade", (req, socket, head) => {
  //TODO auth?
  if (req.url === "/todows") {
    socketServer.handleUpgrade(req, socket, head, (ws) => {
      socketServer.emit("connection", ws, req)
    });
  } else {
    socket.destroy();
  }
})

httpServer.listen(PORT, () => {
  console.log(`Server listening to port ${PORT}`);
});

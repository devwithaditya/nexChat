import { io } from "socket.io-client";

export const socket = io("https://nexchat-backend-epnj.onrender.com", {
  autoConnect: false,
});
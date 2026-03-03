// src/socket.js
import { io } from "socket.io-client";

const socket = io("https://campusconnect-ycfd.onrender.com", {
  withCredentials: true,
  transports: ["websocket"],
});

export default socket;

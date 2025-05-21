const express = require("express");
const http = require("http");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const app = express();
const server = http.createServer(app);

const io = require("socket.io")(server);

const ARDUINO_PORT = "COM4";  // Cambia esto si usas otro puerto
const BAUD_RATE = 9600;

const port = new SerialPort({ path: ARDUINO_PORT, baudRate: BAUD_RATE });
const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

app.use(express.static("public")); // Carpeta con index.html y js del cliente

// Cuando llega data del Arduino la enviamos a la web
parser.on("data", (data) => {
  console.log("Arduino dice:", data);
  io.emit("arduinoData", data);
});

io.on("connection", (socket) => {
  console.log("Cliente conectado");

  socket.on("botonPresionado", (msg) => {
    console.log("Recibido del cliente:", msg);
    // Mandamos al Arduino el comando recibido del cliente web
    port.write(msg + "\n");
  });
});

server.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});


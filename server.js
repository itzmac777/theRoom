const express = require("express")
const http = require("http")
const app = express()
const PORT = 3000
const server = http.createServer(app)
const { Server } = require("socket.io")
const io = new Server(server)
const { v4: uuid4 } = require("uuid")
const rooms = {}
const crypto = require("crypto")
const { ms, s, m, h, d } = require("time-convert")

io.on("connection", (socket) => {
  console.log("Connected with socket-id", socket.id)

  //Room Events
  socket.on("create-room", (roomData) => createRoom(roomData, socket))
  socket.on("join-room", (roomData) => joinRoom(roomData, socket))
  socket.on("leave-room", () => roomDisconnectionHandler(socket))
  socket.on("disconnect", () => roomDisconnectionHandler(socket))
  //File Events
  socket.on("file-upload", (fileData) => {
    rooms[socket.roomId].files.push(fileData)
    io.to(socket.roomId).emit("file-received", fileData)
  })
})

//MIDDLEWARES
app.set("view engine", "ejs")
app.set("views", "./views/structure")
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname + "/public"))

//ROUTES
app.get("/", (req, res) => {
  res.render("boilerplate", { page: "../pages/home" })
})

//SERVER
server.listen(PORT, () => {
  console.log("Server started at port", PORT)
})

//HELPER FUNCTIONS
function createRoom(roomData, socket) {
  const roomId = generateHash(roomData.rName + roomData.rPassword)
  if (rooms[roomId]) {
    io.to(socket.id).emit("error", "Room already exists")
    return
  }
  socket.roomId = roomId
  createRoomObject(roomData, socket)
  joinRoomHandler(socket)
  displayCounterAndDeleteRoom(socket)
}

function joinRoom(roomData, socket) {
  const roomId = generateHash(roomData.rName + roomData.rPassword)
  if (!rooms[roomId]) {
    io.to(socket.id).emit("error", "Room doesn't exists")
    return
  }
  socket.roomId = roomId
  rooms[socket.roomId].files.forEach((fileData) => {
    io.to(socket.id).emit("file-received", fileData)
  })
  joinRoomHandler(socket)
}

function createRoomObject(roomData, socket) {
  rooms[socket.roomId] = {
    files: [],
    members: [],
    createdAt: Date.now(),
    expiresAt:
      ms.from(h, m, s)(
        roomData.expiresAt[0],
        roomData.expiresAt[1],
        roomData.expiresAt[2]
      ) || 60000,
  }
}

function roomDisconnectionHandler(socket) {
  if (socket?.roomId != null) {
    const roomId = socket.roomId
    socket.leave(roomId)
    const index = rooms[roomId]?.members?.indexOf(socket.id)
    if (index > -1) {
      rooms[roomId]?.members?.splice(index, 1)
    }
    console.log(`${socket.id} left the room`)
    socket.roomId = null
  }
}

function joinRoomHandler(socket) {
  rooms[socket.roomId]?.members?.push(socket.id)
  socket.join(socket.roomId)
  io.to(socket.id).emit("success", true)
  io.to(socket.roomId).emit("msg", `${socket.id} joined the room`)
  console.log(`${socket.id} joined room: ${socket.roomId}`)
}

function displayCounterAndDeleteRoom(socket) {
  const roomId = socket.roomId
  let counter = rooms[roomId].expiresAt - 1000
  const intervalCounterId = setInterval(() => {
    io.to(roomId).emit("timer", ms.to(h, m, s)(counter))
    counter = counter - 1000
  }, 1000)
  setTimeout(() => {
    io.to(roomId).emit("room-deleted", roomId)
    delete rooms[roomId]
    clearInterval(intervalCounterId)
  }, rooms[roomId].expiresAt)
}

function generateHash(string) {
  return crypto
    .createHash("sha256")
    .update(string)
    .digest("hex")
    .substring(0, 16)
}

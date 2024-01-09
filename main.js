// 参考文献: https://qiita.com/kotazuck/items/7ad1672c71aa38d6af6d
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')

const app = express()
app.use(express.static(__dirname + '/public'))

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

io.on('connect', socket => {
  console.log('io', 'connect')
  console.log('io', 'socket: ', socket.id)

  socket.on('send_message', (data) => {
    console.log('socket', 'send_message', data.message)
    socket.broadcast.emit('recieve_message', data.message)
  })
})

server.listen(3000)
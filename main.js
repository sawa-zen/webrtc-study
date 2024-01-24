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
  socket.on('SEND_OFFER', function(data) {
    socket.broadcast.emit('RECEIVE_OFFER', data.sdp)
  })

  socket.on('SEND_ANSWER', function(data) {
    socket.broadcast.emit('RECEIVE_ANSWER', data.sdp)
  })

  socket.on('SEND_CANDIDATE', function(data) {
    socket.broadcast.emit('RECEIVE_CANDIDATE', data.ice)
  })
})

server.listen(3000)
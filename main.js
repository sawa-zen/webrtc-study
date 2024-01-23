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

  // サーバ側
  socket.on('SEND_CALL', function() {
    socket.broadcast.emit('RECEIVE_CALL', { id: socket.id });
  })

  socket.on('SEND_OFFER', function(data) {
    console.info('SEND_OFFER', data)
    data.sdp.id = socket.id;
    socket.broadcast.emit('RECEIVE_OFFER', data.sdp)
  })

  socket.on('SEND_ANSWER', function(data) {
    console.info('SEND_ANSWER', data)
    data.sdp.id = socket.id;
    socket.to(data.target).emit('RECEIVE_ANSWER', data.sdp)
  })

  // Ice Candidateを配信する
  socket.on('SEND_CANDIDATE', function(data) {
    console.info('SEND_CANDIDATE', data)
    data.ice.id = socket.id;
    socket.to(data.target).emit('RECEIVE_CANDIDATE', data.ice)
  })
})

server.listen(3000)
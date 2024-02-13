// 参考文献: https://qiita.com/kotazuck/items/7ad1672c71aa38d6af6d
const express = require('express')
const fs = require('fs')
const https = require('https')
const { Server } = require('socket.io')
const ip = require('ip')

console.log(ip.address())

const app = express()
app.use(express.static(__dirname + '/public'))

const options = {
	key: fs.readFileSync('./localhost-key.pem'),
	cert: fs.readFileSync('./localhost.pem')
};
const server = https.createServer(options, app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

io.on('connect', socket => {
  socket.on('disconnect', () => {
    socket.broadcast.emit('RECEIVE_DISCONNECT')
  })

  socket.on('SEND_CALL', function() {
    socket.broadcast.emit('RECEIVE_CALL')
  })

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

server.listen(3000, '0.0.0.0')
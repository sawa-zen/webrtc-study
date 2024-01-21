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

  socket.emit('RECEIVE_CONNECTED', { id: socket.id })

  // サーバ側
  socket.on('SEND_ENTER', function(roomname) {
    socket.join(roomname);
    console.log('enter id=' + socket.id + ' enter room:' + roomname);
    socket.roomname = roomname;
  })

  socket.on('SEND_CALL', function() {
    console.log('call from:' + socket.id + ', room:' + socket.roomname);
    socket.broadcast
      .to(socket.roomname)
      .emit('RECEIVE_CALL', { id: socket.id });
  })

  // offerとanswerは SDP(SessionDescriptionProtocol)というプロトコルとして処理します
  socket.on('SEND_SDP', function(data) {
    console.info('SEND_SDP', data)
    data.sdp.id = socket.id;
    if (data.target) {
      socket.to(data.target).emit('RECEIVE_SDP', data.sdp)
    } else {
      socket.broadcast.emit('RECEIVE_SDP', data.sdp)
    }
  })

  // Ice Candidateを配信する
  socket.on('SEND_CANDIDATE', function(data) {
    console.info('SEND_CANDIDATE', data)
    if (data.target) {
      data.ice.id = socket.id;
      socket.to(data.target).emit('RECEIVE_CANDIDATE', data.ice)
    } else {
      console.log('candidate need target id')
    }
  })
})

server.listen(3000)
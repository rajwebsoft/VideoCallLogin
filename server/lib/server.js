const express = require('express');
const { createServer } = require('http');
const io = require('socket.io');
const haiku = require('./haiku');

const app = express();
const server = createServer(app);
const userIds = {};
const noop = () => { };
app.use('/', express.static(`${process.cwd()}/../client`));

const user_database = { 
  'raj': { password: '123', data:{ 'id': 1, 'name':'Raj Kumar' } },
  'abhishek': { password: 'abhishek', data:{ 'id': 2, 'name':'Abhishek Kumar'}  },
  'kumar': { password: 'kumar', data:{ 'id': 3, 'name':'Sanjay Kumar'} },
  'demo': { password: 'demo', data:{ 'id': 4, 'name':'Randhir Kumar' } }
}

const login_user_database = []
/**
 * Random ID until the ID is not in use
 */

function randomID(callback) {
  const id = haiku();
  if (id in userIds) { setTimeout(() => haiku(callback), 5); } else { callback(id); }
}

/**
 * Send data to friend
 */


function sendTo(to, done, fail) {
  const receiver = userIds[to];
  if (receiver) {
    const next = typeof done === 'function' ? done : noop;
    next(receiver);
  } else {
    const next = typeof fail === 'function' ? fail : noop;
    next();
  }
}


/**
 * Initialize when a connection is made
 * @param {SocketIO.Socket} socket
 */


function initSocket(socket) {
  let id;
  socket
    .on('init', (userinfo) => {

      randomID((_id) => { id = _id; userIds[id] = socket; socket.emit('init', { id });
      });
    })
    .on('request', (data) => {
      console.log('Request', data);
      sendTo(data.to, to => to.emit('request', { from: id }));
    })
    .on('call', (data) => {
      console.log('Call', data);
      sendTo(
        data.to,
        to => to.emit('call', { ...data, from: id }),
        () => socket.emit('failed')
      );
    })
    .on('end', (data) => {
      sendTo(data.to, to => to.emit('end'));
    })
    .on('userLogin', (data) => {
      //Login User allow for access
      if(user_database.hasOwnProperty(data.username) && user_database[data.username].password==data.password) {
        userIds[user_database[data.username].data.id]=socket;
        login_user_database.push(user_database[data.username].data);
        socket.broadcast.emit('friendLoginRes', login_user_database);
        socket.emit('friendLoginRes', login_user_database);
        //console.log(io.socket);
        socket.emit('userLoginRes', { status: 1, message: 'You have succesfull Login',info:user_database[data.username].data });
        socket.emit('init', { id: user_database[data.username].data.id });
      }else{
        socket.emit('userLoginRes', { status: 0, message: 'User and password failed' });
      }
      //End Login User
    })
    .on('disconnect', () => {
      delete userIds[id];
      login_user_database.splice(login_user_database.findIndex(v => v.id == id), 1);
      socket.broadcast.emit('friendLoginRes', login_user_database);
      console.log(id, 'disconnected');
    });
  return socket;
}

module.exports.run = (config) => {
  server.listen(config.PORT);
  console.log(`Server is listening at :${config.PORT}`);
  io.listen(server, { log: true })
    .on('connection', initSocket);
};

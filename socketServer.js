
const http = require('http');
const socketIo = require('socket.io');


const initSocketServer = (server) =>{

    const io = socketIo(server, {
        cors: {
          origin: '*',
        }
    });

    io.on("connection", (socket) => {
        console.log('A user is connected')
            //listen to new notification from the backend
        socket.on("new-notification", (notification) => {
            //Broadcast this notification data 
            io.emit("notification", notification )
        })


        socket.on("disconnect", () => {
            console.log('user disconnected')
        })
    })

    return io // return the io instance
}

module.exports = initSocketServer
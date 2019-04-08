module.exports = function(server){
    //get io object
    const io = require('socket.io')(server);

    //listen
    io.on('connection',(socket)=>{
        console.log('socketIO connected');

        //listen the sendMsg and receive the message from the client
        socket.on('sendMsg',(data)=>{
            console.log('from the client: ' , data);
       
        //send msg to the client
        io.emit('receiveMsg', data.name + '_' + data.date);
        console.log('to the client: ', data);
        })
    })
}
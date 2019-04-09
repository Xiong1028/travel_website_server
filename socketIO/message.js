module.exports = function(server){
 
    const io = require('socket.io')(server);

    //listen the connection to the client
    io.on('connection',function(socket){
        console.log('a client connect to the server')

        //receive the msg from client
        socket.on("sendMsg",function(data){
            console.log("from the client msg ",data);
            
            //handle the data
            data.name = data.name.toUpperCase();

            //send msg to the client. 
            //socket.emit() only send the msg to the specific client
            //io.emit() is broadcasting all the connected client
    
            socket.emit("returnMsg", data);
            console.log("return msg to the client",data);
        })
    })

}
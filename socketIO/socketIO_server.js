/** 
 *  SocketIO on Sever side to hanle chat msg 
 * 
*/
const {ChatModel} = require('../db/models');

module.exports = function(server){
 
    const io = require('socket.io')(server);

    //listen the connection to the client
    io.on('connection',function(socket){
        console.log('a client connect to the server')

        //receive the msg from client
        socket.on("sendMsg",function({from,to,content}){
            //save chat msg. when saving the data in mongodb, need an object of the model
            //prepare the chatMsg object
            const chat_id =[from,to].sort().join('_');
            const create_time = Date.now();
            new ChatModel({from, to, content,chat_id,create_time}).save((err,chatMsg)=>{
                
                //send msg back to all the clients connecting to the server
                io.emit("returnMsg",chatMsg);
            })

           
        })
    })
}
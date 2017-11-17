var http = require("http").createServer(handler);
var io = require("socket.io").listen(http);
var fs = require("fs");//variable for file system
var firmata = require("firmata");

var board = new firmata.Board("/dev/ttyACM0", function() { // ACM Abstract Control Model for serial communication with Arduino (could be USB)
    console.log("Loading Arduino");
    board.pinMode(2, board.MODES.OUTPUT); // direction of DC motor
     board.pinMode(13, board.MODES.OUTPUT);
    board.pinMode(3, board.MODES.PWM); // PWM of motor i.e. speed of rotation
    board.pinMode(4, board.MODES.OUTPUT); // direction DC motor
    board.digitalWrite(2,1); // initialization of digital pin 2 to rotate Left on start
    board.digitalWrite(4,0); // initialization of digital pin 2 to rotate Left on start
});

var timeout = false;
var last_value=0;
var last_sent=1;
function handler(req, res){
    fs.readFile(__dirname + "/example12.html",
    function (err, data) {
        if (err) {
            res.writeHead(500,{"Content-Type": "text/plain"});
            return res.end("Error loading HTML page.");
        }
        res.writeHead(200);
        res.end(data);
    });
    
}


http.listen(8080);// server will listen on port 8080

var sendValueViaSocket = function(){};

var pwm;
board.on("ready", function(){
    io.sockets.on("connection", function(socket){
        console.log("Socket id:"+socket.id);
 
        
       sendValueViaSocket = function(value) {
            io.sockets.emit("messageToClient", value);
        };
        
        
    socket.on("sendPWM", function(pwm){
        board.analogWrite(3,pwm);

        socket.emit("messageToClient", "PWM set to: " + pwm);
        console.log(pwm);
    });
    
    socket.on("left", function(value){
        board.digitalWrite(2,value.AIN1);
        board.digitalWrite(4,value.AIN2);
        board.digitalWrite(13, board.HIGH);
        socket.emit("messageToClient", "Direction: left");
        console.log("left");
    });
    
    socket.on("right", function(value){
        board.digitalWrite(2,value.AIN1);
        board.digitalWrite(4,value.AIN2);
        socket.emit("messageToClient", "Direction: right");
    });
    
   socket.on("stop", function(value){
        board.analogWrite(3,value);
        socket.emit("messageToClient", "STOP");
    });
        
    });// end of sockets.on connection
    
    




});// end of board.on ready
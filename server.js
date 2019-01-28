const express = require('express')
const path = require('path')

const app = express()
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use('/', (req, res) => {
	res.sender('index.html');
})

const WIDTH = 800
let turn = [];
let clients = []

io.on('connection', socket => {
	clients.push(socket)
	console.log('Socket Connectado' + socket.id)

	socket.on('sendPosition', data => {
		let player = data
		//console.log(data)
		turn.push(player)
		socket.broadcast.emit('position', data);
		if(turn.length === 2){
			console.log(turn)
			
		}
	})

	socket.on('shot', data => {
		var bullets = data;
		turn.forEach(players => {
			if(bullets.x + bullets.w > players.x && 
				bullets.x < players.x + players.w &&
				bullets.y + bullets.h > players.y &&
				bullets.y < players.y + players.h){
					if(players.name !== bullets.name){
						bullets.shooting = false;
						players.hp -= Math.floor(Math.random() * 11 + 1);
						socket.broadcast.emit('position', players);
					}
			}
		})
		socket.broadcast.emit('bullets', data);
	})

	socket.on('disconnect', () => {
		console.log(`${socket.id} disconnecting`)
		var i = clients.indexOf(socket);
		clients.splice(i, 1);
	})
})

server.listen(3000);
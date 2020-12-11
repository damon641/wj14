var Sys = require('../../../../Boot/Sys');

module.exports = {
	
	roomInfo: async function (socket, data){
		try {
			let room = await Sys.Game.Sng.Texas.Services.RoomServices.get(data.roomId);
			if (!room || room.length == 0) {
				return {
					status: 'fail',
					result: null,
					message: "Table not found",
					statusCode: 404
				};
			}
			let result = {
				"id": room.id,
				"tableNumber": room.tableNumber,
				"name": room.name,
				"smallBlind": parseInt(room.smallBlind),
				"bigBlind": parseInt(room.bigBlind),
				"minPlayers": parseInt(room.minPlayers),
				"maxPlayers": parseInt(room.maxPlayers),
				"minBuyIn": parseInt(room.minBuyIn),
				"maxBuyIn": parseInt(room.maxBuyIn),
				"type": room.type,
				"gameLimit": room.gameLimit,
				"joinedPlayer": []
			}
			room.players.forEach(function (player) {
				if (player.status != 'Left') {
					result.joinedPlayer.push(player.id)
				}
			});
			return {
				status: 'success',
				message: "table detail",
				result: result
			};
		}
		catch (e) {
			console.log("Error in roomInfo : ", e);
			return new Error(e);
		}
	},

	subscribeRoom: async function (socket, data){
		try {

			let room123 = await Sys.Game.Sng.Texas.Services.RoomServices.get(data.roomId);
			var player = await Sys.Game.Sng.Texas.Services.PlayerServices.getById(data.playerId);
			let room = await Sys.Game.Sng.Texas.Controllers.RoomProcess.checkRoomSeatAvilability(data);
			if (!room || room == undefined) {
				return {
					status: 'fail',
					result: null,
					message: "Data not found",
					statusCode: 404
				};
			}
			socket.join(room.id); // Subscribe Room.
			let result = {}
			if (room.game && room.game.status == 'Running') {
				result.history = room.game.history
				result.currentRound = room.game.roundName
				result.cards = room.game.board
				result.potAmount = room.game.pot
			} else {
				result.history = []
				result.currentRound = ''
				result.cards = []
				result.potAmount = 0
			}
			socket.myData = {};

			room = await Sys.Game.Sng.Texas.Controllers.RoomProcess.broadcastPlayerInfo(room);


			// 
			let minBuyIn = 0;
			let maxBuyIn = 0;
			//console.log("Limit Type : ",room.limit);
			if(room.limit == 'limit'){
				// Limit Game
				minBuyIn = parseInt(parseInt(room.bigBlind) * 10); // minimun Buy in Amount 
				maxBuyIn = 0; // No Limit in Max Buyin Game.
			}else if(room.limit == 'no_limit'){
				// No Limit
				minBuyIn = parseInt(parseInt(room.smallBlind) * 40);
				maxBuyIn = parseInt(parseInt(room.bigBlind) * 200);
			}else{
				// Pot Limit
				minBuyIn = parseInt(parseInt(room.smallBlind) * 40);
				maxBuyIn = parseInt(parseInt(room.bigBlind) * 200);
			}

			// Check Player Chips Here.
			 if(player.chips < minBuyIn){
				return {
					status: 'fail',
					result: null,
					message: 'Player Have Low Chips'
				};
			 }
	

			 console.log("room.limit :",room.limit)
		
			// End
			return {
				status: 'success',
				result: {
					roomId : room.id,
					tableNumber : room.tableNumber,
					gameHistory: result,
					turnTime: parseInt(Sys.Config.Texas.RegularTimer),
					limitType : room.limit,
					minBuyIn : minBuyIn,
					maxBuyIn : maxBuyIn,
					smallBlindChips: parseInt(room.smallBlind),
					bigBlindChips: parseInt(room.bigBlind),
				},
				message: 'Player subscribed successfuly.'
			};
		}
		catch (e) {
			console.log("Error in subscribeRoom : ", e);
			return new Error(e);
		}
	},


	reconnectGame: async function (socket, data){
		try {
			console.log("reconnectGame Room is called");
			var player = await Sys.Game.Sng.Texas.Services.PlayerServices.getById(data.playerId);
			let room = await Sys.Game.Sng.Texas.Services.RoomServices.get(data.roomId);
			if (!room) {
				return {status: 'fail',	result: null,	message: "Room not found",statusCode: 401	};
			}


			
			// Check Player Found!
			let playerFound = false;
			for(let i=0; i< room.players.length; i++){
				if(room.players[i].id == data.playerId && room.players[i].status != 'Left'){
					playerFound = true;
				}
			}

			if(!playerFound){
				return {
					status: 'fail',
					result: null,
					message: 'Opps Game Not Running!'
				};
			}


			socket.join(room.id); // Subscribe Room.
			let result = {}
			if (room.game && room.game.status == 'Running') {
				result.history = room.game.history
				result.currentRound = room.game.roundName
				result.cards = room.game.board
				result.potAmount = room.game.pot
			} else {
				result.history = []
				result.currentRound = ''
				result.cards = []
				result.potAmount = 0
			}
			socket.myData = {};


			console.log("Reconnect Game ........ Reset Game ContentBrodcast Send.")
			await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(socket.id).emit('ResetGame', {});


			room = await Sys.Game.Sng.Texas.Controllers.RoomProcess.broadcastPlayerInfo(room);

			if(room.game){
				var data = {
					players: [],
					smallBlindPlayerId: room.getSmallBliendPlayer().id,
					bigBlindPlayerId: room.getBigBliendPlayer().id,
					dealerPlayerId: room.getDealer().id,
					smallBlindChips: parseInt(room.smallBlind),
					bigBlindChips: parseInt(room.bigBlind),
				}
				room.players.forEach(function (player) {
					data.players.push({
						playerId: player.id,
						cards: player.cards
						 
					})
				});
				console.log("Player Cards subscripbe");
				await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(socket.id).emit('PlayerCards', data)
			}


			// 
			let minBuyIn = 0;
			let maxBuyIn = 0;
			//console.log("Limit Type : ",room.limit);
			if(room.limit == 'limit'){
				// Limit Game
				minBuyIn = parseInt(parseInt(room.bigBlind) * 10); // minimun Buy in Amount 
				maxBuyIn = 0; // No Limit in Max Buyin Game.
			}else if(room.limit == 'no_limit'){
				// No Limit
				minBuyIn = parseInt(parseInt(room.smallBlind) * 40);
				maxBuyIn = parseInt(parseInt(room.bigBlind) * 200);
			}else{
				// Pot Limit
				minBuyIn = parseInt(parseInt(room.smallBlind) * 40);
				maxBuyIn = parseInt(parseInt(room.bigBlind) * 200);
			}

		

			 console.log("room.limit :",room.limit)
		
			// End
			return {
				status: 'success',
				result: {
					roomId : room.id,
					tableNumber : room.tableNumber,
					gameHistory: result,
					turnTime: parseInt(Sys.Config.Texas.RegularTimer),
					limitType : room.limit,
					minBuyIn : minBuyIn,
					maxBuyIn : maxBuyIn,
					smallBlindChips: parseInt(room.smallBlind),
					bigBlindChips: parseInt(room.bigBlind),
				},
				message: 'Player subscribed successfuly.'
			};
		}
		catch (e) {
			console.log("Error in subscribeRoom : ", e);
			return new Error(e);
		}
	},

	unSubscribeRoom: async function (socket, data) {
		try {
			console.log("unSubscribeRoom data : ", socket.id, data);
			socket.leave(data.roomId);
			return {
				status: 'success',
				message: 'Player unsubscribed successfuly.',
				result: null
			};
		}
		catch (e) {
			console.log("Error in unSubscribeRoom : ", e);
			return new Error(e);
		}
	},

	joinRoom: async function (socket, data){
		try {
			var player = await Sys.Game.Sng.Texas.Services.PlayerServices.getById(data.playerId);
			data.socketId = player.socketId;
			//Shiv!@# Add PlAYER check

			if (player.chips < data.chips) {
				return {
					status: 'fail',
					message: 'Insufficient chips.'
				};
			}
			var room = null;
			room = await Sys.Game.Sng.Texas.Controllers.RoomProcess.joinRoom(player, data);
			if(room instanceof Error){
				return { status: 'fail', result: null, message: room.message, statusCode: 401 }
			}
		 
			// Add roomID and playerID to Player Socket Data
			socket.myData.playerID = data.playerId;
			socket.myData.roomID = room.id;
			socket.myData.gameType = 'texas';
			console.log("Socket While join room : ", socket.id, socket.myData);

			return {
				status: 'success',
				message: "Player Room Joind successfuly.",
				result: {
					roomId: room.id,
					turnTime: parseInt(parseInt(Sys.Config.Texas.Regular) / 1000)
				}
			};
		}
		catch (error) {
			console.log('Error in JoinRoom : ', error);
			return new Error('Error in JoinRoom', error);
		}
	},

	leaveRoom: async function (socket, data) {
		try {
			let responce = await Sys.Game.Sng.Texas.Controllers.RoomProcess.leftRoom(data);

			if(!responce){
				return { status: 'fail', result: null, message: "Something Went Wrong", statusCode: 401 }
			}

			if(responce instanceof Error){
				return { status: 'fail', result: null, message: room.message, statusCode: 401 }
			}

			if(responce.status == 'success'){
				socket.leave(data.roomId); // Unsubsribe
				return {
					status: 'success',
					message: 'Player Leave successfuly.',
					result: null
				};
			}
			else{
				return {
					status: 'success',
					message: responce.message,
					result: null
				};
			}
		}
		catch (e) {
			console.log("Error in leaveRoom : ", e);
			return new Error(e);
		}
	},

	sitOutNextHand: async function (socket, data){
		try {
			let responce = await Sys.Game.Sng.Texas.Controllers.RoomProcess.sitOutNextHand(data);
			return { status: 'success', result: null, message: responce.message, statusCode: 200 }
		}
		catch (e) {
			console.log('Error in JoinRoom : ', e);
			return new Error(e);
		}
	},

	sitOutNextBigBlind: async function (socket, data){
		try {
			let responce = await Sys.Game.Sng.Texas.Controllers.RoomProcess.sitOutNextBigBlind(data);
			return { status: 'success', result: null, message: responce.message, statusCode: 200 }
		}
		catch (e) {
			console.log('Error in JoinRoom : ', e);
			return new Error(e);
		}
	},

}

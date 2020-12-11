var Sys = require('../../../../Boot/Sys');
const rolesArray = ['admin','master','agent','childAgent'];

module.exports = {

	checkRoomSeatAvilability: async function (socket,data) {
		try {
			let self = this
			let room = await Sys.Game.Sng.Texas.Services.RoomServices.get(data.roomId);
			if (!room) {
				return {
					status: 'fail',
					result: null,
					message: "Room not found",
					statusCode: 401
				};
			}
			for(let i=0; i < room.players.length; i++){
				if(room.players[i].id == data.playerId){
					room.players[i].socketId = socket.id; // Update Socket Id if Old Player Found!.
				}
			}

			return room;

		} catch (e) {
			console.log("Error: ", e);
		}
	},

	joinRoom: async function (player, data) {
		try {
			let self = this
			var room = await Sys.Game.Sng.Texas.Services.RoomServices.get(data.roomId);
			if (!room || !room.players) { // //Shiv!@#
				return {
					status: 'fail',
					result: null,
					message: "Room not found",
					statusCode: 401
				};
			}
			console.log("Room Obtained");

			//check if player alredy in array
			let oldPlayer = null;
			if (room.players.length > 0) {
				for (let i = 0; i < room.players.length; i++) {
					if (room.players[i].id == player.id && room.players[i].status == 'Left') { // && room.players[i].status == 'Left' Remove by Me
						oldPlayer = room.players[i]
						break;
					}
				}
			}
			console.log("Old Player Calculated")

			// chek seat in players array
			let seatAvailable = true;
			if (room.players.length > 0) {
				for (let i = 0; i < room.players.length; i++) {
					if (room.players[i].seatIndex == data.seatIndex && room.players[i].status != 'Left' && room.players[i].status != 'Ideal' ) {
						seatAvailable = false
						break;
					}
				}
			}
			console.log("------------------------------------------------------------")
			console.log("----------seatAvailable :",seatAvailable)
			console.log("----------profilePicId :", parseFloat(player.profilePic))
			console.log("------------------------------------------------------------")

			// if seat is available add player
			if (seatAvailable) {
				let chips = parseFloat(player.chips) - parseFloat(data.chips); // Shiv!@#
				if (oldPlayer) {
					console.log("Old Player Found")
					oldPlayer.chips = data.chips;
					oldPlayer.socketId = data.socketId;
					oldPlayer.seatIndex = data.seatIndex;
					oldPlayer.autoBuyin = data.autoBuyin;
					oldPlayer.avatar = parseFloat(player.profilePic);
					oldPlayer.status = 'Waiting';
					oldPlayer.sitOutNextHand = false;
					oldPlayer.sitOutNextBigBlind = false;
					oldPlayer.folded = false;
					oldPlayer.allIn = false;
					oldPlayer.talked = false;
					oldPlayer.defaultActionCount = 0;
					oldPlayer.idealTime = null;

					oldPlayer.isFold = false;
					oldPlayer.isCheck = false;
					oldPlayer.isCall = false;
	
				}else{
					//console.log("Added Player ->>>>>>>>>>.");
					await room.AddPlayer(player.id, data.socketId, player.username, parseFloat(player.profilePic), 0, data.chips, data.seatIndex, data.autoBuyin, player.isIdeal);
				}


				room = await Sys.Game.Sng.Texas.Services.RoomServices.update(room);
				console.log("Room Updated");
				let playerUpdate = await Sys.Game.Sng.Texas.Services.PlayerServices.update(player.id, { chips: chips });
				//Shiv!@#
				// Add Player Chips Transection Here.


				console.log("Player Updated",room.players.length);
				if (room.players.length > 0) {

					room  =  await Sys.Game.Sng.Texas.Controllers.RoomProcess.broadcastPlayerInfo(room);

					// Game Start
					let totalPlayers = 0
					room.players.forEach(function (player) {
						if (player.status != 'Left' && player.status != 'Ideal') {
							totalPlayers += 1;
						}
					})
					console.log('Player Length ->>>>>', totalPlayers);
					console.log('Status :: ', room.status)
					console.log('room.timerStart :: ', room.timerStart)
					// console.log('Minimum Player', room.minPlayers)
					if (room.status != 'Running' && totalPlayers >= room.minPlayers) {
						if (room.game == null && room.timerStart == false) {
							room.timerStart = true; // When 12 Second Countdown Start.
							room = await Sys.Game.Sng.Texas.Services.RoomServices.update(room);
							await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('OnGameStartWait',{roomId: room.id})
							console.log('Game object not present 2');
							Sys.Timers[room.id] = setTimeout(function () {
								room.timerStart = false; // Reset Timer Variable
								clearTimeout(Sys.Timers[room.id]); // Clear Room Timer
								console.log("Game Starting....");

								totalPlayers = 0;
								for (i = 0; i < room.players.length; i++) {
									if(room.players[i].status != 'Left' && room.players[i].status != 'Ideal'){
										totalPlayers++;
									}
								}
								console.log('<===============================>');
								console.log('<=> Game Starting [] New <=>',totalPlayers);
								console.log('<===============================>');
								if(totalPlayers == room.maxPlayers){
									room.StartGame();
								}else{
									console.log('<=> Some Player Leave So not Start Game. <=>',totalPlayers);
								}

							}, Sys.Config.Texas.waitBeforeGameStart)
						}
					}
					return room;
				}

			} else {
				console.log('Seat is not available.');
				return new Error('Seat is not available');
			}
		} catch (error) {
			Sys.Log.info('Error in JoinRoom : ' + error);
			return new Error('Error in JoinRoom Process',error);
		}
	}, 

	/*leftRoom: async function (data) {
		try {
			console.log("LeftRoom Data", data);
			if (!data.roomId) {
				return {status: 'fail',	result: null,	message: "Room Not Found",	statusCode: 401 };
			}
			var room = await Sys.Game.Sng.Texas.Services.RoomServices.get(data.roomId);
			if (!room) {
				return { status: 'fail',	result: null,	message: "Room Not Found", statusCode: 401 };
			}

			//check for user already present //
			// chek seat in players array
			let player = null;
			let isAllinPlayerWhenLefted = false;
			let leftedPlayerIndexId;
			if (room && room.players && room.players.length > 0) {
				for (let i = 0; i < room.players.length; i++) {

					if (room.players[i].id == data.playerId && room.players[i].status != 'Left') {
						await Sys.Game.Sng.Texas.Services.playerGameHistoryServices.updatePlayerStatus(room.players[i].id,'Finished');
						room.gameLosers.push(room.players[i]);
						player = room.players[i];
						room.players[i].status = "Left";
						room.players[i].idealTime = null;
						if(room.players[i].allIn == true){
							isAllinPlayerWhenLefted = true;
						}
						leftedPlayerIndexId = i;
						break;
					}
				}
			}
			if (player) {

				let playersCount = 0;
				if (room.game && room.game.status == 'Running') {
					let	totalPlayingPlayers = 0;
					for (i = 0; i < room.players.length; i++) {
						if(room.players[i].status == 'Playing' && room.players[i].folded == false){ 
							totalPlayingPlayers++;
						}
					}
					console.log("totalplayers", totalPlayingPlayers)
					if(  player.folded === false ){
						if(totalPlayingPlayers <= 1){
							clearTimeout(Sys.Timers[room.id]);
							room.removePlayer(player.id);
							
						}else{
							room.removePlayer(player.id);
						}
					}
					
					
				}
				
				await Sys.Game.Sng.Texas.Services.RoomServices.update(room);
				console.log("Player Left ", player.id);
				await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('PlayerLeft', { 'playerId': player.id, roomId: room.id });
				let dataPlayer = await Sys.Game.Sng.Texas.Services.PlayerServices.getById(player.id);
				if (dataPlayer) {
					//	console.log("Chips",dataPlayer.chips,player.chips);
					//let chips = parseFloat(dataPlayer.chips) + parseFloat(player.chips) + parseFloat(player.extraChips);
					//var playerUpdate = await Sys.Game.Sng.Texas.Services.PlayerServices.update(player.id, { chips: chips });
					return {status: 'success',result: room.id,message: "Room Left Sccess",statusCode: 200};
				} else {
					return {	status: 'fail',	result: null,	message: "Player not found",statusCode: 401	};
				}
			} else {
				console.log(" No Player Found -----#### ");
				return {status: 'fail',	result: null,message: "Player not found",statusCode: 401};
			}
		} catch (error) {
			console.log("Error:", error);
			return new Error("Error in Left Room");
		}
	},*/

	newRoundStarted: async function (room) {
		try {
			console.log("New round Started");
			// console.log("Room game======>", room.game);
			var room = await Sys.Game.Sng.Texas.Services.RoomServices.update(room)
			if (!room) {
				return {
					status: 'fail',
					result: null,
					message: "Room not found",
					statusCode: 401
				};
			}

			// Send Game Boot Data.

			let bootGameData = {
				smallBlindPlayerId: room.getSmallBliendPlayer().id,
				smallBlindChips: parseFloat(room.game.bets[room.smallBlindIndex]),
				smallBlindPlayerChips : parseFloat(room.getSmallBliendPlayer().chips),
				bigBlindPlayerId: room.getBigBliendPlayer().id,
				bigBlindChips:parseFloat(room.game.bets[room.bigBlindIndex]),
				bigBlindPlayerChips : parseFloat(room.getBigBliendPlayer().chips),
				dealerPlayerId: room.getDealer().id,
				roomId: room.id,
				totalTablePotAmount: + parseFloat( room.game.bets.reduce((partial_sum, a) => partial_sum + a) + room.game.pot ).toFixed(4),
				
			}
			await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('OnGameBoot', bootGameData);

			Sys.Timers[room.id] = setTimeout(async function (room) {
				// Event for Cards Distribution.
				let playersCards = [];
				for(let i=0; i < room.players.length; i++){
					console.log("Status  :-",room.players[i].status);
					console.log("Name  :-",room.players[i].playerName);

					if(room.players[i].status == 'Playing' ){
						playersCards.push({
							playerId : room.players[i].id,
							cards : ['BC','BC']
						});
					}
				}
				await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('OnPlayersCardsDistribution', { playersCards : playersCards, roomId: room.id })
				let flipAnimation = true;
				Sys.Timers[room.id] = setTimeout(async function (room) {
					// Send Player Cards in his Socket.
					for(let i=0; i < room.players.length; i++){
						if(room.players[i].status == 'Playing'){
							await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to([room.players[i].socketId]).emit('OnPlayerCards',{
								playerId : room.players[i].id,
								cards : room.players[i].cards,
								roomId: room.id,
								flipAnimation: flipAnimation
							})
						}
						
					}


					let timer = parseFloat(Sys.Config.Texas.RegularTimer);
					let buttonAction = room.getCurrentTurnButtonAction();
					console.log(buttonAction);
					let totalPlayingPlayers = 0;
					for (i = 0; i < room.players.length; i++) {
						if(room.players[i].status == 'Playing' && room.players[i].folded == false){
							totalPlayingPlayers++;
						}
					}
					let tempCurrentPlayer = room.currentPlayer;
					if(totalPlayingPlayers == 2 &&  await Sys.Game.Sng.Texas.Controllers.PlayerProcess.checkForEndOfRound(room) === true  ){	
						Sys.Timers[room.id] = setTimeout(async function (room) {
							console.log("Player Timer Send 4 when two players and forcefinsihallin: ", room.game.gameNumber);
							await Sys.Game.Sng.Texas.Controllers.PlayerProcess.progress(room);		
							
						}, 1000, room);
						
						return false;
					}else{
						room.currentPlayer = tempCurrentPlayer;
					}

					if(totalPlayingPlayers > 1){
						if(room.getCurrentPlayer().isIdeal == true){
							Sys.Timers[room.id] = setTimeout(async function (room) {
								Sys.Timers[room.id] = setInterval(async function (room) {
									console.log("Player Timer Send 1 : ", timer, room.game.gameNumber);
									if(room.getCurrentPlayer().isIdeal == true){
										clearTimeout(Sys.Timers[room.id]); // Clear Turn Timer
										clearInterval(Sys.Timers[room.id]);
										room.players[room.currentPlayer].isAlreadyActed = true;
										Sys.Game.Sng.Texas.Controllers.RoomProcess.playerDefaultAction(room.id);
									}else{

										timer--;
										if (timer < 0) {
											clearTimeout(Sys.Timers[room.id]); // Clear Turn Timer
											clearInterval(Sys.Timers[room.id]);
											room.players[room.currentPlayer].isAlreadyActed = true;
											console.log("room players in newRoundStarted", room.players); 
											Sys.Game.Sng.Texas.Controllers.RoomProcess.playerDefaultAction(room.id);
										}else{
											await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('OnTurnTimer', {
												playerId: room.getCurrentPlayer().id,
												timer: timer,
												maxTimer: parseFloat(Sys.Config.Texas.RegularTimer),
												buttonAction: buttonAction,
												roomId: room.id,
												isLimitGame : (room.limit == 'limit') ?  true : false
											});
										}

									}
									
								}, 1000, room);
							}, (500), room);
						}else{
							Sys.Timers[room.id] = setInterval(async function (room) {
								console.log("Player Timer Send 1 : ", timer, room.game.gameNumber);

								timer--;
								if (timer < 0) {
									clearTimeout(Sys.Timers[room.id]); // Clear Turn Timer
									clearInterval(Sys.Timers[room.id]);
									room.players[room.currentPlayer].isAlreadyActed = true;
									console.log("room players in newRoundStarted", room.players); 
									Sys.Game.Sng.Texas.Controllers.RoomProcess.playerDefaultAction(room.id);
								}else{
									await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('OnTurnTimer', {
										playerId: room.getCurrentPlayer().id,
										timer: timer,
										maxTimer: parseFloat(Sys.Config.Texas.RegularTimer),
										buttonAction: buttonAction,
										roomId: room.id,
										isLimitGame : (room.limit == 'limit') ?  true : false
									});
								}
								
							}, 1000, room);
						}
						
					}
					
				}, (250) , room);  // open players cards quickly
				//}, (500 * room.players.length) , room);
			}, (1000 * parseFloat(Sys.Config.Texas.waitBeforeCardDistribut)), room);

			return
		} catch (e) {
			console.log("Error:", e);
		}
	},

	newGameStarted: async function (room) {
		try {
			console.log("Game Started Brodcast");
			await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('GameStarted', {
				message: 'starting first round',
				gameId: room.game.id,
				gameNumber: `${room.tableNumber} ${room.game.gameNumber}`,
				roomId: room.id
			});
		} catch (e) {
			console.log("Error:", e);
		}
	},

	playerUpdateAutoBuyIn: async function (data) {
		try {

			let room = await Sys.Game.Sng.Texas.Services.RoomServices.get(data.roomId);
			if (!room) {
				return {
					status: 'fail',
					result: null,
					message: "Player not found",
					statusCode: 401
				};
			}
			var currentPlayer = room.getPlayerById(data.playerId)
			if (!currentPlayer) {
				return {
					status: 'fail',
					result: null,
					message: "Player not in table",
					statusCode: 401
				};
			}
			currentPlayer.autoBuyin = data.autoBuyin
			room = await Sys.Game.Sng.Texas.Services.RoomServices.update(room);
			return {};
		} catch (e) {
			console.log("Error:", e);
		}
	},

	playerAction: async function (data) {
		try {
			let room = await Sys.Game.Sng.Texas.Services.RoomServices.get(data.roomId);
			if (!room) {
				return {
					status: 'fail',
					result: null,
					message: "Room not found",
					statusCode: 401
				};
			}

			var currentPlayer = room.getCurrentPlayer();console.log("currentPlayer.isAlreadyActed", currentPlayer.isAlreadyActed);
			if ( ( currentPlayer && (currentPlayer.id != data.playerId) ) || ( currentPlayer.isAlreadyActed == true ) ) {
				return console.log('Its not your turn or your turn expired');
			}
			if (room.game.status == 'Running') {
				currentPlayer.defaultActionCount = 0;
				currentPlayer.idealTime = null;
				
				clearTimeout(Sys.Timers[room.id]);
				clearInterval(Sys.Timers[room.id]);
				currentPlayer.isAlreadyActed = true;
				switch (data.action) {
					case Sys.Config.Texas.Check:
						if (room.check(data.playerId, data.hasRaised)) {
							return currentPlayer.turnBet;
						} else {
							return console.log('This is not your turn');
						}
						break
					case Sys.Config.Texas.Fold:
						if (room.fold(data.playerId, data.hasRaised)) {
							return currentPlayer.turnBet;
						} else {
							return console.log('This is not your turn');
						}
						break
					case Sys.Config.Texas.Call:
						if (room.call(data.playerId, data.hasRaised)) {
							return currentPlayer.turnBet;
						} else {
							return console.log('This is not your turn');
						}
						break
					case Sys.Config.Texas.Bet:
						if (room.bet(data.playerId, data.betAmount, data.hasRaised)) {
							return currentPlayer.turnBet;
						} else {
							return console.log('This is not your turn');
						}
						break
					case Sys.Config.Texas.AllIn:
						if (room.AllIn(data.playerId, data.hasRaised)) {
							return currentPlayer.turnBet;
						} else {
							return console.log('This is not your turn');
						}
						break
					default:
						return console.log('Selected action not found');
				}
			} else {
				return console.log('Game is not running');
			}
		}
		catch (e) {
			console.log("Error in playerAction :", e);
			return new Error(e);
		}
	},

	turnFinished: async function (room) {
		try {
			for (let i = 0; i < room.players.length; i++) {
				room.players[i].isAlreadyActed =false;
			}

			clearTimeout(Sys.Timers[room.id]);
			clearInterval(Sys.Timers[room.id]);
			room = await Sys.Game.Sng.Texas.Services.RoomServices.update(room);
			console.log('TurnFinished', Sys.Config.Texas.Regular, room.game.gameNumber)
			if (room.getCurrentPlayer()) {
				let turnBetData = room.getPreviousPlayerAction();
				await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('PlayerAction', {
					action: turnBetData,
					roomId: room.id,
					playerBuyIn: (turnBetData.playerId) ? parseFloat( room.getPlayerById(turnBetData.playerId).chips ) : 0,
					totalTablePotAmount: + parseFloat( room.game.bets.reduce((partial_sum, a) => partial_sum + a) + room.game.pot ).toFixed(4),
				});
				// reset prebet options
				for (let p = 0; p < room.players.length; p++) {
					if (room.players[p].id == turnBetData.playerId) {
						room.players[p].isCheck = false;
						room.players[p].isFold = false;
						room.players[p].isCall = false;
					}
				}
				// await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('NextTurnPlayer', {
				// 	nextTurnPlayerId: room.getCurrentPlayer().id
				// });

				let timer = parseFloat(Sys.Config.Texas.RegularTimer);
				let buttonAction = room.getCurrentTurnButtonAction();
				//console.log(buttonAction);

				let totalPlayingPlayers = 0;
				for (i = 0; i < room.players.length; i++) {
					if(room.players[i].status == 'Playing' && room.players[i].folded == false){
						totalPlayingPlayers++;
					}
				}
				console.log("totalplaying players", totalPlayingPlayers, room.players, room.game.gameNumber)
				if(totalPlayingPlayers > 1){
					Sys.Timers[room.id] = setInterval(async function (room) {
						console.log("Player Timer Send 2 : ", timer, room.game.gameNumber);
						if(room.getCurrentPlayer().isIdeal == true){
							clearTimeout(Sys.Timers[room.id]); // Clear Turn Timer
							clearInterval(Sys.Timers[room.id]);
							room.players[room.currentPlayer].isAlreadyActed = true;
							Sys.Game.Sng.Texas.Controllers.RoomProcess.playerDefaultAction(room.id);
						}else{

							timer--;
							// For Player Default Action
							let maxBet = parseFloat(room.getMaxBet(room.game.bets));
							let yourBet = parseFloat(room.game.bets[room.currentPlayer]);
							let playerChips = parseFloat(room.players[room.currentPlayer].chips);

							if (timer < 0) {
								clearTimeout(Sys.Timers[room.id]); // Clear Turn Timer
								clearInterval(Sys.Timers[room.id]);
								room.players[room.currentPlayer].isAlreadyActed = true;
								console.log("room players in turnFinished 2", room.players); 
								Sys.Game.Sng.Texas.Controllers.RoomProcess.playerDefaultAction(room.id);
							}else if(room.getCurrentPlayer().isCheck == true){
								if (maxBet == yourBet) {
									//room.check(room.getCurrentPlayer().id);
									Sys.Game.Sng.Texas.Controllers.RoomProcess.playerAction({
										playerId: room.getCurrentPlayer().id,
									  	betAmount: 0,
									  	action: 2,
									  	roomId: room.id,
									  	hasRaised: false,
									  	productName: 'Byte Poker'
									});
								} else {
									//room.fold(room.getCurrentPlayer().id);
									Sys.Game.Sng.Texas.Controllers.RoomProcess.playerAction({
										playerId: room.getCurrentPlayer().id,
									  	betAmount: 0,
									  	action: 6,
									  	roomId: room.id,
									  	hasRaised: false,
									  	productName: 'Byte Poker'
									});
								}
							}else if(room.getCurrentPlayer().isCall == true){
								if (parseFloat(maxBet - yourBet) == 0) {
									//room.check(room.getCurrentPlayer().id);
									Sys.Game.Sng.Texas.Controllers.RoomProcess.playerAction({
										playerId: room.getCurrentPlayer().id,
									  	betAmount: 0,
									  	action: 2,
									  	roomId: room.id,
									  	hasRaised: false,
									  	productName: 'Byte Poker'
									});
								}
								else if (playerChips <= parseFloat(maxBet - yourBet)) {
									//room.AllIn(room.getCurrentPlayer().id, false);
									Sys.Game.Sng.Texas.Controllers.RoomProcess.playerAction({
										playerId: room.getCurrentPlayer().id,
									  	betAmount: playerChips,
									  	action: 8,
									  	roomId: room.id,
									  	hasRaised: false,
									  	productName: 'Byte Poker'
									});
								} else {
									//room.call(room.getCurrentPlayer().id, false);
									Sys.Game.Sng.Texas.Controllers.RoomProcess.playerAction({
										playerId: room.getCurrentPlayer().id,
									  	betAmount: (maxBet - yourBet),
									  	action: 4,
									  	roomId: room.id,
									  	hasRaised: false,
									  	productName: 'Byte Poker'
									});
								}
							}else if(room.getCurrentPlayer().isFold == true){
								//room.fold(room.getCurrentPlayer().id);
								Sys.Game.Sng.Texas.Controllers.RoomProcess.playerAction({
									playerId: room.getCurrentPlayer().id,
								  	betAmount: 0,
								  	action: 6,
								  	roomId: room.id,
								  	hasRaised: false,
								  	productName: 'Byte Poker'
								});
							}else{
								await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('OnTurnTimer', {
									playerId: room.getCurrentPlayer().id,
									timer: timer,
									roomId: room.id,
									maxTimer: parseFloat(Sys.Config.Texas.RegularTimer),
									buttonAction: buttonAction,
									defaultButtons: room.getDefaultButtons(),
									isLimitGame : (room.limit == 'limit') ?  true : false
								});
							}

						}
						
					}, 1000, room);
				}	
			}
		} catch (e) {
			console.log("Error:", e);
		}
	},

	roundFinished: async function (room, sidePot) {
		try {
			console.log('<=> Round Finished ||  Texas GAME-NUMBER ['+room.game.gameNumber+'] || Player SidePot : ' , sidePot);
			room.timerStart = false;
			clearTimeout(Sys.Timers[room.id]);
			clearInterval(Sys.Timers[room.id]);
			for (let i = 0; i < room.players.length; i++) {
				room.players[i].isAlreadyActed =false;
			}
			console.log("Room Game POT :", room.game.pot, room.game.gameNumber);
			console.log("Room Game bets :", room.game.roundBets, room.game.gameNumber);
			room = await Sys.Game.Sng.Texas.Services.RoomServices.update(room);
			console.log("round finished main pot", room.game.bets.reduce((partial_sum, a) => partial_sum + a))
			room.betCounter = 0;
			room.allInInLimit = false;
			console.log("betCounter",room.betCounter)
			let turnBetData = room.getPreviousPlayerAction();
			await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('PlayerAction', {
				action: turnBetData,
				roomId: room.id,
				playerBuyIn: (turnBetData.playerId) ? parseFloat( room.getPlayerById(turnBetData.playerId).chips ) : 0,
				totalTablePotAmount: room.game.pot
			});
			console.log("roundfinished Roundcomplete broadcast", room.game.pot, room.game.gameMainPot, sidePot)
			// reset prebet options
			for (let p = 0; p < room.players.length; p++) {
				if (room.players[p].id == turnBetData.playerId) {
					room.players[p].isCheck = false;
					room.players[p].isFold = false;
					room.players[p].isCall = false;
				}
			}
			Sys.Timers[room.id] = setTimeout(async function (room) {
				await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('RoundComplete', {
					roundStarted: room.game.roundName,
					cards: room.game.board,
					potAmount: room.game.pot,
					PlayerSidePot : {
						sidePot : sidePot,
						mainPot : +(room.game.gameMainPot).toFixed(2)
					},
					roomId: room.id,
				});

				for (let h = 0; h < room.game.gameRevertPoint.length; h += 1) {
					if (room.game.gameRevertPoint[h].amount > 0) {
						let winplr = room.players[room.game.gameRevertPoint[h].playerIndex];
						let winAmount = room.game.gameRevertPoint[h].amount;
						// rack update

						winplr.chips += winAmount;

						let dataObj = {
							playerId: winplr.id,
							playerName: winplr.playerName,
							amount: parseFloat(winAmount),
							chips : parseFloat(winplr.chips),
							winnerSeatIndex: winplr.seatIndex,
							sidePotPlayerIndex: -1, // main Port index,
							roomId: room.id,
						};

						//Add revertpoint amount into player winningarray  @chetan
						for(let w = 0; w < room.gameWinners.length; w += 1){
							if(room.game.gameRevertPoint[h].playerID == room.gameWinners[w].playerId){
								room.gameWinners[w].chips += parseFloat(room.game.gameRevertPoint[h].amount);
								console.log("check long value revertpoint", room.gameWinners[w].chips, typeof(room.gameWinners[w].chips))
							}
						}
						
						//console.log("revertpoint player", room.game.gameRevertPoint);
						//console.log("room winners", room.gameWinners);
						console.log("revert point win amount",winAmount, room.game.gameNumber );
						console.log("final wining amount sum", winplr.chips, room.game.gameNumber);
						console.log('<=> Game RevertPoint Broadcast || Texas GAME-NUMBER [' + room.game.gameNumber + '] || RevertPoint : ', dataObj);
						await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('RevertPoint', dataObj);
					}
				}

				if (room.getCurrentPlayer()) {
					Sys.Timers[room.id] = setTimeout(async function (room) {
		
						// Form New Round Set Turn Bet in Raised Amount is BB
						Sys.Rooms[room.id].turnBet = { action: Sys.Config.Texas.Bet, playerId: room.players[room.currentPlayer].id, betAmount: 0, raisedAmount : room.bigBlind, hasRaised: false }
						console.log("<< New Roud Start.......  >>")
						console.log("<< Turn Bet ::",Sys.Rooms[room.id].turnBet)
						let timer = parseFloat(Sys.Config.Texas.RegularTimer);
						let buttonAction = room.getCurrentTurnButtonAction();
						console.log(buttonAction);

						let totalPlayingPlayers = 0;
						for (i = 0; i < room.players.length; i++) {
							if(room.players[i].status == 'Playing' && room.players[i].folded == false){
								totalPlayingPlayers++;
							}
						}
						if(totalPlayingPlayers > 1){
							Sys.Timers[room.id] = setInterval(async function (room) {
								console.log("Player Timer Send 3 : ", timer, room.game.gameNumber);
								
								timer--;
								// For Player Default Action
								let maxBet = parseFloat(room.getMaxBet(room.game.bets));
								let yourBet = parseFloat(room.game.bets[room.currentPlayer]);
								let playerChips = parseFloat(room.players[room.currentPlayer].chips);

								if (timer < 0) {
									clearTimeout(Sys.Timers[room.id]); // Clear Turn Timer
									clearInterval(Sys.Timers[room.id]);
									room.players[room.currentPlayer].isAlreadyActed = true;
									console.log("room players in roundFinished", room.players); 
									Sys.Game.Sng.Texas.Controllers.RoomProcess.playerDefaultAction(room.id);
								}else if(room.getCurrentPlayer().isCheck == true){
									if (maxBet == yourBet) {
										//room.check(room.getCurrentPlayer().id);
										Sys.Game.Sng.Texas.Controllers.RoomProcess.playerAction({
											playerId: room.getCurrentPlayer().id,
										  	betAmount: 0,
										  	action: 2,
										  	roomId: room.id,
										  	hasRaised: false,
										  	productName: 'Byte Poker'
										});
									} else {
										//room.fold(room.getCurrentPlayer().id);
										Sys.Game.Sng.Texas.Controllers.RoomProcess.playerAction({
											playerId: room.getCurrentPlayer().id,
										  	betAmount: 0,
										  	action: 6,
										  	roomId: room.id,
										  	hasRaised: false,
										  	productName: 'Byte Poker'
										});
									}
								}else if(room.getCurrentPlayer().isCall == true){
									if (parseFloat(maxBet - yourBet) == 0) {
										//room.check(room.getCurrentPlayer().id);
										Sys.Game.Sng.Texas.Controllers.RoomProcess.playerAction({
											playerId: room.getCurrentPlayer().id,
										  	betAmount: 0,
										  	action: 2,
										  	roomId: room.id,
										  	hasRaised: false,
										  	productName: 'Byte Poker'
										});
									}
									else if (playerChips <= parseFloat(maxBet - yourBet)) {
										//room.AllIn(room.getCurrentPlayer().id, false);
										Sys.Game.Sng.Texas.Controllers.RoomProcess.playerAction({
											playerId: room.getCurrentPlayer().id,
										  	betAmount: playerChips,
										  	action: 8,
										  	roomId: room.id,
										  	hasRaised: false,
										  	productName: 'Byte Poker'
										});
									} else {
										//room.call(room.getCurrentPlayer().id, false);
										Sys.Game.Sng.Texas.Controllers.RoomProcess.playerAction({
											playerId: room.getCurrentPlayer().id,
										  	betAmount: (maxBet - yourBet),
										  	action: 4,
										  	roomId: room.id,
										  	hasRaised: false,
										  	productName: 'Byte Poker'
										});
									}
								}else if(room.getCurrentPlayer().isFold == true){
									//room.fold(room.getCurrentPlayer().id);
									Sys.Game.Sng.Texas.Controllers.RoomProcess.playerAction({
										playerId: room.getCurrentPlayer().id,
									  	betAmount: 0,
									  	action: 6,
									  	roomId: room.id,
									  	hasRaised: false,
									  	productName: 'Byte Poker'
									});
								}else{
									await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('OnTurnTimer', {
										playerId: room.getCurrentPlayer().id,
										timer: timer,
										roomId: room.id,
										maxTimer: parseFloat(Sys.Config.Texas.RegularTimer),
										buttonAction: buttonAction,
										defaultButtons: room.getDefaultButtons(),
										isLimitGame : (room.limit == 'limit') ?  true : false
									});
								}
								
							}, 1000, room);
						}
					}, ( Sys.Config.Texas.waitAfterRoundComplete/2), room)
				}
			}, 1000, room)
		} catch (e) {
			console.log(" Error roundFinished :", e);
		}
	},

	gameFinished: async function (room, sidePot) {
		try {
			clearTimeout(Sys.Timers[room.id]);
			clearInterval(Sys.Timers[room.id]);
			let tournament = await Sys.Game.Common.Services.sngTournamentServices.getById(room.tournament);
			let waitTime = Sys.Config.Texas.waitAfterRoundComplete;

			if (room.game.gameRevertPoint.length > 0) { // Wait For Revert Point Animation Show.
				waitTime += 1000;
			}

			if (room.game.status == 'Finished AllIn') {
				waitTime += 1000;
			}

			var showCardsPlayerIds = [];
			if (room.players.length > 0) {
				for (var pl = 0; pl < room.players.length; pl++) {

					if (room.players[pl].status == "Playing" && room.players[pl].folded == false) {
						showCardsPlayerIds.push(room.players[pl].id);
					}
				}
			}
			console.log("after push player showCardsPlayerIds: ", showCardsPlayerIds);

			let originalGameStatus = room.game.status;
			if (room.game.status != 'Finished') {
				room.game.status = 'Finished';
				room = await Sys.Game.Sng.Texas.Services.RoomServices.update(room);
				console.log('<=> Game Finished Called ||  Texas GAME-NUMBER [' + room.game.gameNumber + '] ||');
				let dataObj = {
					roundStarted: room.game.roundName,
					cards: room.game.board,
					potAmount: room.game.pot
				};
				console.log('<=> Game Finished Round Complete Broadcast ||  Texas GAME-NUMBER [' + room.game.gameNumber + '] || RoundComplete : ', dataObj);
				console.log("gamefinished Roundcomplete broadcast", room.game.pot, room.game.gameMainPot, sidePot, room.game.status, room.status)
				await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('RoundComplete', {
					roundStarted: room.game.roundName,
					cards: room.game.board,
					potAmount: room.game.pot,
					PlayerSidePot: {
						sidePot: sidePot,
						mainPot: +(room.game.gameMainPot).toFixed(2)
					},
					roomId: room.id
				});
			}

			let extraWaitTime = 1000;
			if (originalGameStatus == 'ForceFinishedFolded') {
				extraWaitTime = 300;
			}
			Sys.Timers[room.id] = setTimeout(async function (room, showCardsPlayerIds) {


				Sys.Timers[room.id] = setTimeout(async function (room, showCardsPlayerIds) {

					let playersCards = [];

					// show player cards after aggressor
					if (originalGameStatus != 'Finished AllIn' && originalGameStatus != 'ForceFinishedFolded') {
						//1) decide aggressor
						console.log("aggressorIdArray", room.game.aggressorIdArray);
						if (room.game.aggressorIdArray.length > 0) {
							for (let a = (room.game.aggressorIdArray.length - 1); a >= 0; a--) {
								console.log("aggressorId", room.getPlayerById(room.game.aggressorIdArray[a]));
								let player = room.getPlayerById(room.game.aggressorIdArray[a]);
								console.log("aggressor player", player);
								if (player.status == "Playing") {
									room.game.aggressorIdArray = [player.id];
									playersCards.push({
										playerId: player.id,
										cards: player.cards
									});
									for (let i = 0; i < room.players.length; i++) {
										if (room.players[i].id == player.id) {
											room.players[i].isDisplayedCard = true;
											break;
										}
									}
									console.log("after aggressor assign", room.players)
									break;
								}
							}
							console.log("Afterr deciding aggressor", room.game.aggressorIdArray, room.game.aggressorIdArray.length);
						}


						if (room.game.aggressorIdArray.length <= 0) {
							//2) decide left of the dealer
							let playerFound = false;
							for (let i = room.smallBlindIndex; i < room.players.length; i += 1) {
								console.log("room.players in deciding left of the dealer", room.players[i].playerName, room.players[i].id, room.players[i].folded, room.players[i].allIn, room.players[i].status)
								if (room.players[i].folded === false && room.players[i].status === 'Playing') {
									room.players[i].isDisplayedCard = true;
									playersCards.push({
										playerId: room.players[i].id,
										cards: room.players[i].cards
									});
									console.log("left of the dealer", room.players[i].id);
									playerFound = true;
									break;
								}
							}
							if (playerFound == false) {
								console.log("player not found so search again ")
								console.log("dealer index", room.dealerIndex)
								for (let i = 0; i < room.dealerIndex; i += 1) {
									console.log("room.players in deciding left of the dealer", room.players[i].playerName, room.players[i].id, room.players[i].folded, room.players[i].allIn, room.players[i].status)
									if (room.players[i].folded === false && room.players[i].status === 'Playing') {
										room.players[i].isDisplayedCard = true;
										playersCards.push({
											playerId: room.players[i].id,
											cards: room.players[i].cards
										});
										console.log("left of the dealer", room.players[i].id);
										playerFound = true;
										break;
									}
								}
							}
						}
						console.log("playersCards before gameWinner", playersCards)

						//3) check for winnerarray
						console.log("gameWinners-----", room.gameWinners);
						for (let i = 0; i < room.players.length; i++) {
							console.log("game status", originalGameStatus);
							if (originalGameStatus != 'Finished AllIn') {
								for (let w = 0; w < room.gameWinners.length; w++) {
									if (room.players[i].status == 'Playing' && room.players[i].folded != true && room.gameWinners[w].playerId == room.players[i].id && playersCards.findIndex(k => k.playerId === room.players[i].id) == -1) {
										console.log("inside the gameWinners", room.players[i].id, room.players[i].playerName)
										room.players[i].isDisplayedCard = true;
										playersCards.push({
											playerId: room.players[i].id,
											cards: room.players[i].cards
										});
									}
								}

							}
						}

						console.log("GameFinishedPlayersCards", playersCards);
					}

					//send show cards broadcast

					//let showCardsPlayerIds = [];
					if (originalGameStatus != 'Finished AllIn') {

						/*if(originalGameStatus == 'ForceFinishedFolded'){
							for(let i=0; i < room.players.length; i++){
								//if(room.players[i].status == 'Playing' && room.players[i].id != room.otherData.lastFoldedPlayerId && room.players[i].folded == false){
								if(room.players[i].status == 'Playing' &&  room.lastFoldedPlayerIdArray.indexOf(room.players[i].id) == -1   && room.players[i].folded == false){
									gameWinnersPlayerIds.push(room.players[i].id);
								}
							}
						}else{
							for(let w = 0; w < room.gameWinners.length; w++){
								gameWinnersPlayerIds.push(room.gameWinners[w].playerId);
							}
						}

						console.log("show cards all game winners ids", gameWinnersPlayerIds);*/

						if (originalGameStatus == 'ForceFinishedFolded') {
							/*for(let i=0; i < room.players.length; i++){
								if(gameWinnersPlayerIds.indexOf(room.players[i].id) == -1 && room.players[i].status == 'Playing' && room.lastFoldedPlayerIdArray.indexOf(room.players[i].id) != -1 ){
									showCardsPlayerIds.push(room.players[i].id);
								}
							}*/
							/*for(let i=0; i < room.players.length; i++){
								if(room.players[i].status == 'Playing' && room.players[i].folded == false ){
									showCardsPlayerIds.push(room.players[i].id);
									break;
								}
							}*/
							//showCardsPlayerIds.push(room.otherData.lastFoldedPlayerId);
						} else {
							/*for(let i=0; i < room.players.length; i++){
								if( playersCards.findIndex(k => k.playerId === room.players[i].id ) == -1  && room.players[i].status == 'Playing' && room.players[i].folded == false){
									showCardsPlayerIds.push(room.players[i].id);
								}
							}*/
						}

						//console.log("show cards player ids and game id", showCardsPlayerIds, room.game.id);
						await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('GameFinishedPlayersCards', { playersCards: playersCards, roomId: room.id })
						//await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('DisplayShowCardButton', { playerIdList : showCardsPlayerIds, gameId:room.game.id, roomId: room.id });

					}

					var isRiverRound = 0;
					console.log("showCardsPlayerIds: ", showCardsPlayerIds);
					if (room.game.history.length > 0) {
						for (var h = (room.game.history.length - 1); h >= 0; h--) {
							if (room.game.history[h].gameRound == "River") {
								console.log("room.game.history[h]: ", room.game.history[h].playerAction);
								if (room.game.history[h].playerAction == 6) {
									var isRiverRound = 1;
									showCardsPlayerIds.push(room.game.history[h].playerId);
									break;
								} else {

								}
							}
						}
					}

					console.log("isRiverRound: ", isRiverRound);

					for (var gw = 0; gw < room.gameWinners.length; gw++) {
						if (showCardsPlayerIds.indexOf(room.gameWinners[gw].playerId) > -1) {
							var indexOfWinner = showCardsPlayerIds.indexOf(room.gameWinners[gw].playerId);
							showCardsPlayerIds.splice(indexOfWinner, 1);
						}
					}

					for (var ag = 0; ag < room.game.aggressorIdArray.length; ag++) {
						if (showCardsPlayerIds.indexOf(room.game.aggressorIdArray[ag]) > -1) {
							var indexOfWinner = showCardsPlayerIds.indexOf(room.game.aggressorIdArray[ag]);
							showCardsPlayerIds.splice(indexOfWinner, 1);
						}
					}

					console.log("final showcard array showCardsPlayerIds: ", showCardsPlayerIds);

					if (isRiverRound == 0) {
						//var showCardsPlayerIds = [];
					}

					console.log("gameFinished showCardsPlayerIds: ", showCardsPlayerIds);
					await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('DisplayShowCardButton', { playerIdList: showCardsPlayerIds, gameId: room.game.id, roomId: room.id });
					/*else{
						await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('DisplayShowCardButton', { playerIdList : room.lastFoldedPlayerIdArray, gameId:room.game.id, roomId: room.id });
					}*/


					// timeout condition for folded players

					if (originalGameStatus == 'ForceFinishedFolded') {
						waitTime = 1000;
					}
					Sys.Timers[room.id] = setTimeout(async function (room) {
						var winnerPlayerIds = [];
						var winnerPlayerAmount = [];
						for (var c = 0; c < room.gameWinners.length; c++) {
							winnerPlayerIds.push(room.gameWinners[c].playerId);
							winnerPlayerAmount.push(room.gameWinners[c].amount);
						}

						for (var rp = 0; rp<room.players.length; rp++){
							var transactionData = await Sys.Game.CashGame.Texas.Services.ChipsServices.getSingleData({user_id: room.players[rp].id,gameId: room.game.id});
							var totalBetAmount = room.game.roundBets[rp];
							if(winnerPlayerIds.indexOf(room.players[rp].id) > -1 && parseFloat(totalBetAmount) > 0){
								var winnerAmount = 0;
								for(var wp=0; wp<winnerPlayerIds.length; wp++){
									if(winnerPlayerIds[wp] == room.players[rp].id){
										winnerAmount += winnerPlayerAmount[wp]
									}
								}

								console.log("winner Amount new: ", winnerAmount);
								console.log("parseFloat(totalBetAmount): ", parseFloat(totalBetAmount));
								console.log("parseFloat(winnerAmount): ", parseFloat(winnerAmount));


								var transactionDetail = await Sys.Game.Sng.Texas.Services.ChipsServices.getSingleData({user_id : room.players[rp].id, gameId : room.game.id});
								
								console.log("transactionDetail: ", transactionDetail);

								if(transactionDetail == null){

									let traNumber = + new Date()
									let transactionDataWinData = {									
										user_id: room.players[rp].id,
										transactionNumber: 'DEP-' + traNumber,
										username: room.players[rp].playerName,
										gameId: room.game.id,
										gameNumber: room.game.gameNumber,
										chips: parseFloat(winnerAmount),
										bet_amount: parseFloat(totalBetAmount),
										afterBalance:  parseFloat(room.players[rp].chips),
										previousBalance: (parseFloat(room.players[rp].chips) +  parseFloat(totalBetAmount))- parseFloat(winnerAmount),
										category: 'credit',
										type: 'winner',
										remark: 'Winner for game finished',
										uniqId:room.players[rp].uniqId,
										// sessionId:room.players[rp].sessionId
										sessionId:  tournament.playersSestionIds[tournament.players.indexOf(room.players[rp].id)],

									}

									await Sys.Game.Sng.Texas.Services.ChipsServices.insertData(transactionDataWinData);

									let transactionData = {
										user_id:room.players[rp].id,
										username: room.players[rp].playerName,
										gameId: room.game.id,
										gameNumber: room.game.gameNumber,
										tableId: room.id,
										tableName: room.name,
										chips: parseFloat(winnerAmount),
										previousBalance: (parseFloat(room.players[rp].chips) - parseFloat(winnerAmount)),
										afterBalance:  parseFloat(room.players[rp].chips),
										category: 'credit',
										type: 'winner',
										remark: 'winner for game',
										isTournament: 'No',
										isGamePot: 'no'
									}
									console.log("Winner for game: ", transactionData);
									await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionData);
									
									
									//await Sys.Game.CashGame.Texas.Services.ChipsServices.createTransaction(transactionDataWinData);
								}else{
									var newChips = parseFloat(transactionDetail.chips) + parseFloat(winnerAmount);
									let previousBalance = parseFloat(transactionDetail.previousBalance) - parseFloat(winnerAmount);
									console.log("transactionDetail exist newChips: ", newChips);
									console.log("transactionDetail exist previousBalance: ", previousBalance);
									await Sys.Game.CashGame.Texas.Services.ChipsServices.updateTransactionData({_id :transactionDetail._id},{ previousBalance:parseFloat(previousBalance), chips:parseFloat(newChips).toFixed(2)});
								}

								// let transactionData = {
								// 	user_id:room.players[rp].id,
								// 	username: room.players[rp].playerName,
								// 	gameId: room.game.id,
								// 	gameNumber: room.game.gameNumber,
								// 	tableId: room.id,
								// 	tableName: room.name,
								// 	chips: parseFloat(winnerAmount),
								// 	previousBalance: (parseFloat(room.players[rp].chips) - parseFloat(winnerAmount)),
								// 	afterBalance:  parseFloat(room.players[rp].chips),
								// 	category: 'credit',
								// 	type: 'winner',
								// 	remark: 'winner for game',
								// 	isTournament: 'Yes',
								// 	isGamePot: 'no'
								// }
								// console.log("regular tournament Winner for game: ", transactionData);
								// await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionData);
							}else if(winnerPlayerIds.indexOf(room.players[rp].id) == -1 && parseFloat(totalBetAmount) > 0){
								if(transactionData == null){
									let traNumber = + new Date()
									let transactionDataWinData = {									
										user_id: room.players[rp].id,
										username: room.players[rp].playerName,
										gameId: room.game.id,
										gameNumber: room.game.gameNumber,
										chips: parseFloat(totalBetAmount),
										bet_amount: parseFloat(totalBetAmount),
										afterBalance: parseFloat(room.players[rp].chips),
										previousBalance:parseFloat(room.players[rp].chips) +  parseFloat(totalBetAmount),
										category: 'debit',
										type: 'lose',
										remark: 'Lose for game',
										transactionNumber: 'DE-' + traNumber,
										uniqId:room.players[rp].uniqId,
										sessionId:  tournament.playersSestionIds[tournament.players.indexOf(room.players[rp].id)]
									};
									
									await Sys.Game.CashGame.Texas.Services.ChipsServices.insertData(transactionDataWinData);
									let transactionData = {
										user_id:room.players[rp].id,
										username: room.players[rp].playerName,
										gameId: room.game.id,
										gameNumber: room.game.gameNumber,
										tableId: room.id,
										tableName: room.name,
										chips:  parseFloat(0),
										previousBalance:parseFloat(room.players[rp].chips),
										afterBalance: parseFloat(room.players[rp].chips),
										category: 'debit',
										type: 'lose',
										remark: 'Lose for game',
										isTournament: 'No',
										isGamePot: 'no'
									}
									console.log("lose for game: ", transactionData);
									await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionData);
								}
							}
						}
						dataObj = {
							winners: room.gameWinners
						};
						console.log('<=> Game Finished Broadcast || Texas GAME-NUMBER [' + room.game.gameNumber + '] || GameFinished : ', dataObj);

						//room.previousGameId = room.game.id;
						//room.previousGameNumber = room.game.gameNumber;

						//await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('GameFinished', { winners: room.gameWinners, roomId: room.id, previousGameNumber : room.previousGameNumber, previousGameId : room.previousGameId });
						await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('GameFinished', { winners: room.gameWinners, roomId: room.id });
						// start new game
						/**
						 * Save game histry to database
						 */
						console.log('<=> Game Start Saving Histry ||  Texas GAME-NUMBER [' + room.game.gameNumber + '] ||');

						let history = await Sys.Game.Sng.Texas.Controllers.RoomProcess.saveGameToHistry(room);



						// timeout condition for folded players
						let gameWinningTime = (room.gameWinners.length * 300) + parseFloat(Sys.Config.Texas.waitBeforeGameReset)
						if (originalGameStatus == 'ForceFinishedFolded') {
							gameWinningTime = 500;
						}
						Sys.Timers[room.id] = setTimeout(async function (room) {

							console.log('<=> Game ResetGame Broadcast ||  Texas GAME-NUMBER [] || ResetGame : ');
							await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('ResetGame', { roomId: room.id });

							// Check For Sit Out Next Hand. & Remove Player & Check For Bankcrupt
							for (let i = 0; i < room.players.length; i++) {
								/*if(room.players[i].sitOutNextHand == true){
									room.gameLosers.push(room.players[i]);
									room.players[i].status = 'Left';
									
								}*/

								
								// Check For Bankcrupt
								if( room.players[i].chips == 0){
									console.log("room.gameLosers.push beforeeee : ",room.gameLosers);
									
									room.gameLosers.push(room.players[i]);
									Sys.Game.Sng.Texas.Services.playerGameHistoryServices.updatePlayerStatus(room.players[i].id,'Finished');
									room.players[i].status = 'Left';
									await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('PlayerLeft', { 'playerId': room.players[i].id, roomId: room.id });
								}
							}

							console.log("game loosers", room.gameLosers);

							// remove lefted player also
							room.status = 'Finished';
							room.game = null;
							// Game Finished update fold/allin/talked value.
							for (var i = 0; i < room.players.length; i++) {
								room.players[i].folded = false;
								room.players[i].allIn = false;
								room.players[i].talked = false;
								room.players[i].muck = false;
								room.players[i].isSidepot = false;
								//room.otherData.lastFoldedPlayerId = '';
								room.lastFoldedPlayerIdArray = [];
								room.players[i].isDisplayedCard = false;
								room.players[i].roundRaisedAmount = 0;
								room.players[i].cards.splice(0, room.players[i].cards.length);
								room.players[i].subscribeTime = new Date();

								room.players[i].isFold = false;
								room.players[i].isCheck = false;
								room.players[i].isCall = false;
								room.players[i].considerLeftedPlayer = false;
								room.players[i].isAlreadyActed =false;
							}
							room.timerStart = false;
							room = await Sys.Game.Sng.Texas.Services.RoomServices.update(room);

							// timeout condition for folded players
							let waitAfterGameReset = parseFloat(Sys.Config.Texas.waitAfterGameReset) + 1000;
							if (originalGameStatus == 'ForceFinishedFolded') {
								waitAfterGameReset = 1000;
							}
							console.log("waitAfterGameReset", waitAfterGameReset)
							Sys.Timers[room.id] = setTimeout(async function (room) {

								let totalPlayers = 0;
								for (i = 0; i < room.players.length; i++) {
									if(room.players[i].status != 'Left'){ 
										totalPlayers++;
									}
								}
								room.status = "Finished";
								//room.game = null;



								// open add chips popup if player has chips== 0 @chetan
								for (i = 0; i < room.players.length; i++) {
									if (room.players[i].status == 'Ideal' && room.players[i].chips == 0) {
										let minBuyIn = room.bigBlind;
										let maxBuyIn = 0;

										if (room.limit == 'limit') {
											maxBuyIn = room.players[i].chips; // No Limit in Max Buyin Game. // shubham
										} else if (room.limit == 'no_limit') {
											// No Limit
											maxBuyIn = parseFloat(parseFloat(room.bigBlind) * 200);
										} else {
											// Pot Limit
											maxBuyIn = parseFloat(parseFloat(room.bigBlind) * 200);
										}

										console.log("popup open for player ", room.players[i].id)
										//await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('OnOpenBuyInPanel', { 'playerId': room.players[i].id, roomId:room.id });
										await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.players[i].socketId).emit('OnOpenBuyInPanel', { 'playerId': room.players[i].id, roomId: room.id });

									}
								}


								console.log('<===============================>');
								console.log('<=> Ramain Player : <=>', totalPlayers);
								console.log('<===============================>');

								if (totalPlayers >= room.minPlayers && room.status != 'Running' && room.timerStart == false) {
									
									console.log('<=> Check Break Timer <=>');
									let current = new Date().getTime();
									var difference = current - room.breakTime;
									var minutesDifference = Math.floor(difference/1000/60);
									
									if(minutesDifference >= parseFloat(Sys.Config.Texas.regulaerBreakStartIn)){
										let tournament = await Sys.Game.Sng.Texas.Services.TournamentServices.getById(room.tournament);
										room.breakTime =  new Date().getTime();
										console.log("ROOM BREAK",room.breakTime) 
										let breakTime = parseFloat(parseFloat(Sys.Tournaments[tournament.id].breaks_time)* 60);
										let OtherRoom = [];
										for(let i= 0;i<tournament.rooms.length;i++){
											
											let TrRoom = await Sys.Game.Sng.Texas.Services.RoomServices.get(tournament.rooms[i]);
											OtherRoom.push(TrRoom)
											
											
										}
										console.log("ROOM STATUS",OtherRoom)
										for(let i= OtherRoom.length -1;i>= 0;i--){
											if(OtherRoom[i].status == 'Closed'){
											  OtherRoom.splice(i,1);
										  }
										}
										console.log("ROOM STATUS2222",OtherRoom)
										console.log("CHECK STATUS OF ROOM",OtherRoom.every((val, i, arr) => val.status === arr[0].status))

										console.log("ALL ROOM TIME CHECK",OtherRoom.map((val)=> val.updateAt && val.id))
										let compareTime = OtherRoom.reduce(function(prev, current) {
											return (prev.updateAt > current.updateAt) ? prev : current
										});
										console.log("COMPARE TIME",compareTime)
										
											
										Sys.Timers[room.id] = setInterval(async function (room) {
											console.log("Break Start :",breakTime);
											
											Sys.Game.Sng.Texas.Controllers.TournamentProcess.stopBlindTimer(tournament);
											room.breakTimeCheck = true;
											OtherRoom.map((val) => val.roomStatusCheckOnBreak = false);
							
											OtherRoom.forEach( async function (allRooms){
												console.log("ALL ROOMS",allRooms.id);
												await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(allRooms.id).emit('OnBreak', {
													timer: breakTime,
													name: 'break',
													roomId: allRooms.id
												});
											});
										
											breakTime--;
											if (breakTime < 1) {
												clearTimeout(Sys.Timers[room.id]); // Clear Turn Timer
												console.log("ROOM ID",tournament)
												let roomIds = [];
												for(let i=0;i< tournament.rooms.length;i++){
													roomIds.push(tournament.rooms[i]);
												}
												setTimeout( async () => {
													Sys.Game.Sng.Texas.Controllers.TournamentProcess.startBlindTimer(tournament,roomIds);
													room.breakTimeCheck = false;
													console.log('<===============================>');
													console.log('<=> After Timer New Game Starting [] <=>');
													console.log('<===============================>');
													OtherRoom.forEach(async function(room, index){
														setTimeout( async () => {
															room.StartGame();
															room.breakTime =  new Date().getTime();
														}, 500*index);
													});
												}, 1000);
											}
											
										}, 1000, room);
											
											
										
										
										

									}else{

										console.log('<===============================>');
										console.log('<=> New Game Starting [] <=>');
										console.log("pgame starting gameFinish room status", room.status);
										console.log("**************************************");
										console.log("game started from gameFinish")
										console.log("**************************************");
										console.log('<===============================>');
										room.timerStart = true;
										room.StartGame();
									}

									
								} else {
									// Remove Player Which Have Status Left
									room.status = "Closed";
									room.game = null;
									roomUpdated =  Sys.Game.Sng.Texas.Services.RoomServices.update(room);
									console.log('<===============================>');
									console.log('<=> Tournament Finished. ');
									console.log('<===============================>');

									Sys.Game.Sng.Texas.Controllers.PlayerProcess.checkForTournamentWinner(room);
									Sys.Game.Sng.Texas.Controllers.TournamentProcess.stopBlindTimer(tournament);
								}
							}, waitAfterGameReset, room)

						}, gameWinningTime, room)

					}, waitTime, room)

				}, extraWaitTime, room, showCardsPlayerIds);

			}, extraWaitTime, room, showCardsPlayerIds);

		} catch (e) {
			console.log("Error:", e);
		}
	},

	playerDefaultAction: async function (id) {
		try {
			console.log('playerDefaultAction called');
			clearTimeout(await Sys.Timers[id]);
			let room = await Sys.Game.Sng.Texas.Services.RoomServices.get(id);
			if (room.getCurrentPlayer()) {
				let currentPlayer = room.getCurrentPlayer()
				let maxBet, i;
				maxBet = 0;
				console.log("room.game.bets :", room.game.bets);
				for (i = 0; i < room.game.bets.length; i += 1) {
					if (room.game.bets[i] > maxBet) {
						maxBet = room.game.bets[i];
					}
				}

					// first check for check action and then for fold or lefting the player
					if (room.game.bets[room.currentPlayer] == maxBet) {
						room.check(currentPlayer.id);
					} else {
							// When Player is ideal, Fold theme
							await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('onIdealPlayer', { 'playerId': currentPlayer.id, status: true, roomId: room.id });
							//currentPlayer.status = 'Ideal';
							currentPlayer.isIdeal = true;
							room.fold(currentPlayer.id);		
					}
	
			}
		} catch (e) {
			console.log("Error", e);
		}
	},

	saveGameToHistry: async function (room) {
		try {
			console.log('Save game histry called', room);
			room.players =  [...new Set(room.players)];
			// console.log("room players when saving history", room.players);
			room.players.forEach(function (player) {
				room.game.players.push(player.toJson())
			})
			room.gameLosers.forEach(function (player) {
				room.game.players.push(player.toJson())
			})
			room.game.winners = room.gameWinners; // Just Push Winner.
			return await Sys.Game.Sng.Texas.Services.RoomServices.update(room);
		} catch (e) {
			console.log("Error:", e);
		}
	},

	calculateRake: async function (room) {
		try {
			console.log('Calculating rake for game')
			let rackAmount = room.rackAmount;
			let rakeByPercent = 0
			if (room.rackPercent > 0) {
				rakeByPercent = parseFloat(room.game.pot * (room.rackPercent / 100))
			}
			if (rackAmount > rakeByPercent || rackAmount == 0) {
				rackAmount = rakeByPercent
			}
			rakeByPercent = ((rackAmount / room.game.pot) * 100)
			let adminChips = 0
			for (let i = 0; i < room.gameWinners.length; i++) {
				let commission = parseFloat(room.gameWinners[i].chips * (rakeByPercent / 100));
				adminChips += commission;
				room.gameWinners[i].chips -= commission
				room.getPlayerById(room.gameWinners[i].playerId).chips -= commission
			}
			console.log('Admin User got : ' + adminChips + ' Chips')

			return await Sys.Game.Sng.Texas.Services.RoomServices.update(room)


			// User.find().limit(1).exec(function (err, users) {
			// 	if (err) { return callback(err, room) }
			// 	if (users[0].chips) {
			// 		users[0].chips += adminChips
			// 	} else {
			// 		users[0].chips = 0
			// 		users[0].chips += adminChips
			// 	}
			// 	users[0].save(function (err) {
			// 		if (err) { return callback(err, room) }
			// 		load('Poker/RoomService').update(room, function (err, room) {
			// 			if (err) { return callback(err, room) }
			// 			return callback(null, room)
			// 		})
			// 	})
			// })
		} catch (e) {
			console.log("Error:", e);
		}
	},

	sitOutNextHand: async function (data) {
		console.log("=================================================================");
		console.log("sitOutNextHand->", data);
		console.log("=================================================================");
		try {
			if (!data.roomId) {
				return {
					status: 'fail',
					result: null,
					message: "Room Not Found",
					statusCode: 401
				};
			}
			let room = await Sys.Game.Sng.Texas.Services.RoomServices.get(data.roomId);
			if (!room) {
				return {
					status: 'fail',
					result: null,
					message: "Room Not Found",
					statusCode: 401
				};
			}

			if (room && room.players && room.players.length > 0) {
				for (let i = 0; i < room.players.length; i++) {
					if (room.players[i].id == data.playerId && room.players[i].status != 'Left') {
						room.players[i].sitOutNextHand = data.actionValue;
					}
				}
			}
			room = await Sys.Game.Sng.Texas.Services.RoomServices.update(room);
			return {
				status: 'success',
				result: null,
				message: "Player Updated",
				statusCode: 200
			};
		} catch (error) {
			console.log("Error in SitOut:", error);
		}
	},

	sitOutNextBigBlind: async function (data) {
		console.log("=================================================================");
		console.log("sitOutNextBigBlind->", data);
		console.log("=================================================================");
		try {
			if (!data.roomId) {
				return {
					status: 'fail',
					result: null,
					message: "Room Not Found",
					statusCode: 401
				};
			}
			let room = await Sys.Game.Sng.Texas.Services.RoomServices.get(data.roomId);
			if (!room) {
				return {
					status: 'fail',
					result: null,
					message: "Room Not Found",
					statusCode: 401
				};
			}

			if (room && room.players && room.players.length > 0) {
				for (let i = 0; i < room.players.length; i++) {
					if (room.players[i].id == data.playerId && room.players[i].status != 'Left') {
						console.log("Name Updated :",room.players[i].playerName);
						console.log("?????????????????????????????????????????????????????????/")
						room.players[i].sitOutNextBigBlind = data.actionValue;
					}
				}
			}
			room = await Sys.Game.Sng.Texas.Services.RoomServices.update(room);
			return {
				status: 'success',
				result: null,
				message: "Player Updated",
				statusCode: 200
			};
		} catch (error) {
			console.log("Error in SitOut:", error);
		}
	},

	broadcastPlayerInfo: async function (room) {
		try {
			let playerInfoDummy = [];
			// Just Send Player Info for Remainig Player
			for (var i = 0; i < room.players.length; i++) {
				if(room.players[i].status != 'Left'){
					console.log("room.players[i].avatar :",room.players[i].playerName)
					//console.log("bets", room.game);
					let bets = 0;
					if(room.game != null){
						console.log("player roundbets", room.game.bets[i]);
						bets = room.game.bets[i];
					}
					let playerInfoObj = {
						id : room.players[i].id,
						status : room.players[i].status,
						username : room.players[i].playerName,
						chips : parseFloat(room.players[i].chips),
						appId :room.players[i].appid,
						avatar :  room.players[i].avatar,
						fb_avatar :  room.players[i].fb_avatar,
						folded : room.players[i].folded,
						allIn : room.players[i].allIn,
						seatIndex : room.players[i].seatIndex,
						idealPlayer : (room.players[i].isIdeal == true)? true : false,
						//idealPlayer :false,
						betAmount:bets,
					};
					/*if( room.players[i].status != 'Ideal' && ( room.players[i].status != 'Playing' || (room.players[i].folded == true) || room.status != 'Running') ){
						playerInfoObj.idealPlayer = false;
					}*/
					playerInfoDummy.push(playerInfoObj);
				}
			}
			//console.log("playerInfolist broadcast", playerInfoDummy)
		//	console.log("while sending broadcast roomdata", playerInfoDummy);
			   let dealerPlayerId = '';
			   let sidePot = [];
			   let gameMainPot = [];
			// let smallBlindPlayerId = '';
			// let bigBlindPlayerId = '';

			if(room.status == 'Running'){
				dealerPlayerId = room.getDealer().id;
				sidePot = room.game.gamePot;
				gameMainPot = room.game.gameMainPot;
				//smallBlindPlayerId = room.getSmallBliendPlayer().id;
				//bigBlindPlayerId = room.getBigBliendPlayer().id;
			}
			await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('playerInfoList', {
				playerInfo: playerInfoDummy,
				dealerPlayerId : dealerPlayerId,
				roomId: room.id,
				PlayerSidePot: {
					sidePot : sidePot,
					mainPot : gameMainPot
				}
				// smallBlindPlayerId : smallBlindPlayerId,
				// bigBlindPlayerId : bigBlindPlayerId
			});
			return room;
		}
		catch (error) {
			console.log('Error in broadcastPlayerInfo : ' + error);
			return new Error('Error in broadcastPlayerInfo');
		}
	},


	// rack distribution
	rackDeductionUpdate: async function(playerId, gameId, won, rackPercent, totalRack, rackFrom, rackTo, rackFromId, rackToId, gameNumber){
	  try{
	    let inserdata = await Sys.App.Services.RackHistoryServices.insertData({
	      'player': playerId,
	      'game': gameId,
	      'gameNumber': gameNumber,
	      'rackFromId': rackFromId,
	      'rackToId': rackToId,
	      'rackFrom': rackFrom,
	      'rackTo':  rackTo,
	      'won': eval( parseFloat(won).toFixed(4) ),
	      'rackPercent': rackPercent,
	      'totalRack': eval( parseFloat( totalRack ).toFixed(4) ),
	      'createdAt': new Date(),
		  'type':"rake"
	    });
	    if(rackTo == 'admin'){
	    	let admin = await Sys.App.Services.UserServices.getSingleUserData({_id: rackToId});
	    	console.log("Admin chips--", admin.chips);
	    	await  Sys.App.Services.UserServices.updateUserData({_id: rackToId},{chips: eval( parseFloat( (admin.chips + totalRack ) ).toFixed(4) ) })
	    }else{
	    	let agent = await Sys.App.Services.agentServices.getSingleAgentData({_id: rackToId});
	    	console.log("agent chips--", agent.chips);
	    	await  Sys.App.Services.agentServices.updateAgentData({_id: rackToId},{chips: eval( parseFloat( (agent.chips + totalRack ) ).toFixed(4) ) })
	    }
	  }catch(e){
	    console.log("Error in RackDeduction Update", e);
	  }
	},

	rackDeduction: async function (room) {
		try {
			console.log("rack called ");
			let totalRackOfTheGame = 0;
			
			//START: Preflop round all player fold not rake dueduct from player
			/*var foldPlyCount = 0;
			if(room.game.history.length > 0){
				for(var h=0; h<room.game.history.length; h++){
					if(room.game.history[h].gameRound == "Preflop"){
						if(room.game.history[h].playerAction == 6){
							foldPlyCount += 1;
						}else if(room.game.history[h].playerAction != 0 && room.game.history[h].playerAction != 1){
							foldPlyCount -= 1;
						}
					}
				}
			}*/
			let deductRack = true;
			if (room.game.board.length == 0) {
				deductRack = false;
			}
			//END: Preflop round all player fold not rake dueduct from player

			console.log("deduct rack or not: ", deductRack);
			if (deductRack) {
				let rack = await Sys.Setting;
				let adminRack = rack.rakePercenage;
				for (let i = 0; i < room.gameWinners.length; i++) {
					/*let commission = parseFloat(room.gameWinners[i].chips * (rakeByPercent / 100));
					adminChips += commission;
					room.gameWinners[i].chips -= commission
					room.getPlayerById(room.gameWinners[i].playerId).chips -= commission*/
					room.gameWinners[i].amount = eval(parseFloat(room.gameWinners[i].amount).toFixed(4));
					console.log("*******************Rack**********************")
					console.log("playerId", room.gameWinners[i].playerId);
					console.log("game id", room.game.id, room.game.gameNumber)
					console.log("won amount", room.gameWinners[i].amount)
					console.log("*******************Rack***********************")

					//let allAgentsRole = ['player'];
					//let rack = await Sys.Setting; //get Application rack

					let totalRackDeductionWinner = eval(parseFloat((parseFloat(room.gameWinners[i].amount) * parseFloat(Sys.Setting.rakePercenage)) / 100).toFixed(4));
					//let adminRack = rack.rakePercenage;
					console.log("totsl rsck deduction", totalRackDeductionWinner, rack, room.gameWinners[i].chips)

					for (let j = i; j < room.gameWinners.length; j++) {
						if (room.gameWinners[i].playerId == room.gameWinners[j].playerId) {
							room.gameWinners[j].chips -= parseFloat(totalRackDeductionWinner);
						}

					}
					console.log("after deduction chips winner array", room.gameWinners);
					//room.gameWinners[i].chips -= parseFloat(totalRackDeductionWinner);

					console.log("Winners Chips after rack Deduction", room.gameWinners[i].playerId, room.gameWinners[i].chips)
					Sys.Log.info('-----------Game Id-----------: ' + room.game.id, room.game.gameNumber);
					Sys.Log.info('Winners Chips after rack Deduction : ' + room.gameWinners[i].playerId + 'winning final:' + room.gameWinners[i].chips);


					room.getPlayerById(room.gameWinners[i].playerId).chips -= parseFloat(totalRackDeductionWinner);

					totalRackOfTheGame += totalRackDeductionWinner;
				}
			} else {
				console.log("dont cut rake");
			}

			console.log("Totalrackofthegame", totalRackOfTheGame, room.game.gameNumber);
			console.log("room.game.roundBets", room.game.roundBets, room.game.gameNumber);
			console.log("Game POT :", room.game.gamePot, room.game.gameNumber);
			console.log("gameMainPot :", room.game.gameMainPot, room.game.gameNumber);
			console.log("Game REvert Point :", room.game.gameRevertPoint, room.game.gameNumber);

		
			

			if (totalRackOfTheGame > 0) {
				
				let totalOfRoundBets = 0;
				let allAgentsRole = ['player'];

				let tempRoundBets = room.game.roundBets.slice();
				console.log("tempRoundBets 2", tempRoundBets)
				tempRoundBets.sort(function (a, b) {
					return a - b;
				});
				console.log("sorted tempRoundBets", tempRoundBets, tempRoundBets[(tempRoundBets.length) - 1], tempRoundBets[(tempRoundBets.length) - 2])
				if (tempRoundBets[(tempRoundBets.length) - 1] > tempRoundBets[(tempRoundBets.length) - 2]) {
					console.log("indexOFFFF", room.game.roundBets.indexOf(tempRoundBets[(tempRoundBets.length) - 1]), "test", tempRoundBets[(tempRoundBets.length) - 1])
					room.game.roundBets[room.game.roundBets.indexOf(tempRoundBets[(tempRoundBets.length) - 1])] = tempRoundBets[(tempRoundBets.length) - 2];
					tempRoundBets[(tempRoundBets.length) - 1] = tempRoundBets[(tempRoundBets.length) - 2];
					//room.game.roundBets[(room.game.roundBets.length) -1] = tempRoundBets[(tempRoundBets.length) -2];

				}
				console.log("roundbetss", room.game.roundBets);
				totalOfRoundBets = parseFloat((tempRoundBets.reduce((a, b) => a + b, 0)).toFixed(4));

				console.log("sorted tempRoundBets aftercalculation", tempRoundBets)
				console.log("totalofrounsbets", totalOfRoundBets)
				for (let rp = 0; rp < room.players.length; rp++) {
					if ((room.players[rp].status === 'Playing') || (room.players[rp].folded == true && room.players[rp].talked == true) || (room.players[rp].status === 'Left' && room.players[rp].talked == true) || (room.players[rp].status === 'Ideal' && room.players[rp].talked == true)) {
						console.log("player name and roundbets", room.players[rp].playerName, room.game.roundBets[rp]);

						totalRackDeduction = parseFloat(((room.game.roundBets[rp] / totalOfRoundBets) * totalRackOfTheGame).toFixed(4));
						console.log("totalRackDeduction", room.players[rp].playerName, totalRackDeduction)

						if (totalRackDeduction > 0) {
							let player = await Sys.App.Services.PlayerServices.getSinglePlayerData({ _id: room.players[rp].id });
							console.log("inside rack", player.username, player.agentRole, player.agentId);
							if (player.agentId != '' && player.agentId != null && player.agentId != undefined) {
								let agentRoleId = rolesArray.indexOf(player.agentRole);
								let allAgents = [player.agentId];
								let allAgentsFromToIds = [room.players[rp].id, player.agentId];
								console.log("consoleee", agentRoleId, allAgents, allAgentsFromToIds)


								let allAgentsRackArray = [];
								let finalAllAgentsRackArray = [];
								for (let rd = agentRoleId; rd >= 0; rd--) {
									if (rd != 0) {
										let agent = await Sys.App.Services.agentServices.getSingleAgentData({ _id: allAgents[allAgents.length - 1] });
										allAgents.push(agent.parentId);
										allAgentsRackArray.push(agent.commission)
									}
								}

								console.log("allAgentRackArray", allAgentsRackArray);
								//allAgentsRackArray.push( ( 100 - allAgentsRackArray[allAgentsRackArray.length-1] ) );
								let reverseArray = allAgentsRackArray.reverse();
								reverseArray.push(0);
								console.log("reversed array", reverseArray)


								if (reverseArray.length >= 3) {
									for (let i = 0; i < (reverseArray.length - 1); i++) {
										console.log(i);
										finalAllAgentsRackArray.push(reverseArray[i] - reverseArray[i + 1]);
									}
								} else {
									finalAllAgentsRackArray.push(reverseArray[0]);
								}


								finalAllAgentsRackArray.unshift((100 - reverseArray[0]));
								console.log("finalAllAnetArray", finalAllAgentsRackArray);

								//let finalAllAgentsRackArrayReverse = finalAllAgentsRackArray.reverse();
								//console.log("finalAllAgentsRackArrayReverse", finalAllAgentsRackArrayReverse)


								allAgents = [player.agentId];

								for (let rd = agentRoleId; rd >= 0; rd--) {
									if (rd == 0) {
										console.log("in first")
										let master = await Sys.App.Services.agentServices.getSingleAgentData({ _id: allAgents[allAgents.length - 1] });

										allAgentsRole.push('admin');
										console.log("rack deduction percentage admin", finalAllAgentsRackArray[rd])
										let tempRackDeduction = eval(parseFloat((totalRackDeduction * finalAllAgentsRackArray[rd]) / 100).toFixed(4));
										console.log("tempRackDeduction admin", tempRackDeduction);
										await module.exports.rackDeductionUpdate(room.players[rp].id, room.game.id, room.game.roundBets[rp], finalAllAgentsRackArray[rd], tempRackDeduction, allAgentsRole[allAgentsRole.length - 2], allAgentsRole[allAgentsRole.length - 1], allAgentsFromToIds[allAgentsFromToIds.length - 2], allAgentsFromToIds[allAgentsFromToIds.length - 1], room.game.gameNumber);
									}
									else {
										console.log("in second")
										let agent = await Sys.App.Services.agentServices.getSingleAgentData({ _id: allAgents[allAgents.length - 1] });
										allAgents.push(agent.parentId);

										allAgentsRole.push(agent.role + ' ( ' + agent.email + ')');

										//let tempRackDeduction = eval( parseFloat( ( totalRackDeduction * (100 - agent.commission) )/100 ).toFixed(4) );
										console.log("rack deduction percentage", finalAllAgentsRackArray[rd])
										let tempRackDeduction = eval(parseFloat((totalRackDeduction * finalAllAgentsRackArray[rd]) / 100).toFixed(4));
										console.log("tempRackDeduction", tempRackDeduction)
										//totalRackDeduction = totalRackDeduction - tempRackDeduction;

										//adminRack = agent.commission;

										await module.exports.rackDeductionUpdate(room.players[rp].id, room.game.id, room.game.roundBets[rp], finalAllAgentsRackArray[rd], tempRackDeduction, allAgentsRole[allAgentsRole.length - 2], allAgentsRole[allAgentsRole.length - 1], allAgentsFromToIds[allAgentsFromToIds.length - 2], allAgentsFromToIds[allAgentsFromToIds.length - 1], room.game.gameNumber);
										allAgentsFromToIds.push(agent.parentId);
									}
								}




							}
							else {
								console.log("Agent not available");
								let playerAgent = await Sys.App.Services.UserServices.getSingleUserData({});
								console.log("admin rack agent", playerAgent)
								let playerEmail = 'player ( ' + player.email + ')'
								await module.exports.rackDeductionUpdate(room.players[rp].id, room.game.id, totalOfRoundBets, adminRack, totalRackDeduction, playerEmail, 'admin', room.players[rp].id, playerAgent._id, room.game.gameNumber);

							}
						}


					} else {

					}
					allAgentsRole = ['player'];
				}
			}

			return await Sys.Game.Sng.Texas.Services.RoomServices.update(room)


			//res.send(player);
		} catch (e) {
			console.log("Error in Rack Deduction", e);
		}
	},
	


}

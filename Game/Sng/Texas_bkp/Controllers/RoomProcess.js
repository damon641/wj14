var Sys = require('../../../../Boot/Sys');

module.exports = {

	checkRoomSeatAvilability: async function (data) {
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
					if (room.players[i].id == player.id) { // && room.players[i].status == 'Left' Remove by Me
						oldPlayer = room.players[i]
						break;
					}
				}
			}
			console.log("Old Player Calculated")

			// chek seat in players array
			// let seatAvailable = true;
			// if (room.players.length > 0) {
			// 	for (let i = 0; i < room.players.length; i++) {
			// 		if (room.players[i].seatIndex == data.seatIndex && room.players[i].status != 'Left' ) {  
			// 			seatAvailable = false
			// 			break;
			// 		}
			// 	}
			// }
			console.log("------------------------------------------------------------")
			// chek seat in players array
			let seatAvailable = false
			let playerCount = 0;
			let allSeatIndex = [];
				for (let i = 0; i < room.players.length; i++) {
					if (room.players[i].status != 'Left') { 
						playerCount++;
						allSeatIndex.push(room.players[i].seatIndex);
					}
				}

			if (playerCount < room.maxPlayers) {
				// let Find Free SeatIndex
				for (let k = 0; k < room.maxPlayers; k++) {
					if(!allSeatIndex.includes(k)){
						seatAvailable = true;
						data.seatIndex = k;
						break;
					}
				}

			} 

			// When Fist User Wants to Push on Table.
			if(allSeatIndex.length == 0){
				seatAvailable = true;
				data.seatIndex = 0;
			}
			console.log("----------seatAvailable :",seatAvailable)
			console.log("------------------------------------------------------------")

			// if seat is available add player
			if (seatAvailable) {
				let chips = parseInt(player.chips) - parseInt(data.chips); // Shiv!@#
				if (oldPlayer) {
					console.log("Old Player Found")
					oldPlayer.chips = data.chips;
					oldPlayer.socketId = data.socketId;
					oldPlayer.seatIndex = data.seatIndex;
					oldPlayer.autoBuyin = data.autoBuyin;
					oldPlayer.status = 'Waiting';
					oldPlayer.sitOutNextHand = false;
					oldPlayer.sitOutNextBigBlind = false;
					oldPlayer.folded = false;
					oldPlayer.allIn = false;
					oldPlayer.talked = false;
				}else{
					console.log("Added Player ->>>>>>>>>>.");
					await room.AddPlayer(player.id, data.socketId, player.username, player.avatar, player.fb_avatar, data.chips, data.seatIndex, data.autoBuyin);
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
						if (player.status != 'Left') {
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
							await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('OnGameStartWait',{})
							console.log('Game object not present 2');
							Sys.Timers[room.id] = setTimeout(function () {
								room.timerStart = false; // Reset Timer Variable
								clearTimeout(Sys.Timers[room.id]); // Clear Room Timer
								console.log("Game Starting....");

								totalPlayers = 0;
								for (i = 0; i < room.players.length; i++) {
									if(room.players[i].status != 'Left'){
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

	leftRoom: async function (data) {
		try {
			console.log("LeftRoom Data", data);
			if (!data.roomId) {
				return {
					status: 'fail',
					result: null,
					message: "Room Not Found",
					statusCode: 401
				};
			}
			return {
				status: 'success',
				result: data.roomId,
				message: "Player Leave Room!",
				statusCode: 200
			};

			// var room = await Sys.Game.Sng.Texas.Services.RoomServices.get(data.roomId);
			// if (!room) {
			// 	return {
			// 		status: 'fail',
			// 		result: null,
			// 		message: "Room Not Found",
			// 		statusCode: 401
			// 	};
			// }

			// //check for user already present //
			// // chek seat in players array
			// let player = null;
			// if (room && room.players && room.players.length > 0) {
			// 	for (let i = 0; i < room.players.length; i++) {
			// 		if (room.players[i].id == data.playerId && room.players[i].status != 'Left') {
			// 			player = room.players[i];
			// 			room.players[i].status = "Left";
			// 			break;
			// 		}
			// 	}
			// }
			// if (player) {
			// 	let playersCount = 0;
			// 	if (room.game && room.game.status == 'Running' && player.folded === false) {
			// 		room.removePlayer(player.id);
			// 	}

			// 	await Sys.Game.Sng.Texas.Services.RoomServices.update(room);
			// 	console.log("Player Left ", player.id);
			// 	await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('PlayerLeft', { 'playerId': player.id });
			// 	let dataPlayer = await Sys.Game.Sng.Texas.Services.PlayerServices.getById(player.id);
			// 	if (dataPlayer) {
			// 		//	console.log("Chips",dataPlayer.chips,player.chips);
			// 		var chips = parseInt(dataPlayer.chips) + parseInt(player.chips);
			// 		var playerUpdate = await Sys.Game.Sng.Texas.Services.PlayerServices.update(player.id, { chips: chips });
			// 		return { room: room, player: player }
			// 	} else {
			// 		return {
			// 			status: 'fail',
			// 			result: null,
			// 			message: "Player not found",
			// 			statusCode: 401
			// 		};
			// 	}
			// } else {
			// 	return {
			// 		status: 'fail',
			// 		result: null,
			// 		message: "Player not found",
			// 		statusCode: 401
			// 	};
			// }
		} catch (e) {
			console.log("Error:", e);
			return new Error(e);
		}
	},

	newRoundStarted: async function (room) {
		try {
			let self = this
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
					cards: player.cards,
					chips : player.chips
				})
			});
			Sys.Timers[room.id] = setTimeout(async function (room) {
				console.log("Player Cards");
				await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('PlayerCards', data);
				Sys.Timers[room.id] = setTimeout(async function (room) {
					console.log("NextTurnPlayer Send", room.getCurrentPlayer().id);
					// await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('NextTurnPlayer', {
					// 	nextTurnPlayerId: room.getCurrentPlayer().id
					// })

					let timer = parseInt(Sys.Config.Texas.RegularTimer);
					let buttonAction = room.getCurrentTurnButtonAction();
					Sys.Timers[room.id] = setInterval(async function (room) {
						console.log("Player Timer Send : ", timer);
						await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('OnTurnTimer', {
							playerId: room.getCurrentPlayer().id,
							timer: timer,
							maxTimer: parseInt(Sys.Config.Texas.RegularTimer),
							buttonAction : buttonAction,
						});
						timer--;
						if (timer < 1) {
							clearTimeout(Sys.Timers[room.id]); // Clear Turn Timer
							Sys.Game.Sng.Texas.Controllers.RoomProcess.playerDefaultAction(room.id);
						}
					}, 1000, room);

				}, (500 * room.players.length) + 2000, room);
			}, (1000 * parseInt(Sys.Config.Texas.waitBeforeCardDistribut)), room);
			return
		} catch (e) {
			console.log("Error:", e);
		}
	},

	newGameStarted: async function (room) {
		try {
			
			await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('GameStarted', {
				message: 'starting first round',
				gameId: room.game.id,
				gameNumber: `${room.tableNumber} ${room.game.gameNumber}`
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

			var currentPlayer = room.getCurrentPlayer();
			if (currentPlayer && (currentPlayer.id != data.playerId)) {
				return console.log('Its not your turn or your turn expired');
			}
			if (room.game.status == 'Running') {
				currentPlayer.defaultActionCount = 0;

				clearTimeout(Sys.Timers[room.id]);
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
						if (room.bet(data.playerId, parseInt(data.betAmount), data.hasRaised)) {
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

			clearTimeout(Sys.Timers[room.id])
			room = await Sys.Game.Sng.Texas.Services.RoomServices.update(room);
			console.log('TurnFinished', Sys.Config.Texas.Regular)
			if (room.getCurrentPlayer()) {
				let turnBetData = room.getPreviousPlayerAction();
				await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('PlayerAction', {
					action: turnBetData,
					playerBuyIn: (turnBetData.playerId) ? room.getPlayerById(turnBetData.playerId).chips : 0,

				});
				await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('NextTurnPlayer', {
					nextTurnPlayerId: room.getCurrentPlayer().id
				});

				let timer = parseInt(Sys.Config.Texas.RegularTimer);
				let buttonAction = room.getCurrentTurnButtonAction();
				Sys.Timers[room.id] = setInterval(async function (room) {
					console.log("Player Timer Send : ", timer);
					await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('OnTurnTimer', {
						playerId: room.getCurrentPlayer().id,
						timer: timer,
						maxTimer: parseInt(Sys.Config.Texas.RegularTimer),
						buttonAction : buttonAction,
					});
					timer--;
					if (timer < 1) {
						clearTimeout(Sys.Timers[room.id]); // Clear Turn Timer
						Sys.Game.Sng.Texas.Controllers.RoomProcess.playerDefaultAction(room.id);
					}
				}, 1000, room);
			}
		} catch (e) {
			console.log("Error:", e);
		}
	},

	roundFinished: async function (room, sidePot) {
		try {
			room.timerStart = false; 
			clearTimeout(Sys.Timers[room.id]);
			console.log("room.game.pot 1 :", room.game.pot);
			room = await Sys.Game.Sng.Texas.Services.RoomServices.update(room);

			let turnBetData = room.getPreviousPlayerAction();
			await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('PlayerAction', {
				action: turnBetData,
				playerBuyIn: (turnBetData.playerId) ? room.getPlayerById(turnBetData.playerId).chips : 0,
			});
			Sys.Timers[room.id] = setTimeout(async function (room) {
				await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('RoundComplete', {
					roundStarted: room.game.roundName,
					cards: room.game.board,
					potAmount: room.game.pot,
					PlayerSidePot : {
						sidePot : sidePot,
						mainPot : room.game.gameMainPot
					}
				});
				//Send Allplayer hand
				// room.players.forEach(async function (player) {
				// 	await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(player.socketId).emit('PlayerHandInfo', await Sys.Game.Sng.Texas.Controllers.PlayerProcess.getHand(player, room.game.board));
				// })

				if (room.getCurrentPlayer()) {
					Sys.Timers[room.id] = setTimeout(async function (room) {
						// await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('NextTurnPlayer', {
						// 	nextTurnPlayerId: room.getCurrentPlayer().id
						// });
					 
						 

						let timer = parseInt(Sys.Config.Texas.RegularTimer);
						let buttonAction = room.getCurrentTurnButtonAction();
					
						Sys.Timers[room.id] = setInterval(async function (room) {
							console.log("Player Timer Send 3 : ", timer);
							await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('OnTurnTimer', {
								playerId: room.getCurrentPlayer().id,
								timer: timer,
								maxTimer: parseInt(Sys.Config.Texas.RegularTimer),
								buttonAction : buttonAction,
			
							});
							timer--;
							if (timer < 1) {
								clearTimeout(Sys.Timers[room.id]); // Clear Turn Timer
								Sys.Game.Sng.Texas.Controllers.RoomProcess.playerDefaultAction(room.id);
							}
						}, 1000, room);


					}, Sys.Config.Texas.waitAfterRoundComplete, room)

				}
			}, 1000, room)
		} catch (e) {
			console.log(" Error roundFinished :", e);
		}
	},

	gameFinished: async function (room, sidePot) {
		try {
			clearTimeout(Sys.Timers[room.id]);
			let waitTime = Sys.Config.Texas.waitAfterRoundComplete;

			if (room.game.gameRevertPoint.length > 0) { // Wait For Revert Point Animation Show.
				waitTime += 1000;
			}

			if (room.game.status == 'Finished AllIn') {
				waitTime += 1000;
			}
			//  else {
			// 	let turnBetData = room.getPreviousPlayerAction();
			// 	await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('PlayerAction', {
			// 		action: turnBetData,
			// 		playerBuyIn: (turnBetData.playerId) ? room.getPlayerById(turnBetData.playerId).chips : 0,

			// 	});
			// }
			room.game.status = 'Finished';
			room = await Sys.Game.Sng.Texas.Services.RoomServices.update(room);
			console.log('<=> Game Finished Called ||  OMAHA GAME-NUMBER [' + room.game.gameNumber + '] ||');
			let dataObj = {
				roundStarted: room.game.roundName,
				cards: room.game.board,
				potAmount: room.game.pot
			};
			console.log('<=> Game Finished Round Complete Broadcast ||  OMAHA GAME-NUMBER [' + room.game.gameNumber + '] || RoundComplete : ', dataObj);

			await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('RoundComplete', {
				roundStarted: room.game.roundName,
				cards: room.game.board,
				potAmount: room.game.pot,
				PlayerSidePot : {
					sidePot : sidePot,
					mainPot : room.game.gameMainPot
				}
			});

			Sys.Timers[room.id] = setTimeout(async function (room) {
		 
				// Send Revert Point to Player 
				for (let h = 0; h < room.game.gameRevertPoint.length; h += 1) {
					if (room.game.gameRevertPoint[h].amount > 0) {
						let winplr = room.players[room.game.gameRevertPoint[h].playerIndex];
						let winAmount = room.game.gameRevertPoint[h].amount;
						winplr.chips += winAmount;

						let dataObj = {
							playerId: winplr.id,
							playerName: winplr.playerName,
							amount: winAmount,
							chips : winplr.chips,
							winnerSeatIndex: winplr.seatIndex,
							sidePotPlayerIndex: -1, // main Port index,
						};

						console.log('<=> Game RevertPoint Broadcast || OMAHA GAME-NUMBER [' + room.game.gameNumber + '] || RevertPoint : ', dataObj);
						await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('RevertPoint', dataObj);
					}
				}


				Sys.Timers[room.id] = setTimeout(async function (room) {
			 
					// room = await Sys.Game.Sng.Texas.Controllers.RoomProcess.calculateRake(room);
					dataObj = {
						winners: room.gameWinners
					};
					console.log('<=> Game Finished Broadcast || OMAHA GAME-NUMBER [' + room.game.gameNumber + '] || GameFinished : ', dataObj);

					await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('GameFinished', { winners: room.gameWinners });

					// start new game
					/**
					 * Save game histry to database
					 */
					console.log('<=> Game Start Saving Histry ||  OMAHA GAME-NUMBER [' + room.game.gameNumber + '] ||');

					let history = await Sys.Game.Sng.Texas.Controllers.RoomProcess.saveGameToHistry(room);


					Sys.Timers[room.id] = setTimeout(async function (room) {
						 
						console.log('<=> Game ResetGame Broadcast ||  OMAHA GAME-NUMBER [] || ResetGame : ');
						await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('ResetGame', {});

						// Check For Sit Out Next Hand. & Remove Player
						for (let i = 0; i < room.players.length; i++) {
							if(room.players[i].sitOutNextHand == true){
								room.gameLosers.push(room.players[i]);
								room.players[i].status = 'Left';
							}
						}


						room.gameLosers.forEach(async function (player) {
							//console.log("Game Loser Player Left :");
							console.log('<=> Game PlayerLeft Broadcast ||  OMAHA GAME-NUMBER [] || PlayerLeft : ', player.id);
							await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('PlayerLeft', { 'playerId': player.id, roomId: room.id });
						})

						// remove lefted player also
						room.status = 'Finished';
						room.game = null;
						// Game Finished update fold/allin/talked value.
						for (var i = 0; i < room.players.length; i++) {
							room.players[i].folded = false;
							room.players[i].allIn = false;
							room.players[i].talked = false;
							room.players[i].cards.splice(0, room.players[i].cards.length);
						}
						room.timerStart = false; 
						room = await Sys.Game.Sng.Texas.Services.RoomServices.update(room);
						Sys.Timers[room.id] = setTimeout(async function (room) {
							
						let	totalPlayers = 0;
								for (i = 0; i < room.players.length; i++) {
									if(room.players[i].status != 'Left'){
										totalPlayers++;
									}
								}

								room.status = "Finished";
								//room.game = null;
								

								console.log('<===============================>');
								console.log('<=> Ramain Player : <=>',totalPlayers);
								console.log('<===============================>');

								
								if(totalPlayers >= 2){
									console.log('<===============================>');
									console.log('<=> New Game Starting [] <=>');
									console.log('<===============================>');
									room.StartGame();
								}else{
									// Remove Player Which Have Status Left
									for (let i = 0; i < room.players.length; i++) {
										if (room.players[i].status == 'Left') {
											room.players.splice(i, 1);
										}
									}

									room.status = "Closed";
									room.game = null;
									roomUpdated =  Sys.Game.Sng.Texas.Services.RoomServices.update(room);
									console.log('<===============================>');
									console.log('<=> Tournament Finished. ');
									console.log('<===============================>');

									Sys.Game.Sng.Texas.Controllers.PlayerProcess.checkForTournamentWinner(room);

								}
						}, parseInt(Sys.Config.Texas.waitAfterGameReset), room)

					}, (room.gameWinners.length * 3000) + parseInt(Sys.Config.Texas.waitBeforeGameReset), room)

				}, waitTime, room)

			}, 1000, room);

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
				if (room.game.bets[room.currentPlayer] == maxBet) {
					room.check(currentPlayer.id);
				} else {
					currentPlayer.defaultActionCount += 1;
					// console.log("currentPlayer.defaultActionCount", currentPlayer.defaultActionCount);
					if (currentPlayer.defaultActionCount >= 2) {
						let query = { roomId: room.id, playerId: currentPlayer.id }
						let leftRoomPlayer = await Sys.Game.Sng.Texas.Controllers.RoomProcess.leftRoom(query);
						console.log('Room Disconnect player lefted :', currentPlayer.playerName);
					} else {
						room.fold(currentPlayer.id);
					}
				}
			}
		} catch (e) {
			console.log("Error", e);
		}
	},

	saveGameToHistry: async function (room) {
		try {
			console.log('Save game histry called');
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
				rakeByPercent = parseInt(room.game.pot * (room.rackPercent / 100))
			}
			if (rackAmount > rakeByPercent || rackAmount == 0) {
				rackAmount = rakeByPercent
			}
			rakeByPercent = ((rackAmount / room.game.pot) * 100)
			let adminChips = 0
			for (let i = 0; i < room.gameWinners.length; i++) {
				let commission = parseInt(room.gameWinners[i].chips * (rakeByPercent / 100));
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


					let playerInfoObj = {
						id : room.players[i].id,
						status : room.players[i].status,
						username : room.players[i].playerName,
						chips : parseInt(room.players[i].chips),
						appId :room.players[i].appid,
						avatar :  room.players[i].appid,
						fb_avatar :  room.players[i].fb_avatar,
						folded : room.players[i].folded,
						allIn : room.players[i].allIn,
						cards : room.players[i].cards,
						seatIndex : room.players[i].seatIndex,
					};
					playerInfoDummy.push(playerInfoObj);
					console.log('<=> Send Room Players Broadcast || PlayerInfo :', room.players[i].playerName);
					console.log('<=> Send Room Players Broadcast || status :', room.players[i].status);

				}
			}

			let dealerPlayerId = '';
			let smallBlindPlayerId = '';
			let bigBlindPlayerId = '';
			if(room.status == 'Running'){
				dealerPlayerId = room.getDealer().id;
				smallBlindPlayerId = room.getSmallBliendPlayer().id;
				bigBlindPlayerId = room.getBigBliendPlayer().id;
			}
			await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('playerInfoList', {
				playerInfo: playerInfoDummy,
				dealerPlayerId : dealerPlayerId,
				smallBlindPlayerId : smallBlindPlayerId,
				bigBlindPlayerId : bigBlindPlayerId
			});
			return room;
		}
		catch (error) {
			console.log('Error in broadcastPlayerInfo : ' + error);
			return new Error('Error in broadcastPlayerInfo');
		}
	},
}

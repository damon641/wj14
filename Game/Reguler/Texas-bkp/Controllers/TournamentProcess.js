var Sys = require('../../../../Boot/Sys');

module.exports = {

	startTournament: async function (data) {
		try {
 
			let tournament = await Sys.Game.Reguler.Texas.Services.TournamentServices.getById(data.tournamentId);
			if (!tournament) {
				return {	status: 'fail',	result: null,message: "Tournament not found",	statusCode: 401	};
            }

            // Save Tournament into RAM.
            Sys.Tournaments[tournament.id] = {
                blind_levels_rise_time : tournament.blind_levels_rise_time,
                breaks_time            : tournament.breaks_time,
                smallBlind             : tournament.stacks.minStack,
                bigBlind               : tournament.stacks.maxStack
            }

            // get tournament Player
            let playerDetails = [];
            for(let i=0;i< tournament.players.length;i++){
                let player = await Sys.Game.Reguler.Texas.Services.PlayerServices.getById(tournament.players[i]);
                let socket = await Sys.Game.Common.Services.SocketServices.getByPlayerID({ playerId :  player._id});
                // Join Player Socekt To Tournament 
                if(Sys.Io.sockets.connected[socket.socketId]){
                    //console.log("Player Socket Found.....")
                    Sys.Io.sockets.connected[socket.socketId].join(tournament.id);
                }
                

                playerDetails.push({
                  id  :  player.id,
                  socketId  :  socket.socketId, 
                  username  :  player.username, 
                  avatar    :  player.profilePicId, 
                  appid :  player.appid, 
                  autoBuyin :  false
                })
            }
            let tableMaxPlayer = 9;
            let roomCount = Math.ceil(parseInt(playerDetails.length)/tableMaxPlayer);
            // Create Empty Rooms
            let roomCounter = await Sys.Game.Reguler.Texas.Services.RoomServices.getCount();
            let roomObj = {
                isTournamentTable : true,
                tournamentType  : 'reguler',
                tournament      : tournament.id,
                name            : tournament.name,
                smallBlind      : tournament.stacks.minStack,
                bigBlind        : tournament.stacks.maxStack,
                smallBlindIndex : 0,
                bigBlindIndex   : 0,
                minPlayers      : 2,
                maxPlayers      : tableMaxPlayer,
                rackPercent     : 0,
                minBuyIn        : 0,
                maxBuyIn        : 0,
                tableNumber     : 'T1',
                status          : "Waiting",
                owner           : 'admin',
                dealer          : 0,
                turnBet         : [],
                players         : [],
                gameWinners     : [],
                gameLosers      : [],
                game            : null,
                currentPlayer   : 0,
                limit           : 'limit',
                tableType       : 'texas',
                timerStart      : false
            }

            // Push Player in Room;
            let nextRoom = true;
            let roomIds = [];
            for(let i=0;i<roomCount;i++){
                roomObj.tableNumber = "T"+roomCounter++;
                  let room = await Sys.Game.Reguler.Texas.Services.RoomServices.create(roomObj);
                    if (!room) {	return {	status: 'fail',	result: room,	message: 'issue with room',statusCode: 400	};
                    }
                    roomIds.push(room.id);

                for(let j=0;j<tableMaxPlayer;j++){
                    // Check is Remian Player is 4
                    if(playerDetails.length <= 4 && nextRoom == true){
                        nextRoom = false;
                        break;
                    }else{
                        if(playerDetails.length != 0){

                            // Add Last Player To Room.
                            await room.AddPlayer(playerDetails[playerDetails.length-1].id, playerDetails[playerDetails.length-1].socketId,playerDetails[playerDetails.length-1].username, playerDetails[playerDetails.length-1].avatar, playerDetails[playerDetails.length-1].appid, tournament.buy_in, j, playerDetails[playerDetails.length-1].autoBuyin);  

                            // Remove Last Player
                            playerDetails.splice(playerDetails.length-1,1);
                        }
                    }
                }
               
                room = await Sys.Game.Reguler.Texas.Services.RoomServices.update(room);
                
            }

            // Update Tournament 
             await Sys.Game.Reguler.Texas.Services.TournamentServices.updateTourData({_id: tournament.id},{status:'Running',rooms:roomIds, tournamentWinners : [],tournamentLosers : []});

            console.log("Let's Start Tournnament......",tournament.id);

            let timer = 60;
            Sys.Timers[tournament.id] = setInterval(async function(){
                timer--;
                console.log("Wait For Start Tournament : ",timer)
                // Player Click on Accept / Reject Button. when Click on Accept button then send us playerId with TournamentId & we Join Player to his room.
                // JoinTournamet Event with tournamtId+playerId
                Sys.Io.to(tournament.id).emit('OnTournamentStart', {
                    tournamentId: tournament.id,
                    type : 'reguler',
                    message : 'Your Tournament is Starting In ',
                    timer : timer,
                    maxTimer :  10
                });
                if(timer < 1){
                    clearTimeout(Sys.Timers[tournament.id]);
                    for(let i=0;i<roomIds.length;i++){
                        let room = await Sys.Game.Reguler.Texas.Services.RoomServices.get(roomIds[i]);
                        console.log('Tournament Room Started.....');
                        room.breakTime = new Date().getTime();
                        room.StartGame();
                    }

                    // Blind Level Raised Broadcast..
                    let blindTimer = new Date().getTime();
                    Sys.Timers[tournament.id] = setInterval(async function(){

                        let current = new Date().getTime();
                        let difference = current - blindTimer;
                        let minutesDifference = Math.floor(difference/1000/60);
                        let secondsDifference = Math.floor(difference/1000);
                        for(let i=0;i<roomIds.length;i++){
                            await Sys.Io.of(Sys.Config.Namespace.CashRegularTexas).to(roomIds[i]).emit('OnBlindLevels', {
                                current : {
                                        smallBlind : Sys.Tournaments[tournament.id].smallBlind,
                                        bigBlind :  Sys.Tournaments[tournament.id].bigBlind
                                },
                                next : {
                                        smallBlind : parseInt( Sys.Tournaments[tournament.id].smallBlind * 2),
                                        bigBlind :  parseInt( Sys.Tournaments[tournament.id].bigBlind * 2)
                                },
                                remain : parseInt(parseInt(Sys.Tournaments[tournament.id].blind_levels_rise_time * 60) - parseInt(secondsDifference))
                            });
                        }
                     



                        if(minutesDifference >= parseInt(Sys.Tournaments[tournament.id].blind_levels_rise_time)){
                            console.log("--------------------------------------------")
                            console.log("Blind Levels Raised :")
                            console.log("--------------------------------------------")
                            blindTimer = new Date().getTime();
                            Sys.Tournaments[tournament.id].smallBlind = parseInt( Sys.Tournaments[tournament.id].smallBlind * 2);
                            Sys.Tournaments[tournament.id].bigBlind = parseInt( Sys.Tournaments[tournament.id].bigBlind * 2);
                            for(let i=0;i<roomIds.length;i++){
                                
                               // let room = await Sys.Game.Reguler.Texas.Services.RoomServices.get(roomIds[i]);
                              
                                console.log("--------------------------------------------")
                                console.log("Room ID :",roomIds[i])
                                console.log("Small Blind :",Sys.Tournaments[tournament.id].smallBlind)
                                console.log("Big Blind :",Sys.Tournaments[tournament.id].bigBlind)
                                console.log("--------------------------------------------")

                             
                                await Sys.Io.of(Sys.Config.Namespace.CashRegularTexas).to(roomIds[i]).emit('OnBlindLevelsRaised', {
                                    tournamentId: tournament.id,
                                    type : 'reguler',
                                    message : 'Table Blind Level Raised. ',
                                    roomId : roomIds[i],
                                    smallBlind : Sys.Tournaments[tournament.id].smallBlind,
                                    bigBlind :  Sys.Tournaments[tournament.id].bigBlind
                                });  
                                
                            }
                        }
                    }, 1000);

                }
            }, 1000);
		return tournament;

		} catch (e) {
			console.log("Error: ", e);
		}
    },

    joinTournament: async function (data) {
		try {
 
			let tournament = await Sys.Game.Reguler.Texas.Services.TournamentServices.getById(data.tournamentId);
			if (!tournament) {
				return {	status: 'fail',	result: null,message: "Tournament not found",	statusCode: 401	};
            }
            let playerRoom = null;
            for(let i=0;i<tournament.rooms.length;i++){

                let room = await Sys.Game.Reguler.Texas.Services.RoomServices.get(tournament.rooms[i]);
                if (!room) {	
                    return {	status: 'fail',	result: room,	message: 'issue with room',statusCode: 400	};
                }
                for(let j=0;j<room.players.length;j++){
                    if(room.players[j].id == data.playerId){
                        playerRoom = room;
                        break;   
                    }
                }

              if(playerRoom){
                break;
              }
              
          }
		return playerRoom;

		} catch (e) {
			console.log("Error: ", e);
		}
    },

    finishTournament: async function (roomId,tournamentId) {
		try {
            clearTimeout(Sys.Timers[tournamentId]);
            console.log("<<======= Tournament Finished =======>>");
			let tournament = await Sys.Game.Reguler.Texas.Services.TournamentServices.getById(tournamentId);
			if (!tournament) {
				return {	status: 'fail',	result: null,message: "Tournament not found",	statusCode: 401	};
			}
            
            let payOutRecords = await Sys.Game.Reguler.Texas.Services.pricePoolServices.getPricePoolDataSelect( {maxPlayers: { $gte:  tournament.players.length} } );
                if(payOutRecords[0]){
                    let prisePoolArray = [];
                    for (let [key, value] of Object.entries(payOutRecords[0].toObject())) {
                      if(value == 0){  break; }
                      if(key.includes('place_')){
                        prisePoolArray.push({
                          key : key,
                          value : value
                        })
                      }
                    }
               
                    let playout = [];
                    for(let i=0; i < prisePoolArray.length ; i++){
                      var expArry = prisePoolArray[i].key.split("place_");
                      if(expArry[1].includes('_')){
                        let subArry = expArry[1].split("_");
                        for(let j=subArry[0];j<=subArry[1];j++){
                          playout.push(prisePoolArray[i].value);
                        }
                      }else{
                        playout.push(prisePoolArray[i].value);
                      }
                    } 

                    let totalPayout = parseInt(tournament.buy_in * tournament.players.length);
                    console.log("totalPayout ->",totalPayout);
                    let first = true;
                    for(let i = 0; i < playout.length; i++){
              
                        let player = await Sys.Game.Reguler.Texas.Services.PlayerServices.getById(tournament.tournamentLosers[tournament.tournamentLosers.length-(i+1)]);
                        
                        let pay = parseInt(totalPayout*playout[i]/100);

                        if(first){
                            first = false;
                            await Sys.Io.of(Sys.Config.Namespace.CashRegularTexas).to(roomId).emit('RegularTournamentFinished',{
                                id        :  player.id,
                                username  :  player.username, 
                                avatar    :  player.profilePicId, 
                                winningChips : pay
                            });
                            console.log("First Winner :",player.username);
                        }                
                        tournament.tournamentWinners.push({
                          id        :  player.id,
                          username  :  player.username, 
                          avatar    :  player.profilePicId, 
                          winningChips : pay
                        });
                  
                        // Update Player Chips
                        await Sys.Game.Reguler.Texas.Services.PlayerServices.update(player.id,{ chips: parseInt(player.chips) + parseInt(pay)});


                    }
        
                    //Clear Room & other data.
                    for(let i=0;i<tournament.rooms.length;i++){
                        console.log("Clear Room :",tournament.rooms[i])
                        let room = await Sys.Game.Reguler.Texas.Services.RoomServices.get(tournament.rooms[i]);
                        room.status = 'Closed';
                        room.game = null; 
                        room = await Sys.Game.Reguler.Texas.Services.RoomServices.update(room);
                    }
                    clearTimeout(Sys.Timers[tournamentId]);
                    console.log("/****************************************************************/")
                    console.log("Congratulation Your Tournamet Finished.... Thanks.")
                    console.log("Tournament Winners :")
                    console.log(tournament.tournamentWinners);
                    console.log("/****************************************************************/")
                   
                    await Sys.Game.Reguler.Texas.Services.TournamentServices.updateTourData({_id: tournamentId},{status:'Finished',tournamentWinners : tournament.tournamentWinners});
                }else{
                    console.log('No Playout Found!')
                } 
 
        return tournament;

		} catch (e) {
			console.log("Error: ", e);
		}
    },

}

 

var Sys = require('../../../../Boot/Sys');

module.exports = {

	startTournament: async function (data) {
		try {
            // 
			let tournament = await Sys.Game.Sng.Omaha.Services.TournamentServices.getById(data.tournamentId);
            let blinds = await Sys.Game.Common.Services.blindLevelsServices.getBlindLevelsData(tournament.blindLevels);
			if (!tournament) {
				return {status: 'fail',	result: null,message: "Tournament not found",	statusCode: 401	};
            }

            Sys.BlindTime[tournament.id] = 0;
            // Save Tournament into RAM.
            Sys.Tournaments[tournament.id] = {
                blind_levels_rise_time : tournament.blind_levels_rise_time,
                breaks_time            : tournament.breaks_time,
                smallBlind             : parseFloat(blinds[0].blindLevels[0].minBlind),
                bigBlind               : parseFloat(blinds[0].blindLevels[0].maxBlind)
            }
            
            let room = await Sys.Game.Sng.Omaha.Services.RoomServices.get(data.roomId);
			if (!room) {
				return {status: 'fail',	result: null,message: "Room not found",	statusCode: 401	};
            }
            
            // get tournament Player
            console.log("Before Player Get.......",room.id);

            for(let i=0;i< room.players.length;i++){
           
                //let socket = await Sys.Game.Common.Services.SocketServices.getByPlayerID({ playerId :  room.players[i].id});
                // Join Player Socekt To Tournament 
                let player = await Sys.Game.Sng.Omaha.Services.PlayerServices.getById(room.players[i].id);
                console.log("Player Socket Found id.....",player.socketId)
                if(Sys.Io.sockets.connected[player.socketId]){
                    console.log("Player Socket Found.....")
                    Sys.Io.sockets.connected[player.socketId].join(tournament.id);
                }
                // Socket ID
                room.players[i].socketId = player.socketId;
            }
           
            console.log("After Player Get.......");

 
             
            let roomObj = {
                isTournamentTable   : true,
                tournamentType      : 'sng',
                tournament          : tournament.id,
                name                : tournament.name,
                gameType            : tournament.gameType,
                smallBlind          : tournament.stacks.minStack,
                bigBlind            : tournament.stacks.maxStack,
                smallBlindIndex     : 0,
                bigBlindIndex       : 0,
                minPlayers          : tournament.min_players,
                maxPlayers          : tournament.max_players,
                rackPercent         : 0,
                minBuyIn            : 0,
                maxBuyIn            : 0,
                tableNumber         : 'SPT',
                status              : "Waiting",
                owner               : 'admin',
                dealer              : 0,
                turnBet             : [],
                players             : [],
                gameWinners         : [],
                gameLosers          : [],
                game                : null,
                currentPlayer       : 0,
                limit               : tournament.game,
                tableType           : 'omaha',
                timerStart          : false
            }

            // Create new Clone Of Tournament.
            //let cloneRoom = await Sys.Game.Sng.Omaha.Services.RoomServices.create(roomObj);
            //if (!cloneRoom) {	return {	status: 'fail',	result: room,	message: 'issue with room',statusCode: 400	};}
             

            // Update Tournament 
            await Sys.Game.Sng.Omaha.Services.TournamentServices.updateTourData({_id: tournament.id},{status:'Running'});

            console.log("Let's Start Tournnament......",tournament.id);

            let timer = 10;
            Sys.Timers[tournament.id] = setInterval(async function(room){
                timer--;
                console.log("Wait For Restart : ",timer)
                // Player Click on Accept / Reject Button. when Click on Accept button then send us playerId with TournamentId & we Join Player to his room.
                // JoinTournamet Event with tournamtId+playerId
                Sys.Io.to(tournament.id).emit('OnSngTournamentStart', {
                    tournamentId: tournament.id,
                    //roomId : room.id,
                    namespaceString: Sys.Config.Namespace.CashSngOmaha,
                    pokerGameType: tournament.gameType,
                    pokerGameFormat: 'tournament',
                    type : 'sng',
                    message : 'Your Tournament is Starting In ',
                    timer : timer,
                    maxTimer :  10
                });
                
                console.log("Room ID =================", room.id);
                if(timer < 1){
                    console.log("Room ID", room.id);
                    clearTimeout(Sys.Timers[tournament.id]);
                    console.log("Room ID ->>>>>>>>>>>");
                    console.log("Room ID", room.id);
                    room = await Sys.Game.Sng.Omaha.Services.RoomServices.get(room.id);
                    console.log('Sng Tournament Room Started.....');
                    room.breakTime = new Date().getTime();
                    room.StartGame();

                     // Blind Level Raised Broadcast..
                    await module.exports.startBlindTimer(tournament,[room.id]);
                }
            }, 1000,room);
		return tournament;

		} catch (e) {
			console.log("Error: ", e);
		}
    },

    joinTournament: async function (data) {
		try {
 
			let tournament = await Sys.Game.Sng.Omaha.Services.sngTournamentServices.getById(data.tournamentId);
			if (!tournament) {
				return {	status: 'fail',	result: null,message: "Tournament not found",	statusCode: 401	};
            }
            let playerRoom = null;
            for(let i=0;i<tournament.rooms.length;i++){

                let room = await Sys.Game.Sng.Omaha.Services.RoomServices.get(tournament.rooms[i]);
         
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

    startBlindTimer : async function(tournament,newRoomIds){
        running = true;
        let newBlinds = await Sys.Game.Common.Services.blindLevelsServices.getBlindLevelsData(tournament.blindLevels);
        Sys.Timers[tournament.id] = setInterval(async function(){
            Sys.BlindTime[tournament.id]++;

            for(let i = 0; i < newRoomIds.length;i++){
                let room = await Sys.Game.Sng.Omaha.Services.RoomServices.get(newRoomIds[i]);
                Sys.Tournaments[tournament.id].smallBlind = (room.currentBlindIndex  < newBlinds[0].blindLevels.length ) ? parseFloat(newBlinds[0].blindLevels[room.currentBlindIndex].minBlind) : parseFloat(newBlinds[0].blindLevels[newBlinds[0].blindLevels.length - 1].minBlind);
                Sys.Tournaments[tournament.id].bigBlind =  (room.currentBlindIndex < newBlinds[0].blindLevels.length ) ? parseFloat(newBlinds[0].blindLevels[room.currentBlindIndex].maxBlind)  : parseFloat(newBlinds[0].blindLevels[newBlinds[0].blindLevels.length - 1].maxBlind);
                await Sys.Io.of(Sys.Config.Namespace.CashSngOmaha).to(newRoomIds[i]).emit('OnBlindLevels', {
                  roomId: newRoomIds[i],
                  current : {
                          smallBlind : (room.currentBlindIndex  < newBlinds[0].blindLevels.length ) ? parseFloat(newBlinds[0].blindLevels[room.currentBlindIndex].minBlind) : parseFloat(newBlinds[0].blindLevels[newBlinds[0].blindLevels.length - 1].minBlind),
                          bigBlind :  (room.currentBlindIndex < newBlinds[0].blindLevels.length ) ? parseFloat(newBlinds[0].blindLevels[room.currentBlindIndex].maxBlind)  : parseFloat(newBlinds[0].blindLevels[newBlinds[0].blindLevels.length - 1].maxBlind)
                  },
                  next : {
                    smallBlind : (room.currentBlindIndex  < newBlinds[0].blindLevels.length ) ? parseFloat(newBlinds[0].blindLevels[room.currentBlindIndex].minBlind) : parseFloat(newBlinds[0].blindLevels[newBlinds[0].blindLevels.length - 1].minBlind),
                    bigBlind :  (room.currentBlindIndex  < newBlinds[0].blindLevels.length ) ? parseFloat(newBlinds[0].blindLevels[room.currentBlindIndex].maxBlind)  : parseFloat(newBlinds[0].blindLevels[newBlinds[0].blindLevels.length - 1].maxBlind)
                  },
                  remain : parseFloat(parseFloat(Sys.Tournaments[tournament.id].blind_levels_rise_time * 60) - parseFloat(Sys.BlindTime[tournament.id]))
                });
            }

            var divisor_for_minutes = Sys.BlindTime[tournament.id] % (60 * 60);
            var minutes = Math.floor(divisor_for_minutes / 60);

            if(minutes >= parseFloat(Sys.Tournaments[tournament.id].blind_levels_rise_time)){
                console.log("--------------------------------------------")
                console.log("Blind Levels Raised :")
                console.log("--------------------------------------------")
                Sys.BlindTime[tournament.id] = 0;
                let room;
                for(let i=0;i<newRoomIds.length;i++){
                  room = await Sys.Game.Sng.Omaha.Services.RoomServices.get(newRoomIds[i]);
                  room.currentBlindIndex++;
                  
                    console.log("--------------------------------------------")
                    console.log("Room ID :",newRoomIds[i])
                    console.log("Small Blind :",Sys.Tournaments[tournament.id].smallBlind)
                    console.log("Big Blind :",Sys.Tournaments[tournament.id].bigBlind)
                    console.log("--------------------------------------------")

                 
                    await Sys.Io.of(Sys.Config.Namespace.CashSngOmaha).to(newRoomIds[i]).emit('OnBlindLevelsRaised', {
                        tournamentId: tournament.id,
                        type : 'reguler',
                        message : 'Table Blind Level Raised. ',
                        roomId : newRoomIds[i],
                        smallBlind : (room.currentBlindIndex  < newBlinds[0].blindLevels.length ) ? parseFloat(newBlinds[0].blindLevels[room.currentBlindIndex].minBlind) : parseFloat(newBlinds[0].blindLevels[newBlinds[0].blindLevels.length - 1].minBlind),
                        bigBlind :  (room.currentBlindIndex  < newBlinds[0].blindLevels.length ) ? parseFloat(newBlinds[0].blindLevels[room.currentBlindIndex].maxBlind)  : parseFloat(newBlinds[0].blindLevels[newBlinds[0].blindLevels.length - 1].maxBlind),
                        roomId:newRoomIds[i] 
                    });  
                    
                }
                room = await Sys.Game.Sng.Omaha.Services.RoomServices.update(room);
            }

        },1000);
    },

    stopBlindTimer : async function(tournament){
      running = false;
      clearInterval(Sys.Timers[tournament.id]);
    },
    
   /* joinTournament: async function (data) {
		try {
 
			let tournament = await Sys.Game.Sng.Omaha.Services.sngTournamentServices.getById(data.tournamentId);
			if (!tournament) {
				return {	status: 'fail',	result: null,message: "Tournament not found",	statusCode: 401	};
            }
            let playerRoom = null;
            for(let i=0;i<tournament.rooms.length;i++){

                let room = await Sys.Game.Sng.Omaha.Services.RoomServices.get(tournament.rooms[i]);
         
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
    },*/
}
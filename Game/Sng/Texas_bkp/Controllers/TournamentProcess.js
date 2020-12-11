var Sys = require('../../../../Boot/Sys');

module.exports = {

	startTournament: async function (data) {
		try {
            // 
			let tournament = await Sys.Game.Sng.Texas.Services.TournamentServices.getById(data.tournamentId);
			if (!tournament) {
				return {status: 'fail',	result: null,message: "Tournament not found",	statusCode: 401	};
            }
            
            let room = await Sys.Game.Sng.Texas.Services.RoomServices.get(data.roomId);
			if (!room) {
				return {status: 'fail',	result: null,message: "Room not found",	statusCode: 401	};
            }
            
            // get tournament Player
            console.log("Before Player Get.......",room.id);

            for(let i=0;i< room.players.length;i++){
           
                let socket = await Sys.Game.Common.Services.SocketServices.getByPlayerID({ playerId :  room.players[i].id});
                // Join Player Socekt To Tournament 
                if(Sys.Io.sockets.connected[socket.socketId]){
                    console.log("Player Socket Found.....")
                    Sys.Io.sockets.connected[socket.socketId].join(tournament.id);
                }
                // Socket ID
                room.players[i].socketId = socket.socketId;
            }
           
            console.log("After Player Get.......");

 
             
            let roomObj = {
                isTournamentTable   : true,
                tournamentType      : 'sng',
                tournament          : tournament.id,
                name                : tournament.name,
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
                limit               : 'limit',
                tableType           : 'texas',
                timerStart          : false
            }

            // Create new Clone Of Tournament.
            let cloneRoom = await Sys.Game.Sng.Texas.Services.RoomServices.create(roomObj);
            if (!cloneRoom) {	return {	status: 'fail',	result: room,	message: 'issue with room',statusCode: 400	};}
             

            // Update Tournament 
            await Sys.Game.Sng.Texas.Services.TournamentServices.updateTourData({_id: tournament.id},{status:'Running'});

            console.log("Let's Start Tournnament......",tournament.id);

            let timer = 10;
            Sys.Timers[tournament.id] = setInterval(async function(room){
                timer--;
                console.log("Wait For Restart : ",timer)
                // Player Click on Accept / Reject Button. when Click on Accept button then send us playerId with TournamentId & we Join Player to his room.
                // JoinTournamet Event with tournamtId+playerId
                Sys.Io.to(tournament.id).emit('OnSngTournamentStart', {
                    tournamentId: tournament.id,
                    roomId : room.id,
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
                    room = await Sys.Game.Sng.Texas.Services.RoomServices.get(room.id);
                    console.log('Sng Tournament Room Started.....');
                    room.StartGame();
                }
            }, 1000,room);
		return tournament;

		} catch (e) {
			console.log("Error: ", e);
		}
    },
     
}
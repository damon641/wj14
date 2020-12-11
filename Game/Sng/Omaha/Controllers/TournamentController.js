var Sys = require('../../../../Boot/Sys');

module.exports = {

	startTournament: async function (data){
		try {
			await Sys.Game.Sng.Omaha.Controllers.TournamentProcess.startTournament(data);
			console.log("After....");
		}
		catch (error) {
			console.log('Error in startTournament : ', error);
			return new Error(error);
		}
	},
	
	 
	joinTournament: async function (socket, data){
		try {
			
			let room = await Sys.Game.Sng.Omaha.Controllers.TournamentProcess.joinTournament(data);
		
			if(room instanceof Error){
				return { status: 'fail', result: null, message: room.message, statusCode: 401 }
			}
			if(!room){
				return { status: 'fail', result: null, message: 'Room not Found!', statusCode: 401 }
			}
			console.log("Room ID : ", room.id);

			// let minBuyIn = 0;
			// let maxBuyIn = 0;
			// //console.log("Limit Type : ",room.limit);
			// if(room.limit == 'limit'){
			// 	// Limit Game
			// 	minBuyIn = parseFloat(parseFloat(room.bigBlind) * 10); // minimun Buy in Amount 
			// 	maxBuyIn = 0; // No Limit in Max Buyin Game.
			// }else if(room.limit == 'no_limit'){
			// 	// No Limit
			// 	minBuyIn = parseFloat(parseFloat(room.bigBlind) * 40);
			// 	maxBuyIn = parseFloat(parseFloat(room.bigBlind) * 100);
			// }else{
			// 	// Pot Limit
			// 	minBuyIn = parseFloat(parseFloat(room.bigBlind) * 40);
			// 	maxBuyIn = parseFloat(parseFloat(room.bigBlind) * 100);
			// }
 

			return {
				status: 'success',
				message: "Player Room Joind successfuly.",
				result: {
					roomId: room.id,
					namespaceString: (room.tableType == 'texas') ? Sys.Config.Namespace.CashSngTexas : Sys.Config.Namespace.CashSngOmaha,
					pokerGameType: room.tableType,
                 	pokerGameFormat: 'sng'
					// tableNumber : room.tableNumber,
					// limitType : room.limit,
					// minBuyIn : minBuyIn,
					// maxBuyIn : maxBuyIn,
					//smallBlind : room.smallBlind,
					//bigBlind : room.bigBlind
				 
				}
			};
		}
		catch (error) {
			console.log('Error in JoinRoom : ', error);
			return new Error('Error in JoinRoom', error);
		}
	},

}

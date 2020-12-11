var Sys = require('../../../../Boot/Sys');

module.exports = {

	startTournament: async function (data){
		try {
			await Sys.Game.Sng.Texas.Controllers.TournamentProcess.startTournament(data);
			console.log("After....");
		}
		catch (error) {
			console.log('Error in startTournament : ', error);
			return new Error(error);
		}
	},
	
	 
}

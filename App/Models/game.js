const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var Sys = require('../../Boot/Sys');

const GameSchema = new Schema({
				roomId: {
				type: 'string',
				ref: 'room',
				required: true
			},
			isTournamentTable    : { type: 'boolean', default : false }, // if is Tournament Room So Set True.
			tournamentType    : { type: 'string', default : '-' }, // sng / regular
			tournament    : { type: 'string', default : '' }, // Tournament Id
			gameType      : { type: 'string', default: 'texas' }, // texas / omaha
			tableType     : { type: 'string', default: 'normal' }, // normal / fast table
			isCashGame    : { type: 'boolean', default : true }, // true / false
			currencyType  : { type: 'string', default: 'cash' }, // btc/ doller/ cash
			otherData     : Schema.Types.Mixed , // Store Some other Data
			gameTotalChips:{type: 'number',
			default: 0},
			tableName: {
				type: 'string'
			},
			gameNumber: {
				type: 'string'
			},
			smallBlind: {
				type: 'number',
				default: 0
			},
			bigBlind: {
				type: 'number',
				default: 0
			},
			status: {
				type: 'string',
				default: ''
			},
			pot: {
				type: 'number',
				default: 0
			},
			roundName: {
				type: 'string',
				default: ''
			},
			betName: {
				type: 'string',
				default: ''
			},
			bets: {
				type: 'array',
				default: []
			},
			roundBets: {
				type: 'array',
				default: []
			},
			deck: {
				type: 'array',
				default: []
			},
			board: {
				type: 'array',
				default: []
			},
			history: {
				type: 'array',
				default: []
			},
			players: {
				type: 'array',
				default: []
			},
			winners: {
				type: 'array',
				default: []
			},
			sidePotAmount:{
				type: 'array',
				default: []
			},
			playerSidePot:{
				type: 'array',
				default: []
			},
			gamePot:{
				type: 'array',
				default: []
			},
			gameRevertPoint :{
				type: 'array',
				default: []
			},
			gameMainPot: {
				type: 'number',
				default: 0
			},
			rakePercenage: {
				type: 'number',
				default: 0
			},
			rakeDistribution:{
				type: 'array',
				default: []
			},
			rakeCap:{
				type: 'array',
				default: []
			},
			winnerDetails:{
				type: 'array',
				default: []
			},
			adminExtraRakePercentage: {
				type: 'number',
				default: 0
			},
			updatedAt : { type: Date, default: Date.now() },
			createdAt : { type: Date, default: Date.now() }
},{ collection: 'game',versionKey: false });

GameSchema.pre('save', async function(next) {
	try {
		console.log("preSave");
		if (this.isTournamentTable == false) {
			const data = await Sys.App.Services.RoomServices.getRoomDataColumns({_id:this.roomId},['name']);
			this.tableName = (data.length > 0) ? data[0].name : '-'
		} else {
			if (this.tournamentType == 'regular') {
				const data = await Sys.App.Services.TournamentServices.getTourDataColumns({_id:this.tournament},['name']);
				this.tableName = (data.length > 0) ? data[0].name : '-'
			} else {
				const data = await Sys.App.Services.sngTournamentServices.getSngTourDataColumns({_id:this.tournament},['name']);
				this.tableName = (data.length > 0) ? data[0].name : '-'
			}
		}
	  next();
	} catch (error) {
	  console.log(error);
	}
  });
mongoose.model('game', GameSchema);

 

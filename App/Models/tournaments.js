const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const TournamentSchema = new Schema({
			 name: {
                type: 'string',
                required: true
            },            
            buy_in: {
            	type: 'number',
            	required: true
				},
				stacks_chips: {
            	type: 'number',
            	required: true
            },
            entry_fee: {
				type: 'number',
				required: true
            },
            fee: {
				type: 'string',
				required: true
            },
            rebuy_time: {
            	type: 'number',
            	// required: true
            },
            breaks_time: {
            	type: 'number',
            	required: true
			},
			gameType : { 
				type: 'string', 
				default: 'texas'
			},
			limit : { 
				type: 'string',
			},
            game_speed: {
            	type: 'string',
            	required: true
            },
            min_players: {
				type: 'number',
				required: true
            },
            max_players: {
				type: 'number',
				required: true
            },
            register_from_date_time: {
				type: Date,
		    timezone: 'Europe/Lisbon',
				required: true
            },
            tournament_date_time: {
				type: Date,
		    timezone: 'Europe/Lisbon',
				required: true
			},
            description: {
				type: 'string',
				required: true
			},
			blind_levels_rise_time: {
				type: 'number',
				required: true
			},
			status: {
				type: 'string',
				required: true
			},
			players: {
				type: 'array',
				defaultsTo: []
			},
			rooms: {
				type: 'array',
				defaultsTo: []
			},
			tournamentLosers: {
				type: 'array',
				defaultsTo: []
			},
			tournamentWinners: {
				type: 'array',
				defaultsTo: []
			},playersSestionIds: {
				type: 'array',
				defaultsTo: []
			},
			tournamentTotalChips:{
				type:"number",
				default:"0"
			},
			notification:{
				type: 'string',
			},
			isDelete:{
				type:"boolean",
				default:false
			},
			tournamentNumber: {
				type: 'string'
			},

			blindLevels : { type: Schema.Types.ObjectId, ref: 'blindLevels' },
			isCashGame    : { type: 'boolean', default : true }, // true / false
			isFreeRoll: { type: 'boolean', default: false },
			createdAt : { type: Date, default: Date.now() },
			updatedAt : { type: Date, default: Date.now() },
	},{ collection: 'regularTournaments',versionKey: false  });
mongoose.model('regularTournaments', TournamentSchema);
 

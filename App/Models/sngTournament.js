const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SngTournamentSchema = new Schema({
			 name: {
                type: 'string',
                required: true
            },
            game:{ 
				type: 'string',
            	required: true
			},
			gameType : { 
				type: 'string', 
				
			},
            stacks:  { type: Schema.Types.ObjectId, ref: 'stacks' },
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

            breaks_time: {
            	type: 'number',
            	required: true
            },
            game_speed: {
            	type: 'string',
            	required: true
            },
            // min_players: {
			// 	type: 'number',
			// 	required: true
            // },
            max_players: {
				type: 'number',
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
			},
			tournamentTotalChips:{
				type:"number",
				default:"0"
			},
			isDelete:{
				type:"boolean",
				default:false
			},
			tournamentNumber: {
				type: 'string'
			},
			playersSestionIds: {
				type: 'array',
				defaultsTo: []
			},
			blindLevels : { type: Schema.Types.ObjectId, ref: 'blindLevels' },
			isCashGame    : { type: 'boolean', default : true }, // true / false
			isFreeRoll: { type: 'boolean', default: false },
	},{ collection: 'sngTournaments',versionKey: false });
mongoose.model('sngTournaments', SngTournamentSchema);
 

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const RoomSchema = new Schema({
  name          : { type: 'string', required: true },
  tableNumber   : { type: 'string', required: true },
  isTournamentTable    : { type: 'boolean', default : false }, // if is Tournament Room So Set True.
  tournamentType    : { type: 'string', default : '-' }, // sng / regular
  tournament    : { type: 'string', default : '' }, // Tournament Id
  gameType      : { type: 'string', default: 'texas' }, // texas / omaha
  tableType     : { type: 'string', default: 'normal' }, // normal / fast table
  isCashGame    : { type: 'boolean', default : true }, // true / false
  currencyType  : { type: 'string', default: 'cash' }, // btc/ doller/ cash
  otherData     : Schema.Types.Mixed , // Store Some other Data
  dealer		    : { type: 'number', required: true },
  smallBlind    : { type: 'number', required: true },
  bigBlind	    : { type: 'number', required: true },
  smallBlindIndex  : { type: 'number', required: true },
  bigBlindIndex    : { type: 'number', required: true },
  minPlayers    : { type: 'number', required: true },
  maxPlayers    : { type: 'number', required: true },
  minBuyIn      : { type: 'number' },
  maxBuyIn      : { type: 'number' },
  isFull	      : { type: 'boolean' },
  rackPercent   : { type: 'number' },
  expireTime    : { type: 'string' },
  type          : { type: 'string' }, // diamond / chips
  owner         : { type: 'string' }, // admin or user
  limit         : { type: 'string' },
  currentPlayer : { type: 'number', allowNull: true },
  players       : { type: 'array' },
  waitingPlayers: { type: 'array' },
  gameWinners   : { type: 'array' },
  gameLosers    : { type: 'array' },
  turnBet       : { type: 'array' },
  turnTime      : { type: Number},
  timerStart    : { type: 'boolean' },
  status        : { type: 'string' }, // closed for deleted rooms
  tablePrivacy  : { type: 'string', default : 'public'  }, // public and private
  tablePassword : { type: 'string', default : '' }, // if table type private password enter other wise null
  game          : { type: Schema.Types.ObjectId, ref: 'game' },
  oldPlayers: { type: 'array' },
  isGPSRestriction :{ type: 'boolean',default: false },
  isIPAddressRestriction :{ type: 'boolean',default:false },
  radiousPoint: {type:'number',default:0},
  currentBlindIndex: {type:'number'},
  timeBank: {type: 'number',default: 0}
  // club		      : [{ type: Schema.Types.ObjectId, ref: 'user' }],

},{ 
  collection: 'room',
  versionKey: false
});
mongoose.model('room', RoomSchema);

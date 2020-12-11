'use strict';
var Sys = require('../../../Boot/Sys');

const mongoose = require('mongoose');
const playerGameHistoryModel  = mongoose.model('playerGameHistory');

module.exports = {
     
    findRunningGame: async function(playerId){
        try {   
            return await playerGameHistoryModel.find({ player : mongoose.Types.ObjectId(playerId),status : 'Running'}).populate('room');
        } catch (error) {
            Sys.Log.info('Error in find Running Game  : ' + error);
            return error;
        }
    },
}

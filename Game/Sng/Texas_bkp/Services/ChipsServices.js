'use strict';
var Sys = require('../../../../Boot/Sys');

const mongoose = require('mongoose');
const chipModel  = mongoose.model('chipsHistory');
// const gameModel  = mongoose.model('game');

module.exports = {

    create: async function(data){
        try {
          let gameSave = new chipModel(data);
          game = await chipModel.save()
			    return  await chipModel.find(data);
        } catch (error) {
            Sys.Log.info('Room Service Error in getByData : ' + error);
        }
    },

}

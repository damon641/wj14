'use strict';

const mongoose = require('mongoose');
var Sys = require('../../Boot/Sys');
const blindLevelsModel  = mongoose.model('blindLevels');


module.exports = {

    deleteBlindLevelsData: async function(data){
        try {
            await blindLevelsModel.deleteOne({_id: data});
        } catch (e) {
            console.log("Error",e);
        }
    },

    getBlindLevelsData: async function(data){
        try {
            return  await blindLevelsModel.find(data);
        } catch (e) {
            console.log("Error",e);
        }
    },

    editBlindLevelsData: async function(data){
        try {
            return  await blindLevelsModel.findOne({_id: data});
        } catch (e) {
            console.log("Error",e);
        }
    },

    insertBlindLevelsData: async function(data){
        try {
            await blindLevelsModel.create(data);
        } catch (e) {
            console.log("Error",e);
        }
    },

    updateBlindLevelsData: async function(condition, data){
        try {
            await blindLevelsModel.updateOne(condition, data);
        } catch (e) {
            console.log("Error",e);
        }
    },
    updateParticularBlindLevelsData: async function(data){
        try {
          return await blindLevelsModel.updateMany(data);
        } catch (e) {
            console.log("Error",e);
        }
    },
}

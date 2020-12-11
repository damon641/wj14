'use strict';

const mongoose = require('mongoose');
var Sys = require('../../../Boot/Sys');
const sngTournamentModel  = mongoose.model('sngTournaments');


module.exports = {
  getById: async function(id){
    try {
        return  await sngTournamentModel.findById(id).populate('stacks');
    } catch (error) {
        Sys.Log.info('  get buy id  : ' + error);
    }
  },

	getTourData: async function(data){
        try {
          return  await sngTournamentModel.findOne(data);
        } catch (e) {
          console.log("Error",e);
        }
	 },

  getByData: async function(data){
        try {
          return  await sngTournamentModel.find(data);
        } catch (e) {
          console.log("Error",e);
        }
  },

  getSngTournamentCount: async function(data){
    try {
          return  await sngTournamentModel.countDocuments(data);
        } catch (e) {
          console.log("Error",e);
    }
  },

  updateTourData: async function(condition, data){
        try {
          await sngTournamentModel.update(condition, data);
        } catch (e) {
          console.log("Error",e);
        }
  },

  insertTourData: async function(data){
        try {
          return await sngTournamentModel.create(data);
        } catch (e) {
          console.log("Error",e);
        }
  },

  getTouDatatable: async function(query, length, start){
        try {
          return  await sngTournamentModel.find(query).populate('stacks').skip(start).limit(length);
        } catch (e) {
          console.log("Error",e);
        }
  },

  delete: async function(data){
        try {
          await sngTournamentModel.deleteOne({_id: data});
        } catch (e) {
          console.log("Error",e);
        }
  },


}

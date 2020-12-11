'use strict';

const mongoose = require('mongoose');
var Sys = require('../../../Boot/Sys');
const tournamentModel  = mongoose.model('regularTournaments');


module.exports = {


  getById: async function(id){
    try {
        return  await tournamentModel.findById(id).populate('stacks');
    } catch (error) {
        Sys.Log.info('  get buy id  : ' + error);
    }
  },

	getTourData: async function(data){
        try {
          return  await tournamentModel.findOne(data);
        } catch (e) {
          console.log("Error",e);
        }
	 },


  getByData: async function(data, select, setOption){
        try {
          return  await tournamentModel.find(data, select, setOption);
        } catch (e) {
          console.log("Error",e);
        }
  },

  getTournamentCount: async function(data){
    try {
          return  await tournamentModel.countDocuments(data);
        } catch (e) {
          console.log("Error",e);
    }
  },

  updateTourData: async function(condition, data){
        try {
          await tournamentModel.update(condition, data);
        } catch (e) {
          console.log("Error",e);
        }
  },

  insertTourData: async function(data){
        try {
          return await tournamentModel.create(data);
        } catch (e) {
          console.log("Error",e);
        }
  },

  getTouDatatable: async function(query, length, start){
        try {
          return  await tournamentModel.find(query).populate('stacks').skip(start).limit(length);
        } catch (e) {
          console.log("Error",e);
        }
  },

  delete: async function(data){
        try {
          await tournamentModel.deleteOne({_id: data});
        } catch (e) {
          console.log("Error",e);
        }
  },


}

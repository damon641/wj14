'use strict';

const mongoose = require('mongoose');
var Sys = require('../../Boot/Sys');
const sngTournamentModel  = mongoose.model('sngTournaments');


module.exports = {


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

  getPopulatedData: async function(query, select, setOption,populateWith){
    try {
      return  await sngTournamentModel.find(query,select, setOption).populate(populateWith);
    } catch (e) {
      console.log("Error",e);
      throw new Error('error in getPopulatedData'+ e.message);
    }
  },

  getSngTourDataColumns: async function(data,column){
    try{
      return await sngTournamentModel.find(data).select(column);
    }catch(e){
      console.log("Error in getSngTourDataColumns",e);
    }
  }

}

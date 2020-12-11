'use strict';

const mongoose = require('mongoose');
var Sys = require('../../Boot/Sys');
const tournamentModel  = mongoose.model('regularTournaments');


module.exports = {


	getTourData: async function(data){
        try {
          return  await tournamentModel.findOne(data);
        } catch (e) {
          console.log("Error",e);
        }
	 },

  getByData: async function(data){
        try {
          return  await tournamentModel.find(data);
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
          console.log("DATA OF SERVICE",data)
         return await tournamentModel.update(condition, data);
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
          return  await tournamentModel.find(query).populate('stacks').skip(start).limit(length).sort({createdAt:-1});
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

  getPopulatedData: async function(query, select, setOption,populateWith){
    try {
      return  await tournamentModel.find(query,select, setOption).populate(populateWith);
    } catch (e) {
      console.log("Error",e);
      throw new Error('error in getPopulatedData'+ e.message);
    }
  },

  getLastInsertedData: async function(){
    try{
      return  await tournamentModel.find({}).sort({_id:-1}).limit(1);
    }catch(e){
      console.log("Error",e)
    }
  },

  getTourDataColumns: async function(data,column){
    try{
      return await tournamentModel.find(data).select(column);
    }catch(e){
      console.log("Error in getTourDataColumns",e);
    }
  }

}

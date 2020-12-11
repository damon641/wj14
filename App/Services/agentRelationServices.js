'use strict';

const mongoose = require('mongoose');
var Sys = require('../../Boot/Sys');
const agentRelationModel  = mongoose.model('AgentRelation');


module.exports = {

	getByData: async function(data){
        //console.log('Find By Data:',data)
        try {
          return  await agentRelationModel.find(data);
        } catch (e) {
          console.log("Error",e);
        }
	},

  getAgentRelationData: async function(data){
        try {
          return  await agentRelationModel.find(data);
        } catch (e) {
          console.log("Error",e);
        }
	},

	getSingleAgentRelationData: async function(data){
        try {
          return  await agentRelationModel.findOne(data);
        } catch (e) {
          console.log("Error",e);
        }
	},

  getAgentRelationDatatable: async function(query, length, start){
        try {
          return  await agentRelationModel.find(query).skip(start).limit(length);
        } catch (e) {
          console.log("Error",e);
        }
	},

  insertAgentRelationData: async function(data){
        try {
          await agentRelationModel.create(data);
        } catch (e) {
          console.log("Error",e);
          throw e;
        }
	},

  deleteAgentRelation: async function(data){
        try {
          await agentRelationModel.deleteOne({_id: data});
        } catch (e) {
          console.log("Error",e);
        }
  },

  deleteAgent: async function(data){
        try {
          await agentRelationModel.deleteOne(data);
        } catch (e) {
          console.log("Error",e);
        }
  },

	updateAgentRelationData: async function(condition, data){
        try {
          await agentRelationModel.update(condition, data);
        } catch (e) {
          console.log("Error",e);
        }
	},

  getLimitAgentRelation: async function(data){
        try {
          return  await agentRelationModel.find(data).limit(8).sort({createdAt:-1});
        } catch (e) {
          console.log("Error",e);
        }
  },

  getAgentRelationPopulateData: async function(data,populateWith){
        try {
          return  await agentRelationModel.find(data).populate(populateWith);
        } catch (e) {
          console.log("Error",e);
        }
  },

  getAgentRelationPopulateDatatable: async function(query, length, start, populateWith){
        try {
          return  await agentRelationModel.find(query).populate(populateWith).skip(start).limit(length);
        } catch (e) {
          console.log("Error",e);
        }
  },


}

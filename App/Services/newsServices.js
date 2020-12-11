'use strict';

const mongoose = require('mongoose');
var Sys = require('../../Boot/Sys');
const newsModel  = mongoose.model('News');


module.exports = {

	getByData: async function(data){
        console.log('Find By Data:',data)
        try {
          return  await newsModel.find(data);
        } catch (e) {
          console.log("Error",e);
        }
	},

  getNewsData: async function(data){
        try {
          return  await newsModel.find(data);
        } catch (e) {
          console.log("Error",e);
        }
	},

  getNewsCount: async function(data){
    try {
          return  await newsModel.countDocuments(data);
        } catch (e) {
          console.log("Error",e);
    }
  },

	getSingleNewsData: async function(data){
        try {
          return  await newsModel.findOne(data);
        } catch (e) {
          console.log("Error",e);
        }
	},

  getNewsDatatable: async function(query, length, start){
        try {
          return  await newsModel.find(query).skip(start).limit(length);
        } catch (e) {
          console.log("Error",e);
        }
	},

  insertNewsData: async function(data){
        try {
          return await newsModel.create(data);
        } catch (e) {
          console.log("Error",e);
          throw e;
        }
	},

  deleteNews: async function(data){
        try {
          await newsModel.deleteOne({_id: data});
        } catch (e) {
          console.log("Error",e);
        }
  },

	updateNewsData: async function(condition, data){
        try {
          await newsModel.update(condition, data);
        } catch (e) {
          console.log("Error",e);
        }
	},

  getLimitNews: async function(data){
        try {
          return  await newsModel.find(data).limit(8).sort({createdAt:-1});
        } catch (e) {
          console.log("Error",e);
        }
  },

  




}

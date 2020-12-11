'use strict';

const mongoose = require('mongoose');
var Sys = require('../../Boot/Sys');
const walletModel  = mongoose.model('wallet');


module.exports = {

	getByData: async function(data){
        try {
          return  await walletModel.find(data);
        } catch (e) {
          console.log("Error",e);
        }
	},

	getWalletDatatable: async function(query, length, start){
        try {
          return  await walletModel.find(query).skip(start).limit(length);
        } catch (e) {
          console.log("Error",e);
        }
	},

	getWalletData: async function(data){
		try {
			return  await walletModel.findOne(data);
		} catch (e) {
			console.log("Error",e);
		}
	},


	updateWalletData: async function(condition, data){
		try {
			await walletModel.update(condition, data);
		} catch (e) {
			console.log("Error",e);
		}
	},

	insertWalletData: async function(data){
		try {
			await walletModel.create(data);
		} catch (e) {
			console.log("Error",e);
		}
	},

	deleteWallet: async function(data){
        try {
          await walletModel.deleteOne({_id: data});
        } catch (e) {
          console.log("Error",e);
        }
  },
}

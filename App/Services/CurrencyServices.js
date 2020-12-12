'use strict';

const mongoose = require('mongoose');
var Sys = require('../../Boot/Sys');
const currencyModel  = mongoose.model('currency');
const request = require('request-promise');


module.exports = {

	getByData: async function(data){
        try {
          return  await currencyModel.find(data);
        } catch (e) {
          console.log("Error",e);
        }
	},

  getCurrencyCount: async function(data){
    try {
          return  await currencyModel.countDocuments(data);
        } catch (e) {
          console.log("Error",e);
    }
  },


  getCurrencyDatatable: async function(query, length, start){
        try {
          return  await currencyModel.find(query).skip(start).limit(length);
        } catch (e) {
          console.log("Error",e);
        }
  },
  
  getLiveCurrencyData: async function() {
    try {
      var response = await request('https://api.currencyfreaks.com/latest?apikey=8bff12f12eb64254910748dc6376e78e', { json: true });
      if (response.rates) {
        var dataToSave = [{
          updateOne: {
            filter: { currencyCode : 'USD' },
            update: { $set: { usdPerUnit : '1.00'} },
            upsert: true
          }
        }];
        Object.keys(response.rates).forEach(function(currency) {
          var price = response.rates[currency];
          dataToSave.push({
            updateOne: {
              filter: { currencyCode : currency },
              update: { $set: { usdPerUnit :price} },
              upsert: true
            }
          });  
        });
        return await currencyModel.bulkWrite(
          dataToSave
        );
      } else {
        return false;
      }
    } catch (e) {
      console.log("Error",e);
    }
  }

 

}

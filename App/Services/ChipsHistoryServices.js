'use strict';

const mongoose = require('mongoose');
var Sys = require('../../Boot/Sys');
const chipsModel  = mongoose.model('chipsHistory');
const loginHistoryModel  = mongoose.model('loginHistory');
const playerCashTransactionModel  = mongoose.model('playerCashTransaction');
const dailyReportsModel  = mongoose.model('dailyReports');
const transactionModel  = mongoose.model('allUsersTransactionHistory');
module.exports = {

	getByData: async function(data){
        //console.log('Find By Data:',data)
        try {
          return  await chipsModel.find(data);
        } catch (e) {
          console.log("ChipsHistoryServices Error in getByData",e);
          return new Error(e);
        }
	},

  getChipsData: async function(data){
        try {
          return  await chipsModel.find(data);
        } catch (e) {
          console.log("ChipsHistoryServices Error in getChipsData",e);
          return new Error(e);
        }
	},

  getChipsHistoryCount: async function(data){
    try {
          return  await chipsModel.countDocuments(data);
        } catch (e) {
          console.log("ChipsHistoryServices Error in getChipsHistoryCount",e);
          return new Error(e);
    }
  },

	getSingleChipsData: async function(data){
        try {
          return  await chipsModel.findOne(data);
        } catch (e) {
          console.log("ChipsHistoryServices Error in getSingleChipsData",e);
          return new Error(e);
        }
  },

  getChipsDatatable: async function(query, length, start){
        try {
          return  await chipsModel.find(query).skip(start).limit(length);
        } catch (e) {
          console.log("ChipsHistoryServices Error in getChipsDatatable",e);
          return new Error(e);
        }
	},

  insertChipsData: async function(data){
        try {
          return await chipsModel.create(data);
        } catch (e) {
          console.log("ChipsHistoryServices Error in insertChipsData",e);
          return new Error(e);
        }
	},

  deleteChips: async function(data){
        try {
          return  await chipsModel.deleteOne({_id: data});
        } catch (e) {
          console.log("ChipsHistoryServices Error in deleteChips",e);
          return new Error(e);        }
  },

	updateChipsData: async function(condition, data){
        try {
          return  await chipsModel.update(condition, data);
        } catch (e) {
              console.log("ChipsHistoryServices Error in updateChipsData",e);
            return new Error(e);                
          }
	},

  insertLoginHistoryData: async function(data){
        try {
          return  await loginHistoryModel.create(data);
        } catch (e) {
          console.log("ChipsHistoryServices Error in insertLoginHistoryData",e);
            return new Error(e);                
        }
  },

  getLoginHistoryData: async function(data){
        try {
          return  await loginHistoryModel.find(data);
        } catch (e) {
          console.log("ChipsHistoryServices Error in getLoginHistoryData",e);
            return new Error(e);                
        }
  },

  getLoginHistoryCount: async function(data){
        try {
          return  await loginHistoryModel.countDocuments(data);
        } catch (e) {
          console.log("ChipsHistoryServices Error in getLoginHistoryData",e);
            return new Error(e);
        }
  },

  getLoginDatatable: async function(query, length, start){
        try {
          return  await loginHistoryModel.find(query).skip(start).limit(length);
        } catch (e) {
          console.log("ChipsHistoryServices Error in getLoginDatatable",e);
            return new Error(e);
        }
  },

  getCashTransactionHistoryCount: async function(data){
    try {
          return  await playerCashTransactionModel.countDocuments(data);
        } catch (e) {
          console.log("ChipsHistoryServices Error in getCashTransactionHistoryCount",e);
            return new Error(e);
    }
  },

  getCashTransactionDatatable: async function(query, length, start){
        try {
          return  await playerCashTransactionModel.find(query).skip(start).limit(length);
        } catch (e) {
          console.log("ChipsHistoryServices Error in getCashTransactionDatatable",e);
            return new Error(e);
        }
  },
  insertdailyReportsData: async function(data){
    try {
      data.createdAt = new Date(); //Dont Remove this code 
      data.updatedAt = new Date();//Dont Remove this code 
      return await dailyReportsModel.create(data);
    } catch (e) {console.log("ChipsHistoryServices Error in insertdailyReportsData",e);
    return new Error(e);
    }
},

getDailyReportsData: async function(query,length,start,sort){
  try {    
    return  await dailyReportsModel.find(query).limit(length).skip(start).sort(sort).lean();
  } catch (e) {console.log("ChipsHistoryServices Error in insertdailyReportsData",e);
  return new Error(e);
  }
},
getData: async function(data, select, setOption,sort){
  try {
return  await transactionModel.find(data, select, setOption).lean();  // setOption(sort, limit,skip)
//   limit(length).skip(start).sort(sort)

  } catch (e) {
console.log("ChipsHistoryServices Error  in getData",e);
    return new Error(e);
  }
},


createTransaction: async function(data){
  try {
    return await transactionModel.create(data);
  } catch (error) {
    console.log("ChipsServices  Error in createTransaction",error);
      return new Error(error);
  }
},


getDataTnxData: async function(query,length,start,sort){
try {
  return await transactionModel.find(query).limit(length).skip(start).sort(sort).lean();
}
catch (error) {
  console.log('ChipsServices Error in getData : ' + error);
  return new Error(error);
}
},


getDataAggregate: async function(query,length,start,sort){
  try {
        return await transactionModel.aggregate( [
      {
        $facet: {
          "firstData": [
             { $match: query },
             {$group: {
                _id: null,
                firstRecord: {$first : "$$ROOT"},
                lastRecords: {$last : "$$ROOT"}
            }},
          ],
          "secondData": [
            { $match: query },
            {$group: {
                _id: null,
                count: {$sum : 1}
            }},
          ],
          "thirdData": [
             {$match: query},
             {$sort:sort},
             {$skip:start},
             {$limit: length},
          ]
        }
      }
    ])
  }
  catch (error) {
    console.log('ChipsServices Error in getData : ' + error);
    return new Error(error);
  }
  },


getSingleData: async function(query){
try {
  return await transactionModel.findOne(query).lean();
}
catch (error) {
  console.log('ChipsServices Error in getSingleData : ' + error);
  return new Error(error);
}
},

updateTransactionData: async function(condition, data){
  try {
    return await transactionModel.update(condition, data);
  } catch (e) {
    console.log("ChipsServices Error in updateTransactionData",e);
    return new Error(error);
  }
},


}

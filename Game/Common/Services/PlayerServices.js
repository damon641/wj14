'use strict';
var Sys = require('../../../Boot/Sys');

const mongoose = require('mongoose');
const playerModel = mongoose.model('player');
const socketModel = mongoose.model('socket');
const chipsTransferModel = mongoose.model('chipsTransfer');
const transactionModel = mongoose.model('transactions');
const newsModel = mongoose.model('News');
const allUsersTransactionHistoryModel = mongoose.model('allUsersTransactionHistory');
const accountNumberUpdateReqModel = mongoose.model('acctNumUpdateReq');
const depositReceiptModel = mongoose.model('depositReceipt');
const withdrawModel = mongoose.model('withdraw');
const addVideoModel = mongoose.model('addvideo');


module.exports = {
  create: async function (data) {
    try {
      let uniqId = 'SP' + (await playerModel.countDocuments({}) + 1000);
      const playerSchema = new playerModel({
        device_id: data.device_id,
        uniqId: uniqId,
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password,
        mobile: data.mobile,
        isFbLogin: data.isFbLogin,
        profilePic: data.profilePic,
        chips: data.chips,
        cash: data.cash,
        status: data.status,
        socketId: data.socketId,
        isCash: data.isCash,
        statistics: {
          cashgame: {
            noOfPlayedGames: 0,
            totalWonGame: 0,
            totalLoseGame: 0,
          },
          sng: {
            noOfPlayedGames: 0,
            totalWonGame: 0,
            totalLoseGame: 0,
          },
          tournament: {
            noOfPlayedGames: 0,
            totalWonGame: 0,
            totalLoseGame: 0,
          }
        }
      });
      let newPlayer = await playerSchema.save();
      if (newPlayer) {
        // New Player Register So Create New Entry in Socket DB
        const playerSchema = new socketModel({
          playerId: newPlayer.id,
          socketId: data.socketId
        });
        let newSocket = await playerSchema.save();
        return newPlayer;
      }
      else {
        return newPlayer;
      }
    }
    catch (error) {
      Sys.Log.info('Error in Create  Player : ' + error);
    }
  },
  update: async function (id, query) {
    try {
      let player = await playerModel.updateOne({ _id: id }, query, { new: true });
      return player;
    } catch (error) {
      Sys.Log.info('Error in Update Player : ' + error);
    }
  },
  getOneByData: async function (data, select, setOption) {
    try {
      return await playerModel.findOne(data, select, setOption);
    }
    catch (error) {
      Sys.Log.info('Error in getOneByData : ' + error);
    }
  },

  getByData: async function (data, select, setOption) {
    try {
      return await playerModel.find(data, select, setOption);
    }
    catch (error) {
      Sys.Log.info('Error in getByData : ' + error);
    }
  },

  getById: async function (id) {
    try {
      return await playerModel.findById(id);
    }
    catch (error) {
      Sys.Log.info('Error in getByData : ' + error);
    }
  },
  getByIdForLocation: async function (id) {
    try {
      return await playerModel.find({ _id: id });
    }
    catch (error) {
      Sys.Log.info('Error in getByData : ' + error);
    }
  },
  /*update: async function(data){
    let UpdatePlayerData = await playerModel.updateOne({
      _id : data.playerId
    }, {
      firstname:data.firstname,
      lastname:data.lastname,
      mobile:data.mobile,
      gender:data.gender
    });
    if(!UpdatePlayerData){
      return new Error('No Record Found!');
    }
    else{
      return UpdatePlayerData;
    }
  },*/

  updatePlayerData: async function (condition, data) {
    try {
      await playerModel.update(condition, data);
    } catch (e) {
      console.log("Error", e);
    }
  },

  getPlayerCount: async function (data, select, setOption) {
    try {
      return await playerModel.countDocuments(data, select, setOption);
    }
    catch (error) {
      Sys.Log.info('Error in getPlayerCount : ' + error);
    }
  },

  getNewsByData: async function (data, select, setOption) {
    try {
      return await newsModel.find(data, select, setOption);
    }
    catch (error) {
      Sys.Log.info('Error in getNewsByData : ' + error);
    }
  },

  chipsTransferCreate: async function (data) {
    try {
      const chipsTransferSchema = new chipsTransferModel({
        playerId: data.playerId,
        receiverId: data.receiverId,
        chips: data.chips
      });
      let newTransfer = await chipsTransferSchema.save();
      return newTransfer;
    }
    catch (error) {
      Sys.Log.info('Error in Chips Transfer Create : ' + error);
    }
  },
  /** 
   * 
  */
  getPlayersByWinRate: async function () {
    try {
      return playerModel.aggregate([
        {
          $project: {
            username: 1,
            winRate: {
              $cond: [
                {
                  $eq: ['$statistics.tournament.noOfPlayedGames', 0]
                },
                0,
                {
                  $multiply: [
                    {
                      $divide: [100, '$statistics.tournament.noOfPlayedGames']
                    },
                    '$statistics.tournament.totalWonGame'
                  ]
                }
              ]
            }
          }
        },
        { $sort: { winRate: -1 } },
      ])
    } catch (err) {
      return new Error(err)
    }
  },

  insertRequest: async function (data) {
    try {
      return await accountNumberUpdateReqModel.create(data)
    } catch (err) {
      return new Error(err)
    }
  },

  insertDepositReceipt: async function (data) {
    try {
      return await depositReceiptModel.create(data)
    } catch (err) {
      return new Error(err)
    }
  },

  insertWithdrawData: async function (data) {
    try {
      return await withdrawModel.create(data)
    } catch (err) {
      return new Error(err)
    }
  },

  deleteWithdrawData: async function (query) {
    try {
      return await withdrawModel.deleteOne(query);
    } catch (err) {
      return new Error(err)
    }
  },

  getNewWithdrawCount: async function (query) {
    try {
      return await withdrawModel.countDocuments(query);
    } catch (err) {
      console.log('PlayerServices Error in getNewWithdrawCount', err);
      return new Error(err);
    }
  },

  getNewDepositCount: async function (query) {
    try {
      return await depositReceiptModel.countDocuments(query);
    } catch (err) {
      console.log('PlayerServices Error in getNewDepositCount', err);
      return new Error(err);
    }
  },
  createTransaction: async function (data) {
    try {
      return await transactionModel.create(data);
    } catch (error) {
      console.log("ChipsServices  Error in createTransaction", error);
      return new Error(error);
    }
  },
  insertData: async function (data) {
    try {
      return await allUsersTransactionHistoryModel.create(data);
    } catch (e) {
      console.log("AllUsersTransactionHistoryServices Error in insertData", e);
      return new Error(e);
    }
  },

  getVideoOneByData: async function(data, select, setOption){
    try {
      return await addVideoModel.findOne(data, select, setOption);
    }
    catch (error) {
      Sys.Log.info('Error in getOneByData : ' + error);
    }
  },

}

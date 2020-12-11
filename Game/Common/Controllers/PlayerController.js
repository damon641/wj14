var Sys = require('../../../Boot/Sys');
var bcrypt = require('bcryptjs');
const moment = require('moment');
// nodemialer to send email
const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');
// create a defaultTransport using gmail and authentication that are
// stored in the `config.js` file.
var defaultTransport = nodemailer.createTransport({
 service: 'Gmail',
 auth: {
   user: Sys.Config.App.mailer.auth.user,
   pass: Sys.Config.App.mailer.auth.pass
 }
});

module.exports = {

  playerRegister: async function (socket, data){
      try {

        let m_start_date = moment(new Date(Sys.Setting.maintenance.maintenance_start_date)).format("YYYY-MM-DD HH:mm");
        let m_end_date = moment(new Date(Sys.Setting.maintenance.maintenance_end_date)).format("YYYY-MM-DD HH:mm");
        let current_date = moment(new Date()).format("YYYY-MM-DD HH:mm");
        
        if( (current_date >= m_start_date && current_date <= m_end_date && Sys.Setting.maintenance.status =='active') || Sys.Setting.maintenance.quickMaintenance == "active" ){
          if(Sys.Setting.maintenance.quickMaintenance == "active"){
            return {
              status: 'fail',
              result: null,
              message: Sys.Setting.maintenance.message + '\n We will come back very shortly!',
              statusCode: 400
            }
          }
          return {
            status: 'fail',
            result: null,
            message: Sys.Setting.maintenance.message + '\n You can login after ' + Sys.Setting.maintenance.maintenance_end_date,
            statusCode: 400
          }
        }
        let mobile = +data.mobile
        data.username = data.username.toLowerCase();
        if(Object.is(mobile, NaN) == true){
          return {
            status: 'fail',
            result: null,
            message: 'please enter a valid mobile number',
            statusCode: 400
          }
        }
        // Check Username & Email Already Avilable
        let player = await Sys.Game.Common.Services.PlayerServices.getOneByData({ username: data.username });

        if (player) { // When Player Found
          return {
            status: 'fail',
            result: null,
            message: 'Username already taken.',
            statusCode: 401
          }
        }

        // Check Username & Email Already Avilable
        player = await Sys.Game.Common.Services.PlayerServices.getOneByData({ mobile: data.mobile });
        if (player) { // When Player Found
          return {
            status: 'fail',
            result: null,
            message: 'Mobile number already taken.',
            statusCode: 401
          }
        }

        // Check Account Number Already Available
/*         player = await Sys.Game.Common.Services.PlayerServices.getOneByData({ accountNumber: data.accountNumber });
        if (player) { // When Player Found
          return {
            status: 'fail',
            result: null,
            message: 'Account number already exists.',
            statusCode: 401
          }
        } */
        let defaultSettings = await Sys.App.Services.SettingsServices.getSettingsData();
        console.log('defaultSettings: ',defaultSettings);
        if(defaultSettings instanceof Error){
          return { status: 'fail', result: null, message: defaultSettings.message, statusCode: 401 }
        }
        if(!defaultSettings){
          defaultSettings = {
            defaultChips: 1000
          };
        }
        // const superAdmin = await Sys.App.Services.UserServices.getSingleUserData({ isSuperAdmin: true });
        // console.log(superAdmin)
        // Create Player Object
        let playerObj = {
          device_id : data.device_id,
          name : data.name,
          username: data.username,
          password: bcrypt.hashSync(data.password, 10),
          email: data.email,
          mobile: data.mobile,
          isFbLogin : false,
          profilePic: 0,
          chips: defaultSettings.defaultChips,
          cash : 0,
          status: 'active',
          socketId : '1234',
          isCash: false,
          platform_os: data.os
        };
        player = await Sys.Game.Common.Services.PlayerServices.create(playerObj);
       
        if (!player) {
          return {
            status: 'fail',
            result: null,
            message: 'Player Not Created',
            statusCode: 400
          }
        }else{
          return {
            status: 'success',
            result: {
              playerId : player.id,
              username : player.username,
              chips : player.chips,
              cash : '0',
            },
            message: 'Player Successfully Register!'
          }
        }

        

      } catch (e) {
        Sys.Log.info('Error in create Player : ' + e);
      }

  },

  playerLogin: async function(socket,data){
      
      try {
        let m_start_date = moment(new Date(Sys.Setting.maintenance.maintenance_start_date)).format("YYYY-MM-DD HH:mm");
        let m_end_date = moment(new Date(Sys.Setting.maintenance.maintenance_end_date)).format("YYYY-MM-DD HH:mm");
        let current_date = moment(new Date()).format("YYYY-MM-DD HH:mm");

          if( (current_date >= m_start_date && current_date <= m_end_date && Sys.Setting.maintenance.status =='active') || Sys.Setting.maintenance.quickMaintenance == "active" ){
            //let date = new Date();
            // let date = moment().format("YYYY-MM-DD HH:mm");
            // //console.log("original start", Sys.Setting.maintenance.maintenance_start_date)
            //let maintenance_start_date=  moment(Sys.Setting.maintenance.maintenance_start_date);//console.log("mainn start",maintenance_start_date)
            //let before_maintenance_minute = Sys.Setting.maintenance.showBeforeMinutes;//console.log("before",before_maintenance_minute)
            
            //let m_start_date = maintenance_start_date.subtract(before_maintenance_minute, 'minute').format("YYYY-MM-DD HH:mm");//console.log("final start",m_start_date)
            // let m_end_date=  moment(Sys.Setting.maintenance.maintenance_end_date).format("YYYY-MM-DD HH:mm");//console.log("end time", m_end_date);

            //if(date >= m_start_date && date <= m_end_date ){
              if(Sys.Setting.maintenance.quickMaintenance == "active"){
                return {
                  status: 'fail',
                  result: null,
                  message: Sys.Setting.maintenance.message + '\n We will come back very shortly!',
                  statusCode: 400
                }
              }
              return {
                status: 'fail',
                result: null,
                message: Sys.Setting.maintenance.message + '\n You can login after ' + Sys.Setting.maintenance.maintenance_end_date,
                statusCode: 400
              }
            //}    
          }

          // forece update game version
          if(data.os && data.appVersion){
            if( (data.os == 'android' && data.appVersion >= Sys.Setting.android_version) || (data.os == 'ios' && data.appVersion >= Sys.Setting.ios_version) || (data.os == 'other') ){
              data.isFbLogin = false; // Remove After Testing.
              let passwordTrue = false;
              let player = null;

              if (data.isFbLogin == false) { // if Normal Login
                  // Define Validation Rules
                  let playerObj = {
                    // isFbLogin : false,
                    username: data.username,
                      /*$or:[
                          {username: data.username},
                          {email: data.username}
                      ]*/
                  };


                  player = await Sys.Game.Common.Services.PlayerServices.getOneByData(playerObj);
                  // console.log("player", player);
                  if(!player){
                      return {
                        status: 'fail',
                        result: null,
                        message: 'Wrong Username Or Email',
                        statusCode: 400
                      }
                  }

                  if(bcrypt.compareSync(data.password, player.password)) {
                    //check if player is Active or Blocked 
                    if(player.status == 'Block'){
                      return {
                        status: 'fail',
                        result: null,
                        message: 'Oops You are Blocked,please Contact Administrator.',
                        statusCode: 400
                      }
                    }
                    passwordTrue = true;
                  } else {
                    // Passwords don't match
                  }
              }else{

                  let playerObj = {
                    isFbLogin : true,
                    appId : data.appId
                  };

                  player = await Sys.Game.Common.Services.PlayerServices.getOneByData(playerObj);

                  if(!player){

                    playerObj = {
                      deviceId : data.deviceId,
                      isFbLogin : true,
                      username: player.username,
                      appId: data.appId,
                      deviceId: data.deviceId,
                      ip : data.ip,
                      cash : 0,
                      chips : 1000,
                      status: 'active',
                      platform_os: data.os,
                    }

                    player = await Sys.Game.Common.Services.PlayerServices.create(playerObj);
                    if (!player) {
                      return {
                        status: 'fail',
                        result: null,
                        message: 'Player Not Created',
                        statusCode: 400
                      }
                    }
                  }
                  passwordTrue = true;
              }

              if (passwordTrue) {
                  
                  /*if(player.socketId){
                      console.log("Player Force Logout Send.")
                      await Sys.Io.to(player.socketId).emit('forceLogOut',{
                          playerId :  player.id
                      });
                      
                  }*/

                  console.log("data.forceLogin", data.forceLogin)
                  if(data.forceLogin){
                    if(player.socketId){
                        console.log("Player Force Logout Send.")
                        await Sys.Io.to(player.socketId).emit('forceLogOut',{
                            playerId :  player.id,
                            message: "You are logged off due to login from another device.",
                        });
                        
                    }
                  }else{
                    if (Sys.Io.sockets.connected[player.socketId]) { 
                       console.log("socket is already connected");
                        return {
                            status: 'fail',
                            message: 'alreadyLogin',
                        } 
                    }
                  }

                  player.isFbLogin = false;
                  if (data.AppId != '') {
                    player.isFbLogin = true;
                  }


                   await Sys.Game.Common.Services.PlayerServices.updatePlayerData(
                  {
                    _id: player.id
                    },{
                      socketId: socket.id,
                      platform_os: data.os,
                  });
                  console.log("player socket id on login", socket.id, player.username)
                  return {
                    status: 'success',
                    result: {
                      playerId : player.id,
                      username : player.username,
                      chips : player.chips,
                      cash : player.cash,
                      accountNumber: player.accountNumber,
                      mobile: player.mobile,
                      profilePic: player.profilePic,
                      isCash: player.isCash,
                      isMultipleTableAllowed: (Sys.Setting.multitable_status == 'active') ? true : false,
                      isChipsTransferAllowed: (player.isCash == true) ? true : false, 
                    },
                    message: 'Player Successfully Login!'
                  }
                
              }
              return {
                status: 'fail',
                result: null,
                message: 'Invalid credentials!',
                statusCode: 401
              }

            }
            let storeUrl = '';
            if(data.os == 'android'){
              storeUrl = Sys.Setting.android_store_link;
            }else if(data.os == 'ios'){
               storeUrl = Sys.Setting.ios_store_link;
            }else{
              storeUrl = '';
            }
            return {
              status: 'fail',
              result: {storeUrl: storeUrl},
              message: 'updateApp',
              statusCode: 401
            }
            
            
          }
          
          return {
            status: 'fail',
            result: null,
            message: 'Please update the game from app store.',
            statusCode: 401
          }




          // data.isFbLogin = false; // Remove After Testing.
          // let passwordTrue = false;
          // let player = null;

          // if (data.isFbLogin == false) { // if Normal Login
          //     // Define Validation Rules
          //     let playerObj = {
          //       // isFbLogin : false,
          //       username: data.username,
          //       // $or:[
          //       //      {username: data.username},
          //       //      {email: data.username}
          //       // ]
          //     };


          //     player = await Sys.Game.Common.Services.PlayerServices.getOneByData(playerObj);
          //     // console.log("player", player);
          //     if(!player){
          //         return {
          //           status: 'fail',
          //           result: null,
          //           message: 'Wrong Username Or Email',
          //           statusCode: 400
          //         }
          //     }

          //     if(bcrypt.compareSync(data.password, player.password)) {
          //       //check if player is Active or Blocked 
          //       if(player.status == 'Block'){
          //         return {
          //           status: 'fail',
          //           result: null,
          //           message: 'Oops You are Blocked,please Contact Administrator.',
          //           statusCode: 400
          //         }
          //       }
          //       passwordTrue = true;
          //     } else {
          //       // Passwords don't match
          //     }
          // }else{

          //     let playerObj = {
          //       isFbLogin : true,
          //       appId : data.appId
          //     };

          //     player = await Sys.Game.Common.Services.PlayerServices.getOneByData(playerObj);

          //     if(!player){

          //       playerObj = {
          //         deviceId : data.deviceId,
          //         isFbLogin : true,
          //         username: data.username,
          //         appId: data.appId,
          //         deviceId: data.deviceId,
          //         ip : data.ip,
          //         cash : 0,
          //         chips : 1000,
          //         status: 'active',
          //         platform_os: data.os,
          //       }

          //       player = await Sys.Game.Common.Services.PlayerServices.create(playerObj);
          //       if (!player) {
          //         return {
          //           status: 'fail',
          //           result: null,
          //           message: 'Player Not Created',
          //           statusCode: 400
          //         }
          //       }
          //     }
          //     passwordTrue = true;
          // }

          // if (passwordTrue) {
              
          //     /*if(player.socketId){
          //         console.log("Player Force Logout Send.")
          //         await Sys.Io.to(player.socketId).emit('forceLogOut',{
          //             playerId :  player.id
          //         });

          //     console.log("data.forceLogin", data.forceLogin)
          //     if(data.forceLogin){
          //       if(player.socketId){
          //           console.log("Player Force Logout Send.")
          //           await Sys.Io.to(player.socketId).emit('forceLogOut',{
          //               playerId :  player.id
          //           });
                    
          //       }
          //     }else{
          //       if (Sys.Io.sockets.connected[player.socketId]) { 
          //          console.log("socket is already connected");
          //           return {
          //               status: 'fail',
          //               message: 'alreadyLogin',
          //           } 
          //       }
          //     }

          //     player.isFbLogin = false;
          //     if (data.AppId != '') {
          //       player.isFbLogin = true;
          //     }


          //      await Sys.Game.Common.Services.PlayerServices.updatePlayerData(
          //     {
          //       _id: player.id
          //       },{
          //         socketId: socket.id,
          //         platform_os: data.os,
          //     });
          //      console.log("player socket id on login", socket.id, player.username)
          //     return {
          //       status: 'success',
          //       result: {
          //         playerId : player.id,
          //         username : player.username,
          //         chips : player.chips,
          //         cash : player.cash,
          //         profilePic: player.profilePic,
          //         isCash: player.isCash,
          //       },
          //       message: 'Player Successfully Login!'
          //     }

            
          // }
          // return {
          //   status: 'fail',
          //   result: null,
          //   message: 'Invalid credentials!',
          //   statusCode: 401
          // }

      } catch (error) {
          Sys.Log.info('Error in Login : ' + error);
      }

  },

  /*reconnectPlayer: async function(socket,data){
      try {
         await Sys.Game.Common.Services.PlayerServices.updatePlayerData(
          {  _id: data.playerId   },{
              socketId: socket.id,
          });
         console.log("reconnect called for", data, socket.id);
          let tournamentTime  = new Date('2019-02-06T08:55:55.238+00:00');

          let date = new Date();

          console.log(tournamentTime)
          console.log(date)

          // let currentTimeUtc =new Date(
          //   date.getUTCFullYear(),
          //   date.getUTCMonth(),
          //   date.getUTCDate(),
          //   date.getUTCHours(),
          //   date.getUTCMinutes(), 
          //   date.getUTCSeconds()
          // );


          let seconds = (date.getTime() - tournamentTime.getTime()) / 1000;
          console.log(seconds)
          let message = "few seconds ago"
          if(seconds > 60){
            if(Math.floor(seconds / (24*60*60)) < 1){
              if(Math.floor(seconds / 3600) < 1){
                  message = (Math.floor(seconds % 3600 / 60))+" minutes ago";
              }else{
                if(Math.floor(seconds / 3600) == 1){
                  message = (Math.floor(seconds / 3600))+" hour ago";
                }else{
                  message = (Math.floor(seconds / 3600))+" hours ago";
                }
              }
            }else{
              message = (Math.floor(seconds / (24*60*60)))+" day ago";
            }
          }  


          // var hour = Math.floor(seconds / 3600);
          // var minutes = Math.floor(seconds % 3600 / 60);
          // var day     = Math.floor(seconds / (24*60*60));
          // var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
          // var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
          // var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";

          //let dd = day + hDisplay + mDisplay + sDisplay; 
          console.log("Time : ",message)

          return {
            status: 'success',
            result: null,
            message: 'Player Reconect Success!'
          }
      } catch (error) {
          Sys.Log.info('Error in reconnectPlayer : ' + error);
          return {
            status: 'fail',
            result: null,
            message: 'No Running Game Found!',
          }
      }
  },*/

  reconnectPlayer: async function(socket,data){
      try {
       
        if(data.playerId){
        
          let player = await Sys.Game.Common.Services.PlayerServices.getOneByData({_id: data.playerId},'socketId',null);
          console.log("reconnect player", player);
          if (Sys.Io.sockets.connected[player.socketId]) { 
            console.log("socket is already connected in reconnect player");

          //START: Chirag 30-08-2019 add message parameter in forceLogout
            await Sys.Io.to(socket.id).emit('forceLogOut',{
                 playerId :  player.id,
                 message: "You are logged off due to login from another device.",
            });
          //END: Chirag 30-08-2019 add message parameter in forceLogout
            return {
              status: 'fail',
              message: "forceLogout",
            }
            
          }
              
          await Sys.Game.Common.Services.PlayerServices.updatePlayerData(
            {  _id: data.playerId   },{
                socketId: socket.id,
            });

            return {
              status: 'success',
              result: null,
              message: 'Player Reconnect Success!'
            }
        }else{
          return {
              status: 'success',
              result: null,
              message: 'Player Reconnect Failed!'
            }
        }
        
        
      } catch (error) {
          Sys.Log.info('Error in reconnectPlayer : ' + error);
          return {
            status: 'fail',
            result: null,
            message: 'No Running Game Found!',
          }
      }
  },

  checkRunningGame: async function(socket,data){
    try {
      let player = await Sys.Game.Common.Services.PlayerServices.getById(data.playerId);
      if (player) {

        let runningGames = await Sys.Game.Common.Services.playerGameHistoryServices.findRunningGame(data.playerId);
         //console.log("runningGames.length :",runningGames.length)
        if (runningGames.length > 0) {
          let roomArray = [];
          for(let i=0;i < runningGames.length; i++){
            //console.log("Room Status :",runningGames[i].room.status)
              roomArray.push({
                roomId : runningGames[i].room.id,
                tableNumber : runningGames[i].room.tableNumber,
                isTournament : runningGames[i].isTournament,
                tournamentType : runningGames[i].tournamentType,
                type : runningGames[i].type,
                namespaceString: ( (runningGames[i].tournamentType == 'regular') ? ( (runningGames[i].type == 'texas' && runningGames[i].tournamentType == 'regular' ) ? Sys.Config.Namespace.CashRegularTexas : Sys.Config.Namespace.CashRegularOmaha ) : ( (runningGames[i].type == 'texas' && runningGames[i].tournamentType == 'sng' ) ? Sys.Config.Namespace.CashSngTexas : Sys.Config.Namespace.CashSngOmaha ) ),
                pokerGameType: runningGames[i].type,
                pokerGameFormat: (runningGames[i].tournamentType == 'regular') ? 'tournament':'sng'
              })
          }
          console.log("=======================")
          console.log("=======================")
          console.log("ROOOMARRAAY",roomArray)
          console.log("=======================")
          console.log("=======================")
          // Running Game List
          return {
            status: 'success',
            result: roomArray,
            message: 'Player Running Game List!'
          }
        }else{
          return {
            status: 'fail',
            result: null,
            message: 'No Running Game Found!',
            statusCode: 400
          }
        }

      }
      return {
        status: 'fail',
        result: null,
        message: 'No Player Found!',
        statusCode: 400
      }
    } catch (error) {
        Sys.Log.info('Error in Update Player : ' + error);
    }
  },

  updateProfile: async function(socket,data){
      try {
        let player = await Sys.Game.Common.Services.PlayerServices.getOneByData({ id: socket.playerId });
        if (player) {
          let updatedPlayer = false;
            updatedPlayer = await Sys.Game.Common.Services.PlayerServices.update( {_id: player.id},
              { firstname:data.firstname , lastname:data.lastname , mobile:data.mobile ,gender:data.gender}
            );
          if (updatedPlayer) {
            let playerData = await Sys.Game.Common.Services.PlayerServices.getOneByData({ id: player.id });
            return {
              status: 'success',
              result: playerData,
              message: 'Player Profile Successfully Updated!'
            }
          }
        }
        return {
          status: 'fail',
          result: null,
          message: 'No Player Found!',
          statusCode: 400
        }
      } catch (error) {
          Sys.Log.info('Error in Update Player : ' + error);
      }
  },

  changeUsername: async function(socket,data){
      try {
        
          var isUserName = await Sys.Game.Common.Services.PlayerServices.getOneByData({ username: data.newUsername });
          
          if(isUserName == null){
            let updatedPlayer = false;
            updatedPlayer = await Sys.Game.Common.Services.PlayerServices.update({_id: data.playerId},{ username:data.newUsername});
            if (updatedPlayer) {
              let playerData = await Sys.Game.Common.Services.PlayerServices.getOneByData({ id: data.playerId });
              return {status: 'success',result: playerData,message: 'Player Profile Successfully Updated!'}
            }
          }else{
            return {status: 'fail',result: null,message: 'Username already exists',statusCode: 400}
          }
       
      } catch (error) {
          return {status: 'fail',result: null,message: 'No Player Found!',statusCode: 400}
          Sys.Log.info('Error in change username : ' + error);
      }
  },

  playerLogout: async function(socket,data){
      try {
          await Sys.Game.Common.Services.SocketServices.update({
              playerId : data.playerId,
              socketId : ''
          });
      } catch (error) {
          Sys.Log.info('Error in Logout Player : ' + error);
      }
  },

  playerProfile: async function(socket, data){
    try{
      let player = await Sys.Game.Common.Services.PlayerServices.getOneByData({ _id: data.playerId });
      if(player){
        
        return {
          status: 'success',
          result: {
            playerId : player.id,
            email : player.email,
            username : player.username,
            avatar : player.profilePic,
            chips: player.chips,
            mobile: player.mobile
          },
          message: 'Player Data Found'
        }
      }
      return {
        status: 'fail',
        result: null,
        message: 'Player Not Found',
        statusCode: 400
      }
    }catch(e){
      Sys.Log.info('Error in getting player profile : ' + e);
    }
  },

  playerGameHistory: async function(socket, data){
    try{
      //let query = { history: { $elemMatch: { playerId: data.playerId }} }; 
      //let games = await Sys.Game.Common.Services.GameServices.getByData(query, null, { sort: {_id:-1}, limit:10 });
     
      const pageNo = parseInt(data.pageNo) || 1;console.log("pageNo", pageNo);
      const resPerPage = 25;
      let query = { history: { $elemMatch: { playerId: data.playerId }} };

      if(data.startDate && data.endDate){
        query = { 
          history: { $elemMatch: { playerId: data.playerId }}, 
          createdAt: {
            $gte: data.startDate,
            $lt: data.endDate
          } 
        };
      }

      let games = await Sys.Game.Common.Services.GameServices.getByData(query, null, { sort: {_id:-1}, limit:resPerPage, skip: ( resPerPage* (pageNo - 1) ) });
      let totalRecords = await Sys.Game.Common.Services.GameServices.getGameCount(query);
      if(games && games.length > 0){
        var result = [];
        games.forEach(function(game){
          let winner = game.winners;
          let player =game.players;
          let handCards = [];
          let winnerResult={};
          for (var w = 0; w < winner.length; w++) {
            if(winner[w].playerId == data.playerId){
              winnerResult= {winningAmount: parseFloat(winner[w].amount), winningHands: game.winners[w].bestCards}
            }
          }
          for (var p = 0; p < player.length; p++) {
            if(player[p].id == data.playerId){
              handCards = player[p].cards;
            }
          }

          result.push({
            gameId :  game._id,
            gameName: game.gameNumber,
            dateTime: moment(game.createdAt).format('YYYY/MM/DD, h:mm a'), 
            handCards:handCards,
            winner: winnerResult,
          });

        });

        return {
            status: 'success',
            result: {gamesHistoryList: result, recordsTotal: totalRecords, currentPage: pageNo, totalPages: Math.ceil(totalRecords/resPerPage), resultPerPage: resPerPage  },
            message: "Player's Game History Found"
        }
       
      }

      return {
        status: 'fail',
        result: null,
        message: "No Game History Found for this player.",
        statusCode: 400
      }

    }catch(e){
      Sys.Log.info('Error in getting playerGameHistory: ' + e);
    }
  },

  GameHistory: async function(socket, data){
    try{
      let game = await Sys.Game.Common.Services.GameServices.getSingleGameData({_id: data.gameId});
      
      if(game){
       let startTime = moment(game.createdAt);
       let endTime = moment(game.updatedAt);
       var duration = endTime.diff(startTime,'minutes',true);
       let playerArray = [];
       let winnersArray = [];
       let handsEventsArray = [];
       let handsEventsArrayCard = [];
       for (var j = 0; j < game.players.length; j++) {
        // show only opened cards on table 
        if(game.players[j].id != data.playerId && game.players[j].isDisplayedCard != true){
          game.players[j].cards = ['BC', 'BC'];
        }
        playerArray.push({
          id :  game.players[j].id,
          playerName: game.players[j].playerName,
          cards: game.players[j].cards, 
        });
       }
       
       for (var w = 0; w < game.winners.length; w++) {

        winnersArray.push({
          id :  game.winners[w].playerId,
          playerName: game.winners[w].playerName,
          winningAmount: parseFloat(game.winners[w].amount),
          winningHands: game.winners[w].bestCards, 
        });
         /*for (var wk = 0; wk < winner[w].hand.length; wk++) {
           //winner[w].hand[wk] = '<img src="/card/' +winner[w].hand[wk] +'.png" width="50px">';
           winner[w].hand[wk] = winner[w].hand[wk] +'.png';
         }*/
       }
       
       for (var h = 0; h < game.history.length; h++) {
        handsEventsArray.push({
          id :  game.history[h].playerId,
          playerName: game.history[h].playerName,
          gameRound: game.history[h].gameRound,
          playerAction: ""+game.history[h].playerAction,
          betAmount: parseFloat( game.history[h].betAmount ),
          card: handsEventsArrayCard,
        });
          //history[h].time = moment(new Date(history[h].time)).format('YYYY/MM/DD,h:mm:ss a');
       }

      /* for (var d = 0; d < game.board.length; d++) {
         //board[d] = '<img src="/card/' +game.board[d] +'.png" width="50px">&nbsp;&nbsp;';
         game.board[d] = game.board[d] +'.png' ;
       }
       for (var d = 0; d < game.deck.length; d++) {
         //game.deck[d] = '<img src="/card/' +game.deck[d] +'.png" width="50px">&nbsp;&nbsp;';
          game.deck[d] = game.deck[d] +'.png';
       }*/
       console.log("board", game.board)
       let tableCards = {};
       if(game.board.length > 0 ){
        tableCards.Flop = game.board.slice(0, 3);
        if(game.board.length > 3){
          tableCards.Turn = game.board.slice(3, 4);
        }
        if(game.board.length > 4){
          tableCards.River = game.board.slice(4, 5);
        }
       }

        return {
            status: 'success',
            result:{gameHistory: {
                      dataTime: moment(new Date(game.createdAt)).format('YYYY/MM/DD,h:mm:ss a'),
                      gameName: game.gameNumber,
                      stack: game.smallBlind + '/' + game.bigBlind,
                      gameId: game._id,
                      players: playerArray,
                      winners: winnersArray,
                      handsEvents: handsEventsArray,
                      tableCards:tableCards,
                     /* gameType: game.gameType, 
                      smallBlind : game.smallBlind,
                      bigBlind: game.bigBlind,
                      status: game.status,
                      pot: game.pot,
                      gameStartTime: moment(new Date(game.createdAt)).format('YYYY/MM/DD,h:mm:ss a'),
                      gameEndTime : moment(new Date(game.updatedAt)).format('YYYY/MM/DD,h:mm:ss a'),
                      gameDuration:duration.toFixed(2),
                      players: allPlayer,
                      board: game.board,
                      winner: winner,
                      deck: game.deck,
                      history: history*/
                  }
            },
            message: "Game History Found"
        }
       
      }
      return {
        status: 'fail',
        result: null,
        message: "No Game History Found.",
        statusCode: 400
      }
    }catch(e){
      Sys.Log.info('Error in getting GameHistory: ' + e);
    }
  },

  Leaderboard: async function(socket, data){
    try{
      
        // let players = await Sys.Game.Common.Services.PlayerServices.getByData({}, null, {sort:{"statistics.tournament.totalWonGame": -1, "statistics.tournament.noOfPlayedGames": -1}, limit: 10});
        let player = await Sys.Game.Common.Services.PlayerServices.getById(data.playerId);
        let players =  await Sys.Game.Common.Services.PlayerServices.getPlayersByWinRate();
        console.log({players})
        // totalgame played and won games
        let gamesPlayed = await Sys.Game.Common.Services.GameServices.getGameCount({ history: { $elemMatch: { playerId: data.playerId } } });
        let gameWon = await Sys.Game.Common.Services.GameServices.getGameCount({ winners: { $elemMatch: { playerId: data.playerId } } });
        let topPlayer = [];
        if(players){
          let p=1;
          let playerRank;
          players.forEach(function(pl){
            if(pl.username == player.username){
              playerRank = p;
            }
            topPlayer.push({
                player: pl.username,
                position: p++,
                //amount: (pl.chips).toFixed(2),
                winRate: pl.winRate != null ? parseFloat(pl.winRate).toFixed(2) : 0.0,
            });
          })
          // let playerRank = topPlayer.find((plr) => plr.player == player.username);
        return {
          status: 'success',
          result: {
            topPlayer : topPlayer,
            rank: parseInt(playerRank) || p,
            gamePlayed : gamesPlayed, //(playerChips.statistics.gamePlayed == undefined)? 0 :playerChips.statistics.gamePlayed,
            won: gameWon ,//playerChips.statistics.won,
            lost: (gamesPlayed - gameWon) , //playerChips.statistics.lost,
          },
          message: 'Player Data Found'
        }
      }
      return {
        status: 'fail',
        result: null,
        message: 'Player Not Found',
        statusCode: 400
      }
    }catch(e){
      Sys.Log.info('Error in getting Leaderboard : ' + e);
    }
  },

  /*playerStatistics: async function(socket, data){
    try{
      let player = await Sys.Game.Common.Services.PlayerServices.getOneByData({ _id: data.playerId });
      console.log(player);
      if(player){
        return {
          status: 'success',
          result: {
            gamePlayed : player.statistics.gamePlayed,
            won: player.statistics.won,
            lost: player.statistics.lost,
          },
          message: 'Player Data Found'
        }
      }
      return {
        status: 'fail',
        result: null,
        message: 'Player Not Found',
        statusCode: 400
      }
    }catch(e){
      Sys.Log.info('Error in getting playerStatistics : ' + e);
    }
  },*/

  purchaseHistory: async function(socket, data){
    try{
      let purchases = await Sys.Game.Common.Services.playerChipsCashHistoryServices.getByData({ playerId: data.playerId });
      
      if(purchases){
        var result = [];
        purchases.forEach(function(pur){
          result.push({
              date:  moment(pur.createdAt).format('DD/MM/YYYY'),
              coins: (pur.afterBalance - pur.beforeBalance),
              amount: parseFloat( pur.cash ),
          });
        })
        return {
          status: 'success',
          result: result,
          message: "Player's purchase History Data Found"
        }
      }
      return {
        status: 'fail',
        result: null,
        message: 'Purchase History Not Found',
        statusCode: 400
      }
    }catch(e){
      Sys.Log.info('Error in getting purchaseHistory : ' + e);
    }
  },

  playerForgotPassword: async function(socket, data){
    try{

      let player = await Sys.Game.Common.Services.PlayerServices.getOneByData({ email: data.email });
      
      if(player){
        let newPassword = Math.random().toString(36).slice(-8);
        //console.log("new Password", newPassword);
        console.log("player id",player._id);
        await Sys.Game.Common.Services.PlayerServices.updatePlayerData({
          _id: player._id
        }, {
          password : bcrypt.hashSync(newPassword, bcrypt.genSaltSync(8), null)
        });
        var mailOptions = {
          to: 'pokerscript.net@gmail.com',
          from: 'Byte Poker',
          subject: 'Byte Poker New Password',
          text: 'You are receiving this because you (or someone else) have requested the password for your account.\n\n' +
            'Your new Password is ' + newPassword +  '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        let emailMessage = "";
        defaultTransport.sendMail(mailOptions,  function(error) {
          if(error){
                emailMessage = "there was an error :-(, and it was this: " + error.message;
          }else{
                emailMessage = "Email sent with new Password.";
          }     

        });
        return {
                status: "success",
                message: "Email sent with new Password."
           }

      }else{
        return {
          status: 'fail',
          result: null,
          message: 'Player Not Found.',
          statusCode: 400
        }
      }
      
    }catch(e){
      Sys.Log.info('Error in playerForgotPassword : ' + e);
    }
  },

  playerChangePassword: async function(socket, data){
    try{
      let player = await Sys.Game.Common.Services.PlayerServices.getOneByData({ _id: data.playerId });
      
      if(player){
       
        if(bcrypt.compareSync(data.oldPassword, player.password)) {
          if(data.verifyNewPassword.length >= 6){
            if(data.newPassword == data.verifyNewPassword){
              await Sys.Game.Common.Services.PlayerServices.updatePlayerData({
                _id: data.playerId
              }, {
                password : bcrypt.hashSync(data.newPassword, bcrypt.genSaltSync(8), null)
              });
              return {
                status: 'success',
                message: "Password Updated Successfully",
                statusCode: 200,
              }
            }else{
              return {
                status: 'fail',
                result: null,
                message: 'New password and verify password mismatch.',
                statusCode: 400
              }
            }
          }
          return {
                status: 'fail',
                result: null,
                message: 'Password must be more than six characters',
                statusCode: 400
          }
         
        } else {
          return {
            status: 'fail',
            result: null,
            message: 'Please provide correct old password.',
            statusCode: 400
          }
        }
      }
      return {
        status: 'fail',
        result: null,
        message: 'Player Not Found.',
        statusCode: 400
      }
      
    }catch(e){
      Sys.Log.info('Error in playerChangePassword : ' + e);
    }
  },

  playerPicUpdate: async function(socket, data){
    try{
      let player = await Sys.Game.Common.Services.PlayerServices.getOneByData({ _id: data.playerId });
      
      if(player){
       await Sys.Game.Common.Services.PlayerServices.updatePlayerData({
         _id: data.playerId
       }, {
         profilePic: data.profilePic,
       });
       return {
         status: 'success',
         message: "Profile Updated Successfully.",
         statusCode: 200,
       }
      }
      return {
        status: 'fail',
        result: null,
        message: 'Player Not Found.',
        statusCode: 400
      }
      
    }catch(e){
      Sys.Log.info('Error in playerPicUpdate : ' + e);
    }
  },

  newsBlog: async function(socket, data){
    try{
      let news = await Sys.Game.Common.Services.PlayerServices.getNewsByData({},null, {sort: {createdAt:-1}, limit:10});
      // console.log(news);
      if(news){
       var allNews = [];
       news.forEach(function(n){
       	let longDesc = htmlToText.fromString(n.longDesc, {
          wordwrap: false,
          format: {
    			anchor: function (elem, fn, options) {
    			console.log(elem.attribs.href)
      			var h = fn(elem.children, options);
      			return elem.attribs.href;
      			// return `<link='${elem.attribs.href}'><u>${h}</u></link>`;
    			}
  			}
        });

        // longDesc = longDesc.replace('[', '<link>');
        // longDesc = longDesc.replace(']', '</link>');
        console.log({longDesc})
         allNews.push({
             title: n.title,
             shortDesc: n.shortDesc.trim(),
             longDesc: longDesc
             //longDesc: "Poker is a family of card games that combines gambling, strategy, and skill. All poker variants involve betting as an intrinsic part of play, and determine the winner of each hand.\nPoker is a family of card games that combines gambling, strategy, and skill. All poker variants involve betting as an intrinsic part of play, and determine the winner of each hand."
         });
       }) 
       // console.log(allNews);
       return {
         status: 'success',
         result: allNews,
         message: "News Found.",
         statusCode: 200,
       }
      }
      return {
        status: 'fail',
        result: null,
        message: 'News Not Found.',
        statusCode: 400
      }
      
    }catch(e){
      Sys.Log.info('Error in newsBlog : ' + e);
    }
  },

  cashGameTournary: async function(){
    try{
      let player = await Sys.Game.Common.Services.PlayerServices.getOneByData({ _id: data.playerId, gameType: 'cash' });
      
      if(player){
       return {
         status: 'success',
         result: news,
         message: "CashGame Data Found.",
         statusCode: 200,
       }
      }
      return {
        status: 'fail',
        result: null,
        message: 'CashGame Data Not Found.',
        statusCode: 400
      }
      
    }catch(e){
      Sys.Log.info('Error in cashGameTournary : ' + e);
    }
  },

  test: async function(socket,data){
    try {
      let deck = [];
      await new Sys.Game.CashGame.Texas.Entities.Deck().fillDeck(deck);

     let hkm = '2'; 
      let cardsSortedByRank = [];
      for (let i = 0; i < deck.length; i++) {
            if (deck[i].includes(hkm)){
              console.log("Test Called :",deck[i]);
            }
      } 
      

         // console.log("Test Called :",deck);
    } catch (error) {
        Sys.Log.info('Error in test : ' + error);
    }
  },

  transferChips: async function(socket, data){
    try{
      let m_start_date = moment(new Date(Sys.Setting.maintenance.maintenance_start_date)).format("YYYY-MM-DD HH:mm");
      let m_end_date = moment(new Date(Sys.Setting.maintenance.maintenance_end_date)).format("YYYY-MM-DD HH:mm");
      let current_date = moment(new Date()).format("YYYY-MM-DD HH:mm");

      if( (current_date >= m_start_date && current_date <= m_end_date && Sys.Setting.maintenance.status =='active') || Sys.Setting.maintenance.quickMaintenance == "active" ){
          if(Sys.Setting.maintenance.quickMaintenance == "active"){
            return {
              status: 'fail',
              result: null,
              message: Sys.Setting.maintenance.message + '\n We will come back very shortly!',
              statusCode: 400
            }
          }
          return {
            status: 'fail',
            result: null,
            message: 'System under maintenance you are not allow to transfer chips',
            statusCode: 400
          }
      }else{
        var receiverPlayer = await Sys.Game.Common.Services.PlayerServices.getOneByData({username:data.receiver});
        var player = await Sys.Game.Common.Services.PlayerServices.getOneByData({_id:data.playerId});
        console.log(player.password);
        console.log("password",await bcrypt.compare(data.password, player.password));
        
        if(receiverPlayer && player){
          if(await bcrypt.compare(data.password, player.password)) {
          if (data.playerId != receiverPlayer.id) {
            if (player.isCash == true && receiverPlayer.isCash == true) {
              let trasaction = {
                to:receiverPlayer.id,
                from:data.playerId,
                chips:data.chips,
                fromRole:'player',
                action:'Add',
                toRole:'player'
              }      
              let response= await Sys.Helper.Poker.Transaction(trasaction);
              console.log(response);    
              // return {status: 'success',result: player,message: 'Chips Transfer Successfully'}
            }else {
              console.log("Error when transferChips receiver or sender not cash player :receiver.isCash : ", receiverPlayer.isCash,"sender.isCash :",player.isCash );
              return {status: 'fail',result: null,message: 'You have not allowed transfer in your account',statusCode: 400}
            }
          }else{
            console.log("transferChips player id and receiver id is same: ", receiverPlayer);
            return {status: 'fail',result: null,message: 'You have not allowed transfer in your account',statusCode: 400}
          }
        }else{
          console.log("Error when transferChips player password not match ");
          return {status: 'fail',result: null,message: 'Password was wrong',statusCode: 400}
        }
      }else {
          console.log("transferChips receiver username was wrong: ", receiverPlayer);
          return {status: 'fail',result: null,message: 'Player Not Found!',statusCode: 400}
      }
     // return {status: 'fail',result: null,message: 'Currently,this feature is not available!',statusCode: 400}
     return {status: 'success',result: player,message: 'Chips Transfer Successfully'}
      }
    }catch(error){
      Sys.Log.info('Error when player chips transfer: ' + error);
      console.log("Error when player chips transfer: ", error);
      return {status: 'fail',result: null,message: error.message,statusCode: 400}
    }
  },


  sendIPAddress: async function(socket, data){
    try{

      var loginData = {
        player: data.playerId,
        ip: data.ipAddress,
        flag: data.eventName,
        client: data.os
      }

      await Sys.App.Services.ChipsHistoryServices.insertLoginHistoryData(loginData);

      return {status: 'success',result: [],message: 'Login history save successfully'}

    }catch(error){
      console.log("error when sendIPAddress event called: ", error);
    }
  },

  verifyIdentifierToken: async function(socket, data){
    try {
      console.log("verifyIdentifierToken", data);
      data.identifiertoken = JSON.parse(data.identifiertoken);
      console.log("data.identifiertoken", data.identifiertoken);
      let player = await Sys.Game.Common.Services.PlayerServices.getOneByData({ identifiertoken: data.identifiertoken.token });
      if(player){
        await Sys.Game.Common.Services.PlayerServices.updatePlayerData({
          _id: player._id
        }, {
          $set: {
            identifiertoken: '',
            loginToken:null ,
            socketId: socket.id,
            platform_os: data.os
          }
        });

        console.log("result data while sending response of verifyIdentifierToken", {
          playerId: player.id,
          username: player.username,
          chips: player.chips,
          cash: player.cash,
          profilePic: player.profilePic,
          isCash: player.isCash,
          isMultipleTableAllowed: (Sys.Setting.multitable_status == 'active') ? true : false,
        });
        return {
          status: 'success',
          result: {
            playerId: player.id,
            username: player.username,
            chips: player.chips,
            cash: player.cash,
            profilePic: player.profilePic,
            isCash: player.isCash,
            isMultipleTableAllowed: (Sys.Setting.multitable_status == 'active') ? true : false,
            isChipsTransferAllowed: (player.isCash == true) ? true : false, 
          },
          message: 'Player Successfully Login!'
        }
      }

      console.log("Player not found");
      return {
        status: 'fail',
        result: null,
        message: 'Player Not Found',
        statusCode: 400
      }
    }
    catch(e){
      Sys.Log.info('Error in getting player IdentifierToken : ' + e);
      return {
        status: 'fail',
        result: null,
        message: 'Error Verifying Identifier Token',
        statusCode: 400
      }
    }
  },

  updateAccountNumber: async function(socket, data) {
    try {
      const result = await Sys.Game.Common.Services.PlayerServices.insertRequest(data);
      if (result) {
        return {
          status: 'success',
          result: null,
          message: 'Request Successfully Sent'
        }
      } else {
        return {
          status: 'fail',
          result: null,
          message: 'Something Went Wrong, Please try again',
          statusCode: 400
        }
      }
    } catch (err) {
      return {
        status: 'fail',
        result: null,
        message: 'Something Went Wrong, please try again',
        statusCode: 400
      }
    }
  },

  uploadDepositReceipt: async function (socket, data) {
    try {
      console.log('data: ', data);
      let depositChips = +data.depositChips
      if (depositChips < 1 || depositChips == null) {
        return {
          status: 'failed',
          result: null,
          message: 'Invalid Deposit Chips.',
        }
      }
      // Convert Base64 to image.
      let fs = require('fs');
      // string generated by canvas.toDataURL()
      let img = data.receipt;
      // var img2 = data.img2;
      // get picture extension
      let extension = 'null';
      //  let extension = img.substring("imgData:image/".length, img.indexOf(";base64"));
      let firstChar = data.receipt.charAt(0);
      if (firstChar == '/') {
        extension = 'jpg';
      } else if (firstChar == 'i') {
        extension = 'png';
      } else if (firstChar == 'R') {
        extension = 'gif';
      } else if (firstChar == 'J') {
        extension = 'pdf';
      }

      if (extension == 'gif' || extension == 'null') {
        const depositData = {
          depositAmount: data.depositChips,
          playerId: data.playerId,
          receipt: ''
        }
        const result = await Sys.Game.Common.Services.PlayerServices.insertDepositReceipt(
          depositData
        );
        if (!result || result instanceof Error) {
          return {
            status: 'failed',
            result: null,
            message: 'Something went wrong. Try again.',
          };
        }
        const newDepositReceipt = await Sys.Game.Common.Services.PlayerServices.getNewDepositCount({seen: false})
        await Sys.Io.emit('depositNotification',{
          count: newDepositReceipt
        });
        return {
          status: 'success',
          result: null,
          message: 'Successfully Sent',
        };
        /* return {
          status: 'fail',
          result: null,
          message: 'Invalid file format, File should be jpg or png!',
          statusCode: 400,
        }; */
      }

      // extension2 = 'pdf';
      // strip off the data: url prefix to get just the base64-encoded bytes
      let imgData = img.replace(/^imgData:img\/\w+;base64,/, '');
      let buf = new Buffer(imgData, 'base64');
      let hostname = socket.handshake.headers.host;
      let randomNum = Math.floor(100000 + Math.random() * 900000);

      fs.writeFile(
        'public/assets/deposit/' +
          data.playerId +
          '_' +
          randomNum +
          '_doc.' +
          extension,
        buf,
        async (err) => {
          if (err) {
            console.log('Error', err);
            return {
              status: 'failed',
              result: null,
              message: 'Something went wrong',
            };
          }
          console.log('The file has been saved!');
        }
      );
      const depositData = {
        depositAmount: data.depositChips,
        playerId: data.playerId,
        receipt: `/assets/deposit/${data.playerId}_${randomNum}_doc.${extension}`
      }
      const result = await Sys.Game.Common.Services.PlayerServices.insertDepositReceipt(
        depositData
      );
      if (!result || result instanceof Error) {
        return {
          status: 'failed',
          result: null,
          message: 'Something went wrong. Try again.',
        };
      }
      const newDepositReceipt = await Sys.Game.Common.Services.PlayerServices.getNewDepositCount({seen: false})
      await Sys.Io.emit('depositNotification',{
        count: newDepositReceipt
      });
      return {
        status: 'success',
        result: null,
        message: 'Successfully Sent',
      };
    } catch (err) {}
  },

  withdraw: async function (socket, data) {
    try {
      console.log('data: ', data);
      let player = await Sys.Game.Common.Services.PlayerServices.getOneByData({
        _id: data.playerId,
      });
      if (!player || player instanceof Error) {
        return {
          status: 'failed',
          result: null,
          message: 'Player not found',
        };
      }
      if (data.withdrawAmount > player.chips) {
        return {
          status: 'failed',
          result: null,
          message: `You have only ${player.chips}`,
        };
      }
      if (data.withdrawAmount < 1) {
        return {
          status: 'failed',
          result: null,
          message: `Invalid Withdraw Chips`,
        };
      }
      let remainingChips = parseFloat(parseFloat(player.chips) - parseFloat(data.withdrawAmount));
      data.remainingChips = remainingChips;
      const withdraw = await Sys.Game.Common.Services.PlayerServices.insertWithdrawData(
        data
      );
      if (!withdraw || withdraw instanceof Error) {
        return {
          status: 'failed',
          result: null,
          message: 'Something went wrong. Try again.',
        };
      }
      // player = await Sys.App.Services.PlayerServices.getSinglePlayerData({_id: withdraw.playerId});
      if (player) {
        let parentAgent = await Sys.App.Services.UserServices.getSingleUserData({ isSuperAdmin: true });

        console.log("parentAgent: ", parentAgent);

        let newChips;
        let parentAgentUpdatedCash;
        
          if(parseFloat(player.chips) >=  parseFloat(withdraw.withdrawAmount)){
            newChips = parseFloat(parseFloat(player.chips) - parseFloat(withdraw.withdrawAmount));
            parentAgentUpdatedCash = parseFloat(parentAgent.chips) + parseFloat(withdraw.withdrawAmount);

            let transactionAdminDebitData = {
              user_id: player.id,
              username: player.username,
              chips: parseFloat(withdraw.withdrawAmount),
              previousBalance: parseFloat(player.chips),
              afterBalance: parseFloat(newChips),
              category: 'debit',
              type: 'entry',
              remark: 'Debit chips by '+parentAgent.email,
              isTournament: 'No',
              isGamePot: 'no'
            }

            console.log("admin chips debit to player transactionAdminDebitData: ", transactionAdminDebitData);
            await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionAdminDebitData);
          }else{
            console.log("player else")
            await Sys.Game.Common.Services.PlayerServices.deleteWithdrawData(
              {_id:withdraw.id}
            );
            return {
              status: 'failed',
              result: null,
              message: 'Something went wrong. Try again.',
            };
          }
      
        await Sys.App.Services.PlayerServices.updatePlayerData({ _id: withdraw.playerId },{ chips:newChips});
        await Sys.Io.to([player.socketId]).emit('OnPlayerChipsUpdate', {playerId: player.id, playersChips : newChips });
        await Sys.App.Services.UserServices.updateUserData({
          _id: parentAgent.id
        },{
          chips: eval( parseFloat(parentAgentUpdatedCash).toFixed(2) )
        });
        let traNumber = + new Date()
        await Sys.App.Services.AllUsersTransactionHistoryServices.insertData({
          'receiverId': withdraw.playerId,
          'receiverRole' : 'Player',
          'providerId': parentAgent.id,
          'providerRole': 'admin',
          'providerEmail': parentAgent.email,
          'chips': parseFloat( parseFloat(withdraw.withdrawAmount).toFixed(2) ),
          'cash': '',
          'remark' : 'deduct',
          'transactionNumber': 'DE-'+ traNumber,
          'beforeBalance' : eval( parseFloat(player.chips).toFixed(2) ),
          'afterBalance' : eval( parseFloat(newChips).toFixed(2) ),
          'type': 'deduct',
          'category': 'debit',
          'status': 'success',
        });
        await Sys.App.Services.AllUsersTransactionHistoryServices.insertData({
          'receiverId': parentAgent.id,
          'receiverRole' : 'admin',
          'providerId': withdraw.playerId,
          'providerRole': 'Player',
          'providerEmail': player.username+" (player)",
          'chips': parseFloat( parseFloat(withdraw.withdrawAmount).toFixed(2) ),
          'cash': '',
          'remark' : 'credit',
          'transactionNumber': 'DEP-'+ traNumber,
          'beforeBalance' : eval( parseFloat(parentAgent.chips).toFixed(2) ),
          'afterBalance' : eval( parseFloat(parentAgentUpdatedCash).toFixed(2) ),
          'type': 'deposit',
          'category':  'credit',    
          'status': 'success',
        });

        var noteDetail = await Sys.App.Services.agentServices.getSingleChipsNote({'requestById':parentAgent.id,'requestToId':withdraw.playerId});
        if(noteDetail == null){
          await Sys.App.Services.agentServices.insertChipsNoteData({
            requestById: parentAgent.id,
            requestToId: withdraw.playerId,
            note: "deduct",
            type:'player'
          });
        }else{
          await Sys.App.Services.agentServices.updateChipsNoteData({'_id':noteDetail._id},{'note':'deposit'});
        }
        const newWithdrawReq = await Sys.Game.Common.Services.PlayerServices.getNewWithdrawCount({seen: false})
        await Sys.Io.emit('withdrawNotification',{
          count: newWithdrawReq
        });
        return {
          status: 'success',
          result: null,
          message: 'Successfully Sent',
        };
      }else{
        console.log("errrrr")
        await Sys.Game.Common.Services.PlayerServices.deleteWithdrawData(
          {_id:withdraw.id}
        );
        return {
          status: 'failed',
          result: null,
          message: 'Something went wrong. Try again.',
        };
      }
    } catch (err) {
      console.log(err)
      return {
        status: 'failed',
        result: null,
        message: 'Something went wrong. Try again.',
      };
    }
  },

  getPlayerAccountInfo: async function (socket, data) {
    try {
      const playerInfo = await Sys.Game.Common.Services.PlayerServices.getOneByData(
        {
          _id: data.playerId,
        },
        ['username', 'accountNumber', 'mobile']
      );
      console.log({ playerInfo });
      if (!playerInfo || playerInfo instanceof Error) {
        return {
          status: 'failed',
          result: null,
          message: 'Something went wrong. Try again.',
        };
      }
      return {
        status: 'success',
        result: playerInfo,
      };
    } catch (err) {
      console.log(err);
    }
  },

    getPlayerToken: async function (socket, data) {
    try {
      let player = await Sys.Game.Common.Services.PlayerServices.getOneByData({
        _id: data.playerId,
      });
      console.log("player", player);
      const token = await randomString(36);

      const response = await Sys.Game.Common.Services.PlayerServices.updatePlayerData({
        _id: data.playerId
        },{$set: {"HTMLToken": token}});
      console.log({response});
      return {
        status: 'success',
        result: token,
        message: 'Successfully Sent',
      };
    } catch (err) {
      console.log(err);
    }
  }
}
async function randomString(length) {
  var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = '';
  for (var i = length; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}
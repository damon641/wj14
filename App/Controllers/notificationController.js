var Sys = require('../../Boot/Sys');
var bcrypt = require('bcryptjs');


module.exports = {
  notification: async function(req,res){
    try {
      let notification = await Sys.App.Services.notificationServices.getNotificationData();
      var data = {
        App : Sys.Config.App.details,Agent : req.session.details,
        error: req.flash("error"),
        success: req.flash("success"),
        notification : notification,
        notificationActive : 'active'
      };
      return res.render('notification/notification',data);
    }
    catch (e) {
      req.flash('error','Error in notification');
      res.redirect('/');
      console.log("Error in notification :", e);
    }
  },

  notificationUpdate: async function(req , res){
    try {
      let notification = await Sys.App.Services.notificationServices.getNotificationData({_id: req.body.id});
      if (notification) {
        await Sys.App.Services.notificationServices.updateNotificationData({
          _id: req.body.id
        }, {
          notification: req.body.notification,
        });

        Sys.notification = await Sys.App.Services.notificationServices.getNotificationData({});

        req.flash('success','Notification update successfully');
        res.redirect('/notification');

        let allPlayer = await Sys.App.Services.PlayerServices.getByData({'socketId':{$ne:''}});
        var playerIdArr = [];
        if(allPlayer.length > 0){
          for(var i=0; i<allPlayer.length; i++){
            playerIdArr.push(allPlayer[i].id);
          }
        }

      let allRoom = await Sys.App.Services.RoomServices.getByData({'isTournamentTable' : false});

      var playingIdArr = [];
      if(allRoom.length > 0){
        for(var j = 0; j<allRoom.length; j++){
          var roomData = allRoom[j];
          if(roomData.players.length > 0){
            for(var k=0; k<roomData.players.length; k++){
              var playerData = roomData.players[k];
              var playerId = playerData.id;

              if(playerData.status=="Playing"){
                playingIdArr.push(playerId);
              }

            }
          }
        }
      }

      var tourAllRoom = await Sys.App.Services.RoomServices.getByData({'isTournamentTable' : true});

      var tourPlayingIdArr = [];
      var tourPlayingNameArr = [];
      if(tourAllRoom.length > 0){
        for(var m = 0; m<tourAllRoom.length; m++){
          var tourRoomData = tourAllRoom[m];
          if(tourRoomData.players.length > 0){
            for(var n=0; n<tourRoomData.players.length; n++){
              if(tourRoomData.players[n].status=="Playing"){
                var tourPlayerId = tourRoomData.players[n].id;
                tourPlayingIdArr.push(tourPlayerId);
                tourPlayingNameArr.push(tourRoomData.players[n].playerName);
              }
            }
          }
        }
      }

      for(var l=0; l<playerIdArr.length; l++){
        var playerId = playerIdArr[l];
        if(playingIdArr && tourPlayingIdArr){
          var playerDetail = await Sys.App.Services.PlayerServices.getSinglePlayerData({'_id':playerId});
          var socketId = playerDetail.socketId;
          var message = await Sys.App.Services.notificationServices.getByData();
          for(let j=0;j<message.length;j++)
          {
            let con = message[j].notification;
            let msg = con.replace(/\r/g,"<br>");
            if(socketId != ""){
              await Sys.Io.to(socketId).emit('adminNotification',{
                playerId :  playerId,
                message: msg,
              });
            }  
          }
                        
        }           
      }
      }
      else{
        req.flash('error','Error Updating notification');
        res.redirect('/notification');
      }
    }
    catch (e){
      req.flash('error','Error Updating Notification');
      res.redirect('/notification');
      console.log("Error in notificationUpdate :", e);
    }
  },

  notificationAdd : async function (req , res){
    try {
      await Sys.App.Services.notificationServices.insertNotificationData({
        notification: req.body.notification       
      });

      Sys.notification = await Sys.App.Services.notificationServices.getNotificationData({});

      req.flash('success','Notification create successfully');
      res.redirect('/notification');

      let allPlayer = await Sys.App.Services.PlayerServices.getByData({'socketId':{$ne:''}});
      var playerIdArr = [];
      if(allPlayer.length > 0){
        for(var i=0; i<allPlayer.length; i++){
          playerIdArr.push(allPlayer[i].id);
        }
      }

      let allRoom = await Sys.App.Services.RoomServices.getByData({'isTournamentTable' : false});

      var playingIdArr = [];
      if(allRoom.length > 0){
        for(var j = 0; j<allRoom.length; j++){
          var roomData = allRoom[j];
          if(roomData.players.length > 0){
            for(var k=0; k<roomData.players.length; k++){
              var playerData = roomData.players[k];
              var playerId = playerData.id;

              if(playerData.status=="Playing"){
                playingIdArr.push(playerId);
              }
            }
          }
        }
      }

      var tourAllRoom = await Sys.App.Services.RoomServices.getByData({'isTournamentTable' : true});

      var tourPlayingIdArr = [];
      var tourPlayingNameArr = [];
      if(tourAllRoom.length > 0){
        for(var m = 0; m<tourAllRoom.length; m++){
          var tourRoomData = tourAllRoom[m];
          if(tourRoomData.players.length > 0){
            for(var n=0; n<tourRoomData.players.length; n++){
              if(tourRoomData.players[n].status=="Playing"){
                var tourPlayerId = tourRoomData.players[n].id;
                tourPlayingIdArr.push(tourPlayerId);
                tourPlayingNameArr.push(tourRoomData.players[n].playerName);
              }
            }
          }
        }
      }

      for(var l=0; l<playerIdArr.length; l++){
        var playerId = playerIdArr[l];
        if(playingIdArr && tourPlayingIdArr){
          var playerDetail = await Sys.App.Services.PlayerServices.getSinglePlayerData({'_id':playerId});
          var socketId = playerDetail.socketId;
          var message = await Sys.App.Services.notificationServices.getByData();
          for(let j=0;j<message.length;j++)
          {
            let con = message[j].notification;
            let msg = con.replace(/\r/g,"<br>");
            if(socketId != ""){
              await Sys.Io.to(socketId).emit('adminNotification',{
                playerId :  playerId,
                message:msg,
              });
            }  
          }
                        
        }           
      }
    }
    catch (e){
      req.flash('error','Error Adding Setting');
      res.redirect('/notification');
      console.log("Error in notificationAdd :", e);
    }
  },
}
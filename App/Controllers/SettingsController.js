var Sys = require('../../Boot/Sys');
var bcrypt = require('bcryptjs');
const moment =require('moment');
const pm2     = require('pm2');

module.exports = {
  settings: async function(req,res){
    try {
      let settings = await Sys.App.Services.SettingsServices.getSettingsData();
      var data = {
        App : Sys.Config.App.details,Agent : req.session.details,
        error: req.flash("error"),
        success: req.flash("success"),
        setting : settings,
        settingActive : 'active'
      };
      return res.render('settings/settings',data);
    }
    catch (e) {
      req.flash('error','Error in Settings');
      res.redirect('/');
      console.log("Error in settings :", e);
    }
  },

  settingsUpdate: async function(req , res){
    try {
      let settings = await Sys.App.Services.SettingsServices.getSettingsData({_id: req.body.id});
      if (settings) {
        await Sys.App.Services.SettingsServices.updateSettingsData({
          _id: req.body.id
        }, {
          rakePercenage: req.body.rakePercenage,
          adminExtraRakePercentage: req.body.adminExtraRakePercentage,
          defaultChips: req.body.chips,
          notification: req.body.notification,
          BackupDetails:{
            db_backup_days: req.body.db_backup_days,
            db_next_backup_date: moment().add(req.body.db_backup_days, 'days').format("YYYY-MM-DD"), 
            db_host: req.body.db_host,
            db_username: req.body.db_username,
            db_password: req.body.db_password,
            db_name: req.body.db_name,
          },
          processId: req.body.processId,
          android_version: req.body.android_version,
          ios_version: req.body.ios_version,
          android_store_link: req.body.android_store_link,
          ios_store_link: req.body.ios_store_link,
          multitable_status: req.body.multitable_status,
         // expireTime: req.body.expireTime
        });

        Sys.Setting = await Sys.App.Services.SettingsServices.getSettingsData({});

        req.flash('success','Settings update successfully');
        res.redirect('/settings');
      }
      else{
        req.flash('error','Error Updating Settings');
        res.redirect('/settings');
      }
    }
    catch (e){
      req.flash('error','Error Updating Settings');
      res.redirect('/settings');
      console.log("Error in settingsUpdate :", e);
    }
  },

  settingsAdd : async function (req , res){
    try {
      await Sys.App.Services.SettingsServices.insertSettingsData({
        rakePercenage: req.body.rakePercenage,
        adminExtraRakePercentage: req.body.adminExtraRakePercentage,
        defaultChips: req.body.chips,
        notification: req.body.notification,
        BackupDetails:{
          db_backup_days: req.body.db_backup_days,
          db_next_backup_date: moment().add(req.body.db_backup_days, 'days').format("YYYY-MM-DD"), 
          db_host: req.body.db_host,
          db_username: req.body.db_username,
          db_password: req.body.db_password,
          db_name: req.body.db_name,
        },
         processId: req.body.processId,
         android_version: req.body.android_version,
         ios_version: req.body.ios_version,
         android_store_link: req.body.android_store_link,
         ios_store_link: req.body.ios_store_link,
         multitable_status: req.body.multitable_status,
       // expireTime: req.body.expireTime
      });

      Sys.Setting = await Sys.App.Services.SettingsServices.getSettingsData({});

      req.flash('success','Settings create successfully');
      res.redirect('/settings');
    }
    catch (e){
      req.flash('error','Error Adding Setting');
      res.redirect('/settings');
      console.log("Error in settingsAdd :", e);
    }
  },

  maintenance: async function(req, res){
    try {
       
      //var settings = await Sys.App.Services.SettingsServices.getSettingsData();
       //console.log("settings ->>>>>>",Sys.Setting.maintenance);
       console.log("settings ->>>>>>",Sys.Setting);
      if(Sys.Setting.maintenance == undefined){
         await Sys.App.Services.SettingsServices.updateSettingsData(
          {
            _id: Sys.Setting._id
          },{
            maintenance:{
              'maintenance_start_date': moment().format("YYYY-MM-DD HH:mm"),
              'maintenance_end_date': moment().format("YYYY-MM-DD HH:mm"),
              'time_difference': 0,
              'message': 'This Application is Under Maintenance.',
              'showBeforeMinutes': '90',
              'status': 'inactive',
              'quickMaintenance': 'inactive'
            }
          });
          Sys.Setting = await Sys.App.Services.SettingsServices.getSettingsData({});
      }
      
      let resPromise= new Promise((resolve, reject) => {
        pm2.describe(Sys.Setting.processId, (err, res) => {
          if(err){
            reject(err);
          }
          resolve(res);
        });
      });
      
      resPromise.then(function(val){
         
        var restartCount = (val.length == 0)? 0 : (val[0].pm2_env.restart_time);
        var data = {
          App : Sys.Config.App.details,Agent : req.session.details,
          error: req.flash("error"),
          success: req.flash("success"),
          setting : Sys.Setting,
          maintenanceActive : 'active',
          restartCount: restartCount
        };
        return res.render('settings/maintenance',data);
      })
      
    }
    catch (e) {
      req.flash('error','Error in maintenance');
      res.redirect('/');
      console.log("Error in maintenance :", e);
    }
  },


  /*maintenanceStatusChange: async function(req, res){
    try{
      let settings = await Sys.App.Services.SettingsServices.getSettingsData();
      if (settings || settings.length >0) {
        
        if(settings.maintenance.status == 'active'){
          settings.maintenance.status = 'inactive';
          
        }else{
          settings.maintenance.status = 'active';
        }
        await Sys.App.Services.SettingsServices.updateSettingsData(
          {
            _id: req.body.id
          },{
            maintenance:settings.maintenance
          }
          )
        return res.send("success");
      }else {
        return res.send("error");
        req.flash('error', 'Problem while updating Status.');
      }

    } catch (e){
      console.log("Error",e);
    }
  },*/

  editMaintenance: async function(req, res){
    try {
          let settings = await Sys.App.Services.SettingsServices.getSettingsData();
          let maintenance_start_date = moment(settings.maintenance.maintenance_start_date).format("YYYY-MM-DD HH:mm");
          if(settings.maintenance.maintenance_start_date == null || settings.maintenance.maintenance_start_date == undefined || settings.maintenance.maintenance_start_date ==''){
            let maintenance_start_date = moment(settings.maintenance.maintenance_start_date).format("YYYY-MM-DD HH:mm");
          }
          let maintenance_end_date = moment(settings.maintenance.maintenance_end_date).format("YYYY-MM-DD HH:mm");
          if(settings.maintenance.maintenance_end_date == null || settings.maintenance.maintenance_end_date == undefined || settings.maintenance.maintenance_end_date ==''){
            let maintenance_end_date = moment(settings.maintenance.maintenance_end_date).format("YYYY-MM-DD HH:mm");
          }
        
         let current_date = moment().format("YYYY-MM-DD HH:mm");
         console.log("STARAT",current_date)
         let isMaintenance = false;
        
         if( (current_date >= maintenance_start_date && current_date <= maintenance_end_date && Sys.Setting.maintenance.status == "active") ||  Sys.Setting.maintenance.quickMaintenance == "active"){
           isMaintenance =true;
         }
 
          var data = {
            App : Sys.Config.App.details,Agent : req.session.details,
            error: req.flash("error"),
            success: req.flash("success"),
            setting : settings,
            settingActive : 'active',
            maintenance_start_date: maintenance_start_date,
            maintenance_end_date: maintenance_end_date,
            isMaintenance: isMaintenance
          };
          return res.render('settings/maintenanceEdit',data);
        }
        catch (e) {
          req.flash('error','Error in Settings');
          res.redirect('/maintenance');
          console.log("Error in settings :", e);
        }
   },
 
  
   updateMaintenance: async function(req, res){
    try {      
      if( Sys.Setting.maintenance.quickMaintenance != "active"){
        let settings = await Sys.App.Services.SettingsServices.getSettingsData({_id: req.params.id});
        let recentTime = moment().format("YYYY-MM-DD HH:mm");
        let TimeDiff;
        if(recentTime > req.body.maintenance_start_date){
          TimeDiff = moment(req.body.maintenance_end_date).diff(moment(recentTime),'seconds');
        }else{
          TimeDiff = moment(req.body.maintenance_end_date).diff(moment(req.body.maintenance_start_date),'seconds');
        }
        console.log("TIME DIFFFFF",TimeDiff)

        if (settings) {
          await Sys.App.Services.SettingsServices.updateSettingsData({
            _id: req.params.id
          }, {
              maintenance:{
                maintenance_start_date: (req.body.maintenanceCheck == 'true') ? settings.maintenance.maintenance_start_date : req.body.maintenance_start_date,
                maintenance_end_date: req.body.maintenance_end_date,
                time_difference: TimeDiff,
                message:req.body.message,
                showBeforeMinutes: req.body.showBeforeMinutes,
                status: (req.body.status) ? req.body.status : 'active',
                quickMaintenance: settings.maintenance.quickMaintenance,
              }
          });

          clearTimeout(Sys.Timers.Maintenance);
          clearTimeout(Sys.Timers.MaintenanceStart);
          clearTimeout(Sys.Timers.MaintenanceStop)
          Sys.Setting = await Sys.App.Services.SettingsServices.getSettingsData({});
        
        //START: chirag 31-08-2019 game under maintenance code 
          let m_start_date = moment(new Date(Sys.Setting.maintenance.maintenance_start_date)).format("YYYY-MM-DD HH:mm");
          console.log(" MAINTENANCE START DATE",m_start_date)
          let m_end_date = moment(new Date(Sys.Setting.maintenance.maintenance_end_date)).format("YYYY-MM-DD HH:mm");
          console.log("MAINTENANCE END DATE",m_end_date)
          let current_date = moment().format("YYYY-MM-DD HH:mm");
          console.log("CURRENT DATE",current_date)

          if(current_date >= m_start_date && current_date <= m_end_date && Sys.Setting.maintenance.status == "active"){          
            Sys.Config.App.details.maintenanceMode = true; 
            let allPlayer = await Sys.App.Services.PlayerServices.getByData({'socketId':{$ne:''}});
            var playerIdArr = [];
            if(allPlayer.length > 0){
              for(var i=0; i<allPlayer.length; i++){
                playerIdArr.push(allPlayer[i].id);
              }
            }
           
            let betweenTime = Sys.Setting.maintenance.time_difference;
            console.log("BETWEEN TIME",betweenTime,current_date)
            Sys.Timers.MaintenanceStop = setTimeout(async function(){
              console.log("ITS HERE",moment().format("YYYY-MM-DD HH:mm"))
               await Sys.App.Services.SettingsServices.updateSettingsData({
                  _id: req.params.id
                }, {
                    maintenance:{
                      maintenance_start_date: req.body.maintenance_start_date,
                      maintenance_end_date: req.body.maintenance_end_date,
                      time_difference: TimeDiff,
                      message:req.body.message,
                      showBeforeMinutes: req.body.showBeforeMinutes,
                      status: 'inactive',
                      quickMaintenance: settings.maintenance.quickMaintenance,
                    }
                });
              
                Sys.Setting = await Sys.App.Services.SettingsServices.getSettingsData({});
                Sys.Config.App.details.maintenanceMode = false; 
            },betweenTime * 1000);

            console.log("playerIdArr: ", playerIdArr);
            let allRoom = await Sys.App.Services.RoomServices.getByData({'isTournamentTable' : false});

            console.log("allRoom.length: ", allRoom.length);

            var playingIdArr = [];
            if(allRoom.length > 0){
              for(var j = 0; j<allRoom.length; j++){
                var roomData = allRoom[j];
                if(roomData.players.length > 0){
                  for(var k=0; k<roomData.players.length; k++){
                    var playerData = roomData.players[k];
                    var playerId = playerData.id;

                    console.log("updateMaintenance playerData.status: ", playerData.status);

                    if(playerData.status=="Playing"){
                      playingIdArr.push(playerId);
                    }

                    if(playerData.status=="Waiting"){
                      await Sys.Game.CashGame.Texas.Controllers.RoomProcess.leftRoom({roomId:roomData.id,playerId:playerId});
                    }

                    if(playerData.status=="Ideal"){
                      await Sys.Game.CashGame.Texas.Controllers.RoomProcess.leftRoom({roomId:roomData.id,playerId:playerId});
                    }

                    if(playerData.status=="Playing" && roomData.status == "Finished"){
                      await Sys.Game.CashGame.Texas.Controllers.RoomProcess.leftRoom({roomId:roomData.id,playerId:playerId});
                    }
                  }
                }
              }
            }

            console.log("playingIdArr: ", playingIdArr);

            var tourAllRoom = await Sys.App.Services.RoomServices.getByData({'isTournamentTable' : true});

            console.log("tourAllRoom.length: ", tourAllRoom.length);

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

            console.log("tourPlayingIdArr: ", tourPlayingIdArr);
            console.log("tourPlayingNameArr: ", tourPlayingNameArr);

            for(var l=0; l<playerIdArr.length; l++){
              var playerId = playerIdArr[l];
              console.log("playingIdArr.indexOf(playerId): ", playingIdArr.indexOf(playerId));
              console.log("playerIdArr[l]: ", playerIdArr[l]);
              console.log("CHECK INDEX",playingIdArr.indexOf(playerId) == -1)
              if(playingIdArr.indexOf(playerId) == -1 && tourPlayingIdArr.indexOf(playerId) == -1){
                var playerDetail = await Sys.App.Services.PlayerServices.getSinglePlayerData({'_id':playerId});
               console.log("playerDetail",playerDetail)
                var socketId = playerDetail.socketId;
                console.log("SOCKET ID",socketId)
                if(socketId != ""){
                  await Sys.Io.to(socketId).emit('forceLogOut',{
                    playerId :  playerId,
                    message: Sys.Setting.maintenance.message + '\n You can login after ' + Sys.Setting.maintenance.maintenance_end_date
                  });

                  console.log("ITS HERE 1",moment().format("YYYY-MM-DD HH:mm"))
                  //await Sys.Io.sockets.connected[socketId].disconnect();

                  await Sys.Game.Common.Services.PlayerServices.update({_id: playerId},{socketId:''});

                }                
              }           
            }

            //await Sys.Io.emit('maintenanceServer',{status:'success', 'message':'Server gose under maintenance in '+req.body.showBeforeMinutes+' minutes'});
            var message = ' Server ce se za '+req.body.showBeforeMinutes+' minute ugasiti i ponovno pokrenit. \n Der Server wird in '+req.body.showBeforeMinutes+' Minuten neu gestartet.' 
            await Sys.Io.emit('maintenanceServer',{status:'success', 'message':message});
          }else{
            let now = moment().format("YYYY-MM-DD HH:mm");
            console.log("NOW TIME",now);
            let isBeforeStart = moment(now).isBefore(m_start_date);
            let isBeforeEnd = moment(now).isBefore(m_end_date);
            console.log("IS BEFORE TIME",isBeforeStart,isBeforeEnd)
            if(isBeforeStart && isBeforeEnd && Sys.Setting.maintenance.status == "active"){
              let start_date = moment(Sys.Setting.maintenance.maintenance_start_date).subtract(Sys.Setting.maintenance.showBeforeMinutes, 'minutes');
              let startTime = moment(Sys.Setting.maintenance.maintenance_start_date).diff(now,'milliseconds');
              console.log("START TIME", startTime);
              const timer = start_date.diff(now, 'milliseconds');
              console.log("TIMER",timer)
              if(timer != 0){
                
                Sys.Timers.Maintenance = setTimeout(async function(){
                  var message = ' Server ce se za '+req.body.showBeforeMinutes+' minute ugasiti i ponovno pokrenit. \n Der Server wird in '+req.body.showBeforeMinutes+' Minuten neu gestartet.' 
                  await Sys.Io.emit('maintenanceServer',{status:'success', 'message':message});
                  now = moment().format("YYYY-MM-DD HH:mm");
                  let end_date = moment(Sys.Setting.maintenance.maintenance_end_date);

                  Sys.Timers.MaintenanceStart = setTimeout(async function(){
                    Sys.Config.App.details.maintenanceMode = true; 
                    let allPlayer = await Sys.App.Services.PlayerServices.getByData({'socketId':{$ne:''}});
                    var playerIdArr = [];
                    if(allPlayer.length > 0){
                      for(var i=0; i<allPlayer.length; i++){
                        playerIdArr.push(allPlayer[i].id);
                      }
                    }

                    let betweenTime = Sys.Setting.maintenance.time_difference;
                    Sys.Timers.MaintenanceStop = setTimeout(async function(){
                      console.log("START MAIN TEN NANCE  STOP TIME",moment().format("YYYY-MM-DD HH:mm"))
                    let updateData =  await Sys.App.Services.SettingsServices.updateSettingsData({
                        _id: req.params.id
                      }, {
                          maintenance:{
                            maintenance_start_date: req.body.maintenance_start_date,
                            maintenance_end_date: req.body.maintenance_end_date,
                            time_difference: TimeDiff,
                            message:req.body.message,
                            showBeforeMinutes: req.body.showBeforeMinutes,
                            status: 'inactive',
                            quickMaintenance: settings.maintenance.quickMaintenance,
                          }
                      });
                      console.log("UPDATE DATA",updateData)
                      Sys.Setting = await Sys.App.Services.SettingsServices.getSettingsData({});
                      Sys.Config.App.details.maintenanceMode = false; 
                    },betweenTime * 1000);
          
                    console.log("playerIdArr: ", playerIdArr);
                    let allRoom = await Sys.App.Services.RoomServices.getByData({'isTournamentTable' : false});
          
                    console.log("allRoom.length: ", allRoom.length);
          
                    var playingIdArr = [];
                    if(allRoom.length > 0){
                      for(var j = 0; j<allRoom.length; j++){
                        var roomData = allRoom[j];
                        if(roomData.players.length > 0){
                          for(var k=0; k<roomData.players.length; k++){
                            var playerData = roomData.players[k];
                            var playerId = playerData.id;
          
                            console.log("updateMaintenance playerData.status: ", playerData.status);
          
                            if(playerData.status=="Playing"){
                              playingIdArr.push(playerId);
                            }
          
                            if(playerData.status=="Waiting"){
                              await Sys.Game.CashGame.Texas.Controllers.RoomProcess.leftRoom({roomId:roomData.id,playerId:playerId});
                            }
          
                            if(playerData.status=="Ideal"){
                              await Sys.Game.CashGame.Texas.Controllers.RoomProcess.leftRoom({roomId:roomData.id,playerId:playerId});
                            }
          
                            if(playerData.status=="Playing" && roomData.status == "Finished"){
                              await Sys.Game.CashGame.Texas.Controllers.RoomProcess.leftRoom({roomId:roomData.id,playerId:playerId});
                            }
                          }
                        }
                      }
                    }
          
                    console.log("playingIdArr: ", playingIdArr);
          
                    var tourAllRoom = await Sys.App.Services.RoomServices.getByData({'isTournamentTable' : true});
          
                    console.log("tourAllRoom.length: ", tourAllRoom.length);
          
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
          
                    console.log("tourPlayingIdArr: ", tourPlayingIdArr);
                    console.log("tourPlayingNameArr: ", tourPlayingNameArr);
          
                    for(var l=0; l<playerIdArr.length; l++){
                      var playerId = playerIdArr[l];
                      console.log("playingIdArr.indexOf(playerId): ", playingIdArr.indexOf(playerId));
                      console.log("playerIdArr[l]: ", playerIdArr[l]);
                      if(playingIdArr.indexOf(playerId) == -1 && tourPlayingIdArr.indexOf(playerId) == -1){
                        var playerDetail = await Sys.App.Services.PlayerServices.getSinglePlayerData({'_id':playerId});
                        var socketId = playerDetail.socketId;
                        if(socketId != ""){
                          await Sys.Io.to(socketId).emit('forceLogOut',{
                            playerId :  playerId,
                            message: Sys.Setting.maintenance.message + '\n You can login after ' + Sys.Setting.maintenance.maintenance_end_date
                          });
                         
                          //await Sys.Io.sockets.connected[socketId].disconnect();
          
                          await Sys.Game.Common.Services.PlayerServices.update({_id: playerId},{socketId:''});                     
                        }                
                      }           
                    }
                  },Sys.Setting.maintenance.showBeforeMinutes * 60 * 1000);
                },timer);
              }else{
                var message = ' Server ce se za '+req.body.showBeforeMinutes+' minute ugasiti i ponovno pokrenit. \n Der Server wird in '+req.body.showBeforeMinutes+' Minuten neu gestartet.' 
                await Sys.Io.emit('maintenanceServer',{status:'success', 'message':message});
                now = moment().format("YYYY-MM-DD HH:mm");
                let end_date = moment(Sys.Setting.maintenance.maintenance_end_date);

                Sys.Timers.MaintenanceStart = setTimeout(async function(){
                  Sys.Config.App.details.maintenanceMode = true; 
                  let allPlayer = await Sys.App.Services.PlayerServices.getByData({'socketId':{$ne:''}});
                  var playerIdArr = [];
                  if(allPlayer.length > 0){
                    for(var i=0; i<allPlayer.length; i++){
                      playerIdArr.push(allPlayer[i].id);
                    }
                  }

                  let betweenTime = Sys.Setting.maintenance.time_difference;
                  Sys.Timers.MaintenanceStop = setTimeout(async function(){
                  let updateData =  await Sys.App.Services.SettingsServices.updateSettingsData({
                      _id: req.params.id
                    }, {
                        maintenance:{
                          maintenance_start_date: req.body.maintenance_start_date,
                          maintenance_end_date: req.body.maintenance_end_date,
                          time_difference: TimeDiff,
                          message:req.body.message,
                          showBeforeMinutes: req.body.showBeforeMinutes,
                          status: 'inactive',
                          quickMaintenance: settings.maintenance.quickMaintenance,
                        }
                    });
                    
                    Sys.Setting = await Sys.App.Services.SettingsServices.getSettingsData({});
                    Sys.Config.App.details.maintenanceMode = false; 
                  },betweenTime * 1000);
        
                  console.log("playerIdArr: ", playerIdArr);
                  let allRoom = await Sys.App.Services.RoomServices.getByData({'isTournamentTable' : false});
        
                  console.log("allRoom.length: ", allRoom.length);
        
                  var playingIdArr = [];
                  if(allRoom.length > 0){
                    for(var j = 0; j<allRoom.length; j++){
                      var roomData = allRoom[j];
                      if(roomData.players.length > 0){
                        for(var k=0; k<roomData.players.length; k++){
                          var playerData = roomData.players[k];
                          var playerId = playerData.id;
        
                          console.log("updateMaintenance playerData.status: ", playerData.status);
        
                          if(playerData.status=="Playing"){
                            playingIdArr.push(playerId);
                          }
        
                          if(playerData.status=="Waiting"){
                            await Sys.Game.CashGame.Texas.Controllers.RoomProcess.leftRoom({roomId:roomData.id,playerId:playerId});
                          }
        
                          if(playerData.status=="Ideal"){
                            await Sys.Game.CashGame.Texas.Controllers.RoomProcess.leftRoom({roomId:roomData.id,playerId:playerId});
                          }
        
                          if(playerData.status=="Playing" && roomData.status == "Finished"){
                            await Sys.Game.CashGame.Texas.Controllers.RoomProcess.leftRoom({roomId:roomData.id,playerId:playerId});
                          }
                        }
                      }
                    }
                  }
        
                  console.log("playingIdArr: ", playingIdArr);
        
                  var tourAllRoom = await Sys.App.Services.RoomServices.getByData({'isTournamentTable' : true});
        
                  console.log("tourAllRoom.length: ", tourAllRoom.length);
        
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
        
                  console.log("tourPlayingIdArr: ", tourPlayingIdArr);
                  console.log("tourPlayingNameArr: ", tourPlayingNameArr);
        
                  for(var l=0; l<playerIdArr.length; l++){
                    var playerId = playerIdArr[l];
                    console.log("playingIdArr.indexOf(playerId): ", playingIdArr.indexOf(playerId));
                    console.log("playerIdArr[l]: ", playerIdArr[l]);
                    if(playingIdArr.indexOf(playerId) == -1 && tourPlayingIdArr.indexOf(playerId) == -1){
                      var playerDetail = await Sys.App.Services.PlayerServices.getSinglePlayerData({'_id':playerId});
                      var socketId = playerDetail.socketId;
                      if(socketId != ""){
                        await Sys.Io.to(socketId).emit('forceLogOut',{
                          playerId :  playerId,
                          message: Sys.Setting.maintenance.message + '\n You can login after ' + Sys.Setting.maintenance.maintenance_end_date
                        });
                       
                        //await Sys.Io.sockets.connected[socketId].disconnect();
        
                        await Sys.Game.Common.Services.PlayerServices.update({_id: playerId},{socketId:''});
                      }                
                    }           
                  }
                },Sys.Setting.maintenance.showBeforeMinutes * 60 * 1000);
              }
            }else{
              if(current_date >  m_end_date){console.log("inactive maintenance if end date passed!");
                Sys.Config.App.details.maintenanceMode = false;
                await Sys.App.Services.SettingsServices.updateSettingsData({
                  _id: req.params.id
                }, {
                    maintenance:{
                      maintenance_start_date: req.body.maintenance_start_date,
                      maintenance_end_date: req.body.maintenance_end_date,
                      time_difference: 0,
                      message:req.body.message,
                      showBeforeMinutes: req.body.showBeforeMinutes,
                      status: 'inactive',
                      quickMaintenance: settings.maintenance.quickMaintenance,
                    }
                });
              }
            } 
          }
          
        //END: chirag 31-08-2019 game under maintenance code 
      
          req.flash('success','Maintenance Settings updated successfully');
          if(req.body.DailyReports==true)
            return "success";
          else
            res.redirect('/maintenance');
          
        }
        else{
          req.flash('error','Error Updating Maintenance Settings');
          if(req.body.DailyReports==true){
            console.log("Error Updating Maintenance Settings");
            return "error";
          }
          else
            res.redirect('/maintenance');
        }
      }else{
        req.flash('error',' Quick maintenance mode is active!');
        res.redirect('/maintenance');
      }
    }
    catch (e){
      req.flash('error',' Catch Error Updating Maintenance Settings');
      console.log("Error Updating Maintenance Settings");
      if(req.body.DailyReports==true)
        return "error"
      else
        res.redirect('/maintenance');
      console.log("Error in settingsUpdate :", e);
    }
  },

  quickUpdateMaintenance: async function(req, res){
    try{
      let settings = await Sys.App.Services.SettingsServices.getSettingsData({_id: req.params.id});
      if (settings) {
        await Sys.App.Services.SettingsServices.updateSettingsData({
          _id: req.params.id
        }, {
            maintenance:{
              maintenance_start_date: moment().format("YYYY-MM-DD HH:mm"),
              maintenance_end_date: moment().format("YYYY-MM-DD HH:mm"),
              time_difference: 0,
              message:settings.maintenance.message,
              showBeforeMinutes: settings.maintenance.showBeforeMinutes,
              status: 'inactive',
              quickMaintenance: (req.body.quickMaintenance) ? req.body.quickMaintenance : 'inactive',
            }
        });

        Sys.Setting = await Sys.App.Services.SettingsServices.getSettingsData({});
        if( Sys.Setting.maintenance.quickMaintenance == "active"){
          Sys.Config.App.details.maintenanceMode = true;

          let allPlayer = await Sys.App.Services.PlayerServices.getByData({'socketId':{$ne:''}});
          let playerIdArr = [];
          if(allPlayer.length > 0){
            for(var i=0; i<allPlayer.length; i++){
              playerIdArr.push(allPlayer[i].id);
            }
          }

          let allRoom = await Sys.App.Services.RoomServices.getByData({'isTournamentTable' : false});
          let playingIdArr = [];
          if(allRoom.length > 0){
            for(let j = 0; j<allRoom.length; j++){
              let roomData = allRoom[j];
              if(roomData.players.length > 0){
                for(let k=0; k<roomData.players.length; k++){
                  let playerData = roomData.players[k];
                  let playerId = playerData.id;

                  console.log("updateMaintenance playerData.status: ", playerData.status);

                  if(playerData.status=="Playing"){
                    playingIdArr.push(playerId);
                  }

                  if(playerData.status=="Waiting"){
                    await Sys.Game.CashGame.Texas.Controllers.RoomProcess.leftRoom({roomId:roomData.id,playerId:playerId});
                  }

                  if(playerData.status=="Ideal"){
                    await Sys.Game.CashGame.Texas.Controllers.RoomProcess.leftRoom({roomId:roomData.id,playerId:playerId});
                  }

                  if(playerData.status=="Playing" && roomData.status == "Finished"){
                    await Sys.Game.CashGame.Texas.Controllers.RoomProcess.leftRoom({roomId:roomData.id,playerId:playerId});
                  }
                }
              }
            }
          }

          let tourAllRoom = await Sys.App.Services.RoomServices.getByData({'isTournamentTable' : true});

          console.log("tourAllRoom.length: ", tourAllRoom.length);

          let tourPlayingIdArr = [];
          let tourPlayingNameArr = [];
          if(tourAllRoom.length > 0){
            for(let m = 0; m<tourAllRoom.length; m++){
              let tourRoomData = tourAllRoom[m];
              if(tourRoomData.players.length > 0){
                for(let n=0; n<tourRoomData.players.length; n++){
                  if(tourRoomData.players[n].status=="Playing"){
                    let tourPlayerId = tourRoomData.players[n].id;
                    tourPlayingIdArr.push(tourPlayerId);
                    tourPlayingNameArr.push(tourRoomData.players[n].playerName);
                  }
                }
              }
            }
          }

          for(let l=0; l<playerIdArr.length; l++){
            let playerId = playerIdArr[l];
            console.log("playingIdArr.indexOf(playerId): ", playingIdArr.indexOf(playerId));
            console.log("playerIdArr[l]: ", playerIdArr[l]);
            console.log("CHECK INDEX",playingIdArr.indexOf(playerId) == -1)
            if(playingIdArr.indexOf(playerId) == -1 && tourPlayingIdArr.indexOf(playerId) == -1){
              let playerDetail = await Sys.App.Services.PlayerServices.getSinglePlayerData({'_id':playerId});
              console.log("playerDetail",playerDetail)
              let socketId = playerDetail.socketId;
              console.log("SOCKET ID",socketId)
              if(socketId != ""){
                await Sys.Io.to(socketId).emit('forceLogOut',{
                  playerId :  playerId,
                  message: Sys.Setting.maintenance.message + '\n We will come back very shortly!' ,
                });

                await Sys.Game.Common.Services.PlayerServices.update({_id: playerId},{socketId:''});

              }                
            }           
          }

          //await Sys.Io.emit('maintenanceServer',{status:'success', 'message':'Server gose under maintenance in '+req.body.showBeforeMinutes+' minutes'});
          let message = Sys.Setting.maintenance.message + '\n We will come back very shortly!';
          await Sys.Io.emit('maintenanceServer',{status:'success', 'message':message}); 

        }else{
          Sys.Config.App.details.maintenanceMode = false;
        }

        req.flash('success','Maintenance Settings updated successfully');
        res.redirect('/maintenance');

      }  
    }catch(e){
      req.flash('error',' Catch Error Updating Quick Maintenance Settings');
      console.log("Error Updating  quickMaintenance Settings", e);
      res.redirect('/maintenance'); 
    }
  },


  /**
    Backup game collection to specified database
  **/
  insertBatch: async function(targetCollection, documents,MongoClient, targetServerHostAndPort, targetDatabaseName,db_username, db_password){
    let db, client;
    try{
     
      //let bulkInsert = collection.initializeUnorderedBulkOp();
      var insertedIds = [];
      var id;

      //let connectionString = 'mongodb://'+db_username+':'+db_password+'@'+targetServerHostAndPort;
      let connectionString = "mongodb://127.0.0.1:27017";
      //console.log(connectionString)
      client = await MongoClient.connect(connectionString, { useNewUrlParser: true });
      db = client.db(targetDatabaseName);
      var col = db.collection(targetCollection);
      var batch = col.initializeUnorderedBulkOp({useLegacyOps: true});
      
      documents.forEach( function(doc) {
        //batch.insert(doc);
        id = doc._id;
        batch.find({_id: id}).upsert().replaceOne(doc);
        insertedIds.push(id);
      });

      batch.execute();
     
      return insertedIds;

    }catch(e){
      console.log("error in inserting batch data while backup", e)
    }finally {
      client.close();
    }
  },
  DailyReports: async function(req, res){
    try{
      var runningRoom = await Sys.App.Services.RoomServices.getRoomData({'status':'Running'});        
      console.log("running Room length", runningRoom.length);    
      let query={} 
      let start_date = new Date();
      start_date.setHours(00, 00, 00, 000);
      let end_date = new Date();
      end_date.setHours(23, 59, 59, 999);
      if (start_date && end_date) {
        query.createdAt = { "$gte": start_date, "$lte": end_date }
      } 
      let dataCount = await Sys.App.Services.ChipsHistoryServices.getDailyReportsData(query);
      if(dataCount.length) {
        return res.send("alreadyData");
      } else if(runningRoom.length > 0 ){
      return res.send("SomePlayer");
      } else{
        Sys.App.Controllers.ReportsController.allUserdailyBalanceReports()
        return res.send("success")
      }
    } catch (e){
      console.log("Error",e);
      req.flash('error', 'Problem while updating Status.');
      return res.send("error");
    }
  },

  DailyReportsWithMaintanace: async function(req, res){
    try{
      let the_interval= 7 * 60 * 1000  
      let start_date = new Date();
      start_date.toLocaleString()
      start_date.setMinutes(start_date.getMinutes()+5)
      let end_date = new Date();
      end_date.toLocaleString()
      end_date.setMinutes(start_date.getMinutes()+5)
      let settings = await Sys.App.Services.SettingsServices.getSettingsData();
      // let req={}
      req.params.id=settings._id
      req.body.maintenance_start_date = moment(start_date).format("YYYY-MM-DD HH:mm");
        req.body.maintenance_end_date = moment(end_date).format("YYYY-MM-DD HH:mm");
        req.body.message="This Application is Under Maintenance."
        req.body.showBeforeMinutes= 2
        req.body.status="active"
        req.body.DailyReports=true
      let resUpdateMaintenance= await Sys.App.Controllers.SettingsController.updateMaintenance(req,res);
      if(resUpdateMaintenance!="success"){
          console.log("Problem while start Maintenance");
        req.flash('error', 'Problem while start Maintenance');
        return res.send("error");
      }
      setTimeout(() =>  Sys.App.Controllers.ReportsController.allUserdailyBalanceReports(), the_interval);
       /* the_interval= 9 * 60 * 1000
      req.params.id=settings._id
      req.body.maintenance_start_date=start_date 
        req.body.maintenance_end_date=end_date
        req.body.message="This Application is Under Maintenance."
        req.body.showBeforeMinutes= 2
        req.body.status="inactive" 
        req.body.DailyReports=true
         setTimeout(()=> 
         resUpdateMaintenance = Sys.App.Controllers.SettingsController.updateMaintenance(req,res), the_interval);
        if(resUpdateMaintenance!="success"){
          console.log("Problem while end Maintenance",resUpdateMaintenance);
          req.flash('error', 'Problem while End Maintenance');
          return res.send("error");
        }*/
        return res.send("success") 
    } catch (e){
      console.log("Problem while generate Reports",e);
      req.flash('error', 'Problem while generate Reports');
      return res.send("error");
    }
  },


  deleteBatch: async function(collection, documents,MongoClient ){
    let db, client;
    try{  
      client = await MongoClient.connect("mongodb://127.0.0.1:27017", { useNewUrlParser: true });
      db = client.db("poker_bytepoker");
      var col = db.collection(collection);
      var bulkRemove = col.initializeUnorderedBulkOp({useLegacyOps: true});
      
      documents.forEach(async function(doc) {
        //bulkRemove.find({_id: doc._id}).removeOne();
        await bulkRemove.find({_id: doc._id}).removeOne();
      });

      bulkRemove.execute();
     
    }catch(e){
      console.log("error in deleting batch data while backup", e)
    }finally {
      client.close();
    }
  },

  checkBackupStatus: async function(req, res){
    try{
      let settings = await Sys.App.Services.SettingsServices.getSettingsData();console.log(settings);
      var currentDate = moment(new Date()).format("YYYY-MM-DD");console.log("current date", currentDate)
      if(settings.BackupDetails && settings.BackupDetails.db_backup_days && settings.BackupDetails.db_next_backup_date && currentDate == settings.BackupDetails.db_next_backup_date){
        let expiryDate =moment(new Date()).subtract(3, 'months').format("YYYY-MM-DD"); // months
        console.log("Expiry Date",expiryDate);
        //let backupData = await Sys.App.Services.GameService.getByData({'createdAt': {$lt: expiryDate } });
        let targetCollection = 'game_'+currentDate;
        let sourceCollection = 'game';
        let targetServerHostAndPort = settings.BackupDetails.db_host;
        let targetDatabaseName =settings.BackupDetails.db_name;
        const MongoClient = require('mongodb').MongoClient;
        
          var count;
          while ((count = await Sys.App.Services.GameService.getGameCount({'createdAt': {$lt: expiryDate } }) ) > 0) {
            console.log(count + " documents remaining");
            let sourceDocs = await Sys.App.Services.GameService.getLimitedGame({'createdAt': {$lt: expiryDate } });
            let idsOfCopiedDocs = await module.exports.insertBatch(targetCollection, sourceDocs,MongoClient, targetServerHostAndPort, targetDatabaseName, settings.BackupDetails.db_username, settings.BackupDetails.db_password);
            console.log("bulk inserted ids", idsOfCopiedDocs);
            if(typeof idsOfCopiedDocs !== 'undefined' && idsOfCopiedDocs.length > 0){
              let targetDocs = await Sys.App.Services.GameService.getByData({_id: {$in: idsOfCopiedDocs}});
              await module.exports.deleteBatch(sourceCollection, targetDocs, MongoClient);
            }
            
          }
          console.log("iddddd", settings._id);
          await Sys.App.Services.SettingsServices.updateSettingsData({
          _id: settings._id
          }, {
            BackupDetails:{
              db_backup_days: settings.BackupDetails.db_backup_days,
              db_next_backup_date:moment(currentDate).add(settings.BackupDetails.db_backup_days, 'days').format("YYYY-MM-DD"),
              db_host: settings.BackupDetails.db_host,
              db_username: settings.BackupDetails.db_username,
              db_password: settings.BackupDetails.db_password,
              db_name: settings.BackupDetails.db_name,   
            }
          });  

          res.send("Backup completed");
      }else{
        console.log("NOO");
      }
    }catch(e){
      console.log("Error in checkBackupStatus of game collection :", e);
    }
  },

  // restart server
  restartServer: async function(req, res){
    try{
      
      console.log("restart the server");
      /*pm2.restart(0, function (err, proc) {
        if (err){
         throw new Error('err');
         return res.send("error");
          
        } 
      });*/
      setTimeout(function(){
        pm2.restart(Sys.Setting.processId);
      }, 1000);
      
      return res.send("success");
    } catch (e){
      console.log("Error",e);
      return res.send("error");
      req.flash('error', 'Problem while updating Status.');
    }
  } 

}

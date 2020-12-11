var Sys = require('../../Boot/Sys');
var bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
module.exports = {
    blindLevels: async function(req , res){
        try {
            let blindLevels = await Sys.App.Services.blindLevelsServices.getBlindLevelsData({});
            console.log("DTAA",blindLevels)
            let data = {
                App : Sys.Config.App.details,Agent : req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
                blindLevelsActive : 'active',
                GameManagementMenu: 'active menu-open',
                blindLevels        : blindLevels,
            };
            return res.render('blindLevels/blindLevels',data);
        }
        catch (e){
          console.log("Error in Blind Levels :", e);
        }
    },

    saveBlindLevels: async function(req, res){
        try {
            
            if(req.body.level && typeof req.body.level == 'string'){
                let level = [];
                level.push(req.body.level);
                req.body.level = level; 
            }
        
            if(req.body.minBlind && typeof req.body.minBlind == 'string'){
            let minBlind = [];
            minBlind.push(req.body.minBlind);
            req.body.minBlind = minBlind; 
            }
        
            if(req.body.maxBlind && typeof req.body.maxBlind == 'string'){
            let maxBlind = [];
            maxBlind.push(req.body.maxBlind);
            req.body.maxBlind = maxBlind; 
            }
        
            if(!req.body.level.length){
                return res.send({status:'validation-error' , msg:'Please fill required fields'});
            }
            let data = [];
            for(let i = 0;i < req.body.level.length; i++){
                data.push({
                levelId  : new ObjectId(),
                level    : parseFloat(req.body.level[i]),
                minBlind : parseFloat(req.body.minBlind[i]),
                maxBlind : parseFloat(req.body.maxBlind[i])
                });
            }
            await Sys.App.Services.blindLevelsServices.insertBlindLevelsData({
                blindLevelName : req.body.blindLevelName,
                blindLevels : data
            });
            
            req.flash('success',`Blind Levels added`);

            return res.redirect('/blindLevels');
            
            
        } catch (e) {
          console.log("Error in save Blind Levels", e);
        }
    },

    editBlindLevels: async function(req, res){
        try {
            
            let editBlindLevelsData = await Sys.App.Services.blindLevelsServices.editBlindLevelsData({_id: req.body.id}, {
                level             : req.body.level,
                minBlind          : req.body.minBlind,
                maxBlind          : req.body.maxBlind
            });

            return res.send({status:'success', editBlindLevelsData: editBlindLevelsData});
            
        } catch (e) {
          console.log("Error in edit Blind Levels", e);
        }
    },

    updateBlindLevels: async function(req, res){
        try {
            console.log("UPDATE",req.body)
            if(req.body.level && typeof req.body.level == 'string'){
                let level = [];
                level.push(req.body.level);
                req.body.level = level; 
            }
        
            if(req.body.minBlind && typeof req.body.minBlind == 'string'){
            let minBlind = [];
            minBlind.push(req.body.minBlind);
            req.body.minBlind = minBlind; 
            }
        
            if(req.body.maxBlind && typeof req.body.maxBlind == 'string'){
            let maxBlind = [];
            maxBlind.push(req.body.maxBlind);
            req.body.maxBlind = maxBlind; 
            }
            
            if(req.body.levelId && typeof req.body.levelId == 'string'){
                let levelId = [];
                levelId.push(req.body.levelId);
                req.body.levelId = levelId;
            }
            if(!req.body.level.length){
                return res.send({status:'validation-error' , msg:'Please fill required fields'});
            }

            let data = [];
            for(let i = 0;i < req.body.level.length; i++){
                data.push({
                levelId  : ObjectId(req.body.levelId[i]),
                level    : parseFloat(req.body.level[i]),
                minBlind : parseFloat(req.body.minBlind[i]),
                maxBlind : parseFloat(req.body.maxBlind[i])
                });
            }
            await Sys.App.Services.blindLevelsServices.updateBlindLevelsData({_id: req.body.id}, {
               blindLevels : data
            });

            req.flash('success',`Blind Levels Updated`);

            return res.redirect('/blindLevels');
            
            
        } catch (e) {
          console.log("Error in update Blind Levels", e);
        }
    },

    deleteBlindLevels: async function(req, res){
        try {
            console.log("DELETE",req.body)
            deleteBlindLevelsData = await Sys.App.Services.blindLevelsServices.deleteBlindLevelsData({_id: req.body.id});

            req.flash('success',`Blind Levels Deleted`);

            return res.send({status:'success'});
            
        } catch (e) {
          console.log("Error in delete Blind Levels", e);
        }
    },

    deleteParticularBlindLevels: async function(req,res){
        try{
            console.log("REQ BODY",req.body)
            let doc = {
                _id: ObjectId(req.body.parentId),
                $pull:{
                    blindLevels:{
                       levelId: ObjectId(req.body.id)
                    }
                }
            };
            let check = await Sys.App.Services.blindLevelsServices.updateParticularBlindLevelsData(doc);
            req.flash('success',`Particular Blind Level Deleted`);
            let editBlindLevelsData = await Sys.App.Services.blindLevelsServices.editBlindLevelsData({_id: req.body.parentId}, {
                level             : req.body.level,
                minBlind          : req.body.minBlind,
                maxBlind          : req.body.maxBlind
            });
            return res.send({status:'success',editBlindLevelsData: editBlindLevelsData});
        }catch(e){
            console.log("Error in delete Particular Blind Level", e);
        }
       

    },
}
var Sys = require('../../Boot/Sys');
const mongoose = require('mongoose');
const moment =  require('moment');
const rolesArray = ['admin','master','agent','childAgent'];

module.exports = {

	allTransactions: async function(req,res){
    try {
      var data = {
        App : Sys.Config.App.details,
        Agent : req.session.details,
        error: req.flash("error"),
        success: req.flash("success"),
        myChipsTransactionsActive : 'active',
        AgentMenu: 'active menu-open'
      };
      return res.render('agent/allUsersTransactions',data);
    } catch (e) {
      console.log("Error",e);
      return new Error('Error',e);
    }
  },

  getMyChipsTransactions: async function(req, res){
    try{
      let start = parseInt(req.query.start);
      let length = parseInt(req.query.length);
      let search = req.query.search.value;

      // query to get particular agent or admin's sub-agents
      let query = {};
      
      if (search != '') {
          //query = {  $or:[ {'receiverId':req.session.details.id}, {'providerId':req.session.details.id} ] ,  email: { $regex: '.*' + search + '.*' }  };
          query = {  'receiverId':req.session.details.id,  providerEmail: { $regex: '.*' + search + '.*' }  };
      } else {
          query = {  'receiverId':req.session.details.id  };
      }

      let Count = await Sys.App.Services.AllUsersTransactionHistoryServices.getCount(query);
      //let agentCount = agentsC.length;
      let data = await Sys.App.Services.AllUsersTransactionHistoryServices.getByData(query, null, {skip: start, limit: length,sort:{createdAt:-1}});
      var obj = {
        'draw': req.query.draw,
        'recordsTotal': Count,
        'recordsFiltered': Count,
        'data': data
      };
      res.send(obj);
    }catch(e){
      console.log("Error", e);
      return new Error("Error", e);
    }
  },


  // paricular player chips transactions


  playersTransactions: async function(req,res){
    try {
      var data = {
        App : Sys.Config.App.details,
        Agent : req.session.details,
        error: req.flash("error"),
        success: req.flash("success"),
        //myChipsTransactionsActive : 'active',
        AgentMenu: 'active menu-open',
        playerId: req.params.id,
      };
      return res.render('agent/playersTransactions',data);
    } catch (e) {
      console.log("Error",e);
      return new Error('Error',e);
    }
  },

  getPlayersTransactions: async function(req, res){console.log("params", req.params.id)
    try{
      let start = parseInt(req.query.start);
      let length = parseInt(req.query.length);
      let search = req.query.search.value;

      // query to get particular agent or admin's sub-agents
      let query = {};
      
      if (search != '') {
          //query = {  $or:[ {'receiverId':req.session.details.id}, {'providerId':req.session.details.id} ] ,  email: { $regex: '.*' + search + '.*' }  };
          query = {  'receiverId':req.params.id,  providerEmail: { $regex: '.*' + search + '.*' }  };
      } else {
          query = {  'receiverId':req.params.id  };
      }

      let Count = await Sys.App.Services.AllUsersTransactionHistoryServices.getCount(query);
      //let agentCount = agentsC.length;
      let data = await Sys.App.Services.AllUsersTransactionHistoryServices.getByData(query, null, {skip: start, limit: length,sort:{createdAt:-1}});
      var obj = {
        'draw': req.query.draw,
        'recordsTotal': Count,
        'recordsFiltered': Count,
        'data': data
      };
      res.send(obj);
    }catch(e){
      console.log("Error", e);
      return new Error("Error", e);
    }
  },

  addAgent: async function(req, res){
    try{
      var data = {
        App : Sys.Config.App.details,Agent : req.session.details,
        error: req.flash("error"),
        success: req.flash("success"),
        agentActive : 'active'
      };
      return res.render('agent/add',data);
    }catch(e){
      console.log("Error", e);
      return new Error("Error", e);
    }
  },

  addAgentPostData: async function(req, res){
    try{
      let agent = await Sys.App.Services.agentServices.getAgentData({email: req.body.email});
      if (agent && agent.length >0) {
        req.flash('error', 'Agent Already Present');
        res.redirect('/agents');
        return;

      }else {

        let level='2';
        if(req.session.details.is_admin != 'yes'){
           let getLevel = await Sys.App.Services.agentServices.getSingleAgentData({_id: req.session.details.id});
           level = ( parseInt(getLevel.level) + 1);
        }
        
        let insertAgent=await Sys.App.Services.agentServices.insertAgentData(
        {
          username: req.body.username,
          password : bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null),
          //firstname: req.body.firstname,
          //lastname: req.body.lastname,
          mobile: req.body.mobile,
          email: req.body.email,
          commission: req.body.commission,
          status: req.body.status,
          parentId: req.session.details.id,
          level: level,
          role: rolesArray[level-1],
        }
        );
        
        if("_id" in insertAgent ){
          
          
          let insertAgentRelation=await Sys.App.Services.agentRelationServices.insertAgentRelationData(
          {
            parentId: req.session.details.id,
            childId : insertAgent._id,
            level: level,
            role: rolesArray[level-1],
            isAdmin: (() => {
                       if(req.session.details.is_admin == 'yes'){
                            return 'yes'
                          }else{
                            return 'No'
                          }
                       })()

          });

        }

        req.flash('success','Agent created successfully');
        res.redirect('/agents');
      }
    }catch(e){
      console.log("Error", e);
      req.flash('error','Problem Creating Agent');
      res.redirect('/addAgent');
      return;
    }
  },

  editAgent: async function(req, res){
    try{
      let agent = await Sys.App.Services.agentServices.getSingleAgentData({_id: req.params.id});
      var data = {
        App : Sys.Config.App.details,Agent : req.session.details,
        error: req.flash("error"),
        success: req.flash("success"),
        agentActive : 'active',
        agent: agent,
      };
      req.session.agentBack = req.header('Referer');
      return res.render('agent/add',data);
    }catch(e){
      console.log("Error", e);
      return new Error("Error", e);
    }
  },

  editAgentPostData: async function(req, res){
    try{
       let agent = await Sys.App.Services.agentServices.getAgentData({_id: req.params.id});
        if (agent && agent.length >0) {
          if (req.files) {
            let image = req.files.image;
                // Use the mv() method to place the file somewhere on your server
                image.mv('/profile/agents/'+req.files.image.name, function(err) {
                  if (err){
                    req.flash('error', 'User Already Present');
                    return res.redirect('/');
                  }
                });
          }
          await Sys.App.Services.agentServices.updateAgentData(
          {
            _id: req.params.id
            },{
              username: req.body.username,
              firstname: req.body.firstname,
              lastname: req.body.lastname,
              mobile: req.body.mobile,
              commission: req.body.commission,
              status: req.body.status,
              // image: req.files.image.name
            });
            req.flash('success','Agent updated successfully');
             res.redirect(req.session.agentBack);
            //res.redirect('/agents');

        }else {
            req.flash('error', 'No Agent found');
             res.redirect(req.session.agentBack);
            //res.redirect('/agents');
            return;
        }
    }catch(e){
      console.log(e);
      return new Error("Error", e);
    }
  },

  getAgentDelete: async function(req, res){
    try{
      let agent = await Sys.App.Services.agentServices.getAgentData({_id: req.body.id});
      if(agent || agents.length > 0){
        await Sys.App.Services.agentServices.deleteAgent(req.body.id);
        await Sys.App.Services.agentRelationServices.deleteAgent({childId:req.body.id });
        return res.send("success");
      }else{
        return res.send("error");
      }

    }catch(e){
      console.log("Error", e);
      return new Error("Error", e);
    }
  },

  requestCash: async function(req, res){
    try{
      let m_start_date = moment(new Date(Sys.Setting.maintenance.maintenance_start_date)).format("YYYY-MM-DD HH:mm");
      let m_end_date = moment(new Date(Sys.Setting.maintenance.maintenance_end_date)).format("YYYY-MM-DD HH:mm");
      let current_date = moment(new Date()).format("YYYY-MM-DD HH:mm");
      if( (current_date >= m_start_date && current_date <= m_end_date && Sys.Setting.maintenance.status =='active') || Sys.Setting.maintenance.quickMaintenance == "active" ){
        req.flash('error', 'Maintenance mode is on please try again later.');
        res.redirect('/profile');
      }else{
        let settings = await Sys.App.Services.SettingsServices.getSettingsData({},['systemChips']);console.log("setting----", settings)
        let transaction={
          to:settings.id,
          from:req.session.details.id,
          chips:req.body.chips,
          fromRole:'admin',
          action:req.body.requestType,
          toRole:'system',
          walletType:"main"
        }
        let response= await Sys.Helper.Poker.Transaction(transaction);
        console.log(response);
            req.flash("success",'Chips updated successfully');
            res.redirect( '/my-chips-Transactions' );
            return;
        
      }

    } catch (e){
      console.log("Error",e);
      req.flash('error', e.message);
    }
  },


}

var Sys = require('../../../../Boot/Sys');

module.exports = {

  /**
    SNG Tournament 
  **/

  sngTournament: async function (req, res){
    try {
      var data = {
        App : Sys.Config.App.details,
        error: req.flash("error"),
        success: req.flash("success"),
        sngTournamentActive : 'active',
        GameManagementMenu: 'active menu-open'
      };
      return res.render('sitGoTournament/sngTournament',data);
    }
    catch (e){
      console.log(e);
    }
  },

  getSngTournament: async function (req, res){
    try {
      let start = parseFloat(req.query.start);
      let length = parseFloat(req.query.length);
      let search = req.query.search.value;

      let query = {};
      if (search != '') {
        let capital = search;
        query = { name: { $regex: '.*' + search + '.*' } };
      } else {
        query = { };
      }
      let tournament = await Sys.App.Services.sngTournamentServices.getSngTournamentCount(query);
      //let tournament = tournamentC.length;
      let data = await Sys.App.Services.sngTournamentServices.getTouDatatable(query, length, start);
      var obj = {
        'draw': req.query.draw,
        'recordsTotal': tournament,
        'recordsFiltered': tournament,
        'data': data
      };
      res.send(obj);
    }
    catch (e){
      console.log("Error",e);
      return new Error('Error',e);
    }
  },

  addSngTournament: async function (req, res){
    try {
      let stacks = await Sys.App.Services.StacksServices.getByData({});
      let minutes = [];
      for(let i=1; i<=60;i++){
        minutes.push(i);
      }

      var data = {
        App : Sys.Config.App.details,
        error: req.flash("error"),
        success: req.flash("success"),
        tournamentActive : 'active',
        minutes : minutes,
        stacks : stacks
      };
      return res.render('sitGoTournament/addSngTournament',data);
    }
    catch (e){
      console.log(e);
    }
  },

  addSngTournamentPostData: async function (req, res){
    try {
          
      await Sys.App.Services.sngTournamentServices.insertTourData({
        name                 : req.body.name,
        game                 : req.body.game,
        stacks               : req.body.stacks,
        buy_in               : req.body.buy_in,
        entry_fee            : req.body.entry_fee,
        fee                  : req.body.fee,
        rebuy_time           : req.body.rebuy_time,
        breaks_time          : req.body.breaks_time,
        game_speed           : req.body.game_speed,
        min_players          : 2,
        max_players          : req.body.max_players,
        description          : req.body.description,
        blind_levels_rise_time  : req.body.blind_levels_rise_time,
        status : 'Waiting'
      });

      req.flash('success','Sit & Go Tournaments Created Successfully.');
      res.redirect('/sng-tournament');

    }
    catch (e){
      console.log('Error',e);
    }
  },

  editSngTournament: async function (req, res){
    try {
      let tournament = await Sys.App.Services.sngTournamentServices.getTourData({_id : req.params.id});
      let stacks = await Sys.App.Services.StacksServices.getByData({});
      let minutes = [];
      for(let i=1; i<=60;i++){
        minutes.push(i);
      }

      var data = {
        App : Sys.Config.App.details,
        error: req.flash("error"),
        success: req.flash("success"),
        tournamentActive : 'active',
        tournament : tournament,
        minutes : minutes,
        stacks : stacks,
    
      };
      return res.render('sitGoTournament/addSngTournament',data);
    }
    catch (e){
      console.log("Error",e);
    }
  },

  editSngTournamentPostData: async function (req, res){
    try {
      let tournament = await Sys.App.Services.sngTournamentServices.getTourData({_id : req.params.id});
      if(tournament){
        
        
        await Sys.App.Services.sngTournamentServices.updateTourData({
                _id: req.params.id
              }, {

                name                 : req.body.name,
                game                 : req.body.game,
                stacks               : req.body.stacks,
                buy_in               : req.body.buy_in,
                entry_fee            : req.body.entry_fee,
                fee                  : req.body.fee,
                rebuy_time           : req.body.rebuy_time,
                breaks_time          : req.body.breaks_time,
                game_speed           : req.body.game_speed,
                min_players          : req.body.min_players,
                max_players          : req.body.max_players,
                description          : req.body.description,
                blind_levels_rise_time  : req.body.blind_levels_rise_time,
                status : 'Waiting'
        });

        req.flash('success','Tournaments updated successfully');
        res.redirect('/sng-tournament');
      }
      else{
        req.flash('error','Tournaments is not updated successfully');
        res.redirect('/sng-tournament');     
      }
    }
    catch (e){
      console.log("Error",e);
    }
  },

  deleteSngTournament: async function (req, res){
    try {
      let tournament = await Sys.App.Services.sngTournamentServices.getTourData({_id: req.body.id});
      if (tournament || tournament.length >0) {
        await Sys.App.Services.sngTournamentServices.delete(req.body.id)
        return res.send("success");
      } else {
        return res.send("error");
      }
    }
    catch (e) {
      console.log("Error",e);
    }
  },

  

}
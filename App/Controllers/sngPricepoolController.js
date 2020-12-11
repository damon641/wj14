var Sys = require('../../Boot/Sys');
var bcrypt = require('bcryptjs');

const moment = require('moment');
module.exports = {

  /**
    SNG Tournament 
  **/

  sngPricePool: async function (req, res){
    try {
      let pricepool = await Sys.App.Services.sngPricepoolServices.getPricepoolData();
      var data = {
        App : Sys.Config.App.details,Agent : req.session.details,
        error: req.flash("error"),
        success: req.flash("success"),
        sngPricepoolActive : 'active',
        pricepoolManagementMenu: 'active menu-open',
        pricepool:pricepool,
      };
      return res.render('sitGoTournament/pricepool',data);
    }
    catch (e){
      console.log(e);
    }
  },

  sngPricePoolAdd: async function(req, res){
      try {
        await Sys.App.Services.sngPricepoolServices.insertPricepoolData({
          winner: req.body.winner,
          firstRunnerUp: req.body.firstRunnerUp, 
          secondRunnerUp: req.body.secondRunnerUp,
          fr_winner: req.body.fr_winner,
          fr_firstRunnerUp: req.body.fr_firstRunnerUp, 
          fr_secondRunnerUp: req.body.fr_secondRunnerUp,
        });
        req.flash('success','Pricepool created successfully');
        res.redirect('/price-pool/sngTournament');
      }
      catch (e){
        req.flash('error','Error Adding Pricepool');
        res.redirect('/price-pool/sngTournament');
        console.log("Error in Pricepool :", e);
      }
  },

  sngPricePoolUpdate: async function(req, res){
    try {
      let pricepool = await Sys.App.Services.sngPricepoolServices.getPricepoolData({_id: req.body.id});
      if (pricepool) {
        await Sys.App.Services.sngPricepoolServices.updatePricepoolData({
          _id: req.body.id
        }, {
          winner: req.body.winner,
          firstRunnerUp: req.body.firstRunnerUp, 
          secondRunnerUp: req.body.secondRunnerUp,
          fr_winner: req.body.fr_winner,
          fr_firstRunnerUp: req.body.fr_firstRunnerUp, 
          fr_secondRunnerUp: req.body.fr_secondRunnerUp,
        });
        req.flash('success','Pricepool updated successfully');
        res.redirect('/price-pool/sngTournament');
      }
      else{
        req.flash('error','Error Updating Pricepool');
        res.redirect('/price-pool/sngTournament');
      }
    }
    catch (e){
      req.flash('error','Error Updating Pricepool');
      res.redirect('/price-pool/sngTournament');
      console.log("Error in Pricepool :", e);
    }
  }
  

}
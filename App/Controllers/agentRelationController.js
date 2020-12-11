var Sys = require('../../Boot/Sys');
var bcrypt = require('bcryptjs');

module.exports = {

	player: async function(req,res){
    try {
      var data = {
        App : Sys.Config.App.details,Agent : req.session.details,
        error: req.flash("error"),
        success: req.flash("success"),
        playerActive : 'active'
      };
      return res.render('player/player',data);
    } catch (e) {
      console.log("Error",e);
    }
  },

}

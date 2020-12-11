var Sys = require('../../Boot/Sys');
var jwt = require('jsonwebtoken');

const flatCache = require('flat-cache'); 
let cache = flatCache.load('dashboardCache');

var jwtcofig = {
  'secret': 'AisJwtAuth'
};

module.exports = {
  frontRequestCheck: function (req, res, next) {
    console.log('Time:', Date.now());
    next();
  },
  // auth
  Authenticate: async function (req, res, next) {
    console.log(req.session)
    if (req.session.web && req.session.web.login) {
        console.log("Authenticate")
    //   if (req.session.details.is_admin != 'yes') {
    //     let agent = await Sys.App.Services.agentServices.getSingleAgentData({
    //       _id: req.session.details.id,
    //     });
    //     // console.log(agent,'agent',req.session.details.id)
    //     // if(agent == null){
    //     //     req.session.destroy(function(err) {
    //     //         req.logout();
    //     //         return res.redirect('/');
    //     //     })
    //     // }
    //     req.session.details.chips = agent.chips;
    //     req.session.details.rake_chips = agent.rake_chips;
    //     req.session.details.temp_chips = agent.temp_chips;
    //     req.session.details.isTransferAllow = agent.isTransferAllow;
    //   } else {
    //     let adminChips = await Sys.App.Services.UserServices.getSingleUserData({
    //       _id: req.session.details.id,
    //     });
    //     req.session.details.chips = adminChips.chips;
    //     req.session.details.rake_chips = adminChips.rake_chips;
    //     req.session.details.temp_chips = adminChips.temp_chips;
    //     req.session.details.extraRakeChips = adminChips.extraRakeChips;
    //     req.session.details.isTransferAllow = adminChips.isTransferAllow;
    //   }

      jwt.verify(
        req.session.web.details.jwt_token,
        jwtcofig.secret,
        async function (err, decoded) {
          if (err) {
            console.log(err)
            //return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
            req.session.destroy(function (err) {
              req.logout();
              const obj = {
                status: 'expired',
                result: null,
                message: `Your session expired`,
              };
              return res.send(obj)
            });
          } else {
            res.locals.session = req.session.web.details;
            next();
          }
        }
      );
    } else {
      console.log("Authenticate")
      const obj = {
        status: 'expired',
        result: null,
        message: `Your session expired`,
      };
      return res.send(obj)
    }
  },
};
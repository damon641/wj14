var Sys = require('../../Boot/Sys');
var jwt = require('jsonwebtoken');

const flatCache = require('flat-cache'); 
let cache = flatCache.load('dashboardCache');

var jwtcofig = {
  'secret': 'AisJwtAuth'
};

module.exports = {
    loginCheck:  function(req, res, next){
        if(req.session.login){
            
            res.redirect('/dashboard');
        }else{
            next();
        }
    }, 
    // auth
    Authenticate: async function(req, res, next){
        if(req.session.login){
            
            if(req.session.details.is_admin != 'yes'){
                let agent = await Sys.App.Services.agentServices.getSingleAgentData({_id: req.session.details.id});
                // console.log(agent,'agent',req.session.details.id)
                // if(agent == null){
                //     req.session.destroy(function(err) {
                //         req.logout();
                //         return res.redirect('/');
                //     })
                // }
                req.session.details.chips = agent.chips;
                req.session.details.rake_chips = agent.rake_chips;
                req.session.details.temp_chips = agent.temp_chips;
                req.session.details.isTransferAllow = agent.isTransferAllow;

            }else{
                let adminChips = await Sys.App.Services.UserServices.getSingleUserData({_id: req.session.details.id});
                req.session.details.chips = adminChips.chips;
                req.session.details.rake_chips = adminChips.rake_chips;
                req.session.details.temp_chips = adminChips.temp_chips;
                req.session.details.extraRakeChips = adminChips.extraRakeChips;
                req.session.details.isTransferAllow = adminChips.isTransferAllow;
            }



            jwt.verify(req.session.details.jwt_token, jwtcofig.secret, async function(err, decoded) {
                if (err){
                            //return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
                            req.session.destroy(function(err) {
                                req.logout();
                                return res.redirect('/');
                            })
                        }
                else{
                            res.locals.session = req.session.details;

                            //find out latest player counts
                            /*let player = await Sys.App.Services.PlayerServices.getPlayerData({isLatest: '0'});
                            let latestPlayerCount = player.length;
                            console.log("player count",latestPlayerCount);
                            res.locals.countObject = {
                                latestPlayerCount: latestPlayerCount,
                            };*/
                            
                            next();
                    }

            });

            //next();
        }else{
            res.redirect('/');
        }
    },

    HasRole: function(...allowed){
        const isAllowed = role => allowed.indexOf(role) > -1;



        
        return function(req, res, next) {
            //console.log(req.session.details.role);
            if (!isAllowed(req.session.details.role)){
                req.flash('error', 'You are Not allowed to access that page.');
                return res.redirect('/player');
            }
            else next();
        }
    },

    agentLimitCheck: async function(req, res, next){
        let level = "2";
        if(req.session.details.is_admin != 'yes'){
            let getLevel = await Sys.App.Services.agentServices.getSingleAgentData({_id: req.session.details.id});
            level = getLevel.level;
        }
        if(parseInt(level) >= 100){
            req.flash('error', 'You are Not allowed to Add Agents');
            res.redirect('/player');
        }else{
            next();
        }
    },

    flatCacheMiddleware: function(req,res, next){
            let key =  '__express__' + req.originalUrl || req.url
            let cacheContent = cache.getKey(key);
            if( cacheContent){
                res.send( cacheContent );
            }else{
                res.sendResponse = res.send
                res.send = (body) => {
                    cache.setKey(key,body);
                    cache.save();
                    res.sendResponse(body)
                }
                next()
            }
    },
}
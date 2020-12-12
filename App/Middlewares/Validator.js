var validate = require('express-validation');
var Joi = require('joi');
module.exports = {
    loginPostValidate: function(req, res, next){
        //console.log('Validation check:', req.body);
        const rulesSchema = Joi.object({
            email: Joi.string().required(),
            password: Joi.string().regex(/[a-zA-Z0-9]{3,30}/).required()
        });
        const ret = Joi.validate(req.body, rulesSchema, {
            allowUnknown: false,
            abortEarly: false
        });

        if (ret.error) {
            // res.status(400).end(ret.error.toString());
            console.log("Error",ret.error.toString());
            req.flash('error', ret.error.toString());
            res.redirect('/');
        } else {
            next();
        }
    },
    userChipsTransfer: function(req, res, next){
        //console.log('Validation check:', req.body);
        const rulesSchema = Joi.object({
            userChips: Joi.string().required(),
            userChips: Joi.string().required(),
        });
        const ret = Joi.validate(req.body, rulesSchema, {
            allowUnknown: false,
            abortEarly: false
        });

        if (ret.error) {
            // res.status(400).end(ret.error.toString());
            console.log("Error",ret.error.toString());
            req.flash('error', ret.error.toString());
            res.redirect('/');
        } else {
            next();
        }
    },
    registerUserPostValidate: function(req, res, next){
       // console.log('Validation check:', req.body);
        const rulesSchema = Joi.object({
            username: Joi.string().alphanum().min(3).max(30).required(),
            status: Joi.string().min(3).max(30).required(),
            role: Joi.string().min(3).max(30).required(),
            email: Joi.string().email().required(),
            password: Joi.string().regex(/[a-zA-Z0-9]{3,30}/).required()
            // image: Joi.required()
        });

        const data = {
          username: 'abcd1234',
          status: 'abc1',
          role: 'Joe',
          email: 'not_a_valid_email_to_show_custom_label',
          password : '123456'
        };

        const ret = Joi.validate(req.body, rulesSchema, {
            allowUnknown: false,
            abortEarly: false
        });

        if (ret.error) {
            // res.status(400).end(ret.error.toString());
            console.log("Error",ret.error.toString());
            req.flash('error', ret.error.toString());
            // console.log('ret.error', ret.error.toString());
            res.redirect('/addUser');
        } else {
            next();
        }
    },

    editUserPostValidate: function(req, res, next){
        //console.log('Validation check:', req.body);
        const rulesSchema = Joi.object({
           username: Joi.string().alphanum().min(3).max(30).required(),
            status: Joi.string().min(3).max(30).required(),
            role: Joi.string().min(3).max(30).required(),
            // email: Joi.string().email().required(),
            // password: Joi.string().regex(/[a-zA-Z0-9]{3,30}/).required()
            // image: Joi
        });

        const data = {
          username: 'abcd1234',
          status: 'abc1',
          role: 'Joe',
          // email: 'not_a_valid_email_to_show_custom_label',
          password : '123456'
        };

        const ret = Joi.validate(req.body, rulesSchema, {
            allowUnknown: false,
            abortEarly: false
        });

        if (ret.error) {
            // res.status(400).end(ret.error.toString());
            console.log("Error",ret.error.toString());
            req.flash('error', ret.error.toString());
            // console.log('ret.error', ret.error.toString());
            res.redirect('/user');
        } else {
            next();
        }
    },


    /***

    Player Validation
    ------------------

    ***/

   /* registerPlayerPostValidate: function(req, res, next){
        //console.log('Validation check:', req.body);
        const rulesSchema = Joi.object({
           username: Joi.string().alphanum().min(3).max(30).required(),
           password: Joi.string().regex(/[a-zA-Z0-9]{3,30}/).required(),
           firstname: Joi.string().alphanum().min(3).max(30).required(),
           lastname: Joi.string().alphanum().min(3).max(30).required(),
           email: Joi.string().email().required(),
           gender: Joi.string().required(),
           bot: Joi.string().required(),
           mobile: Joi.number().required(),
        });

        const ret = Joi.validate(req.body, rulesSchema, {
            allowUnknown: false,
            abortEarly: false
        });

        if (ret.error) {
            // res.status(400).end(ret.error.toString());
            console.log("Error",ret.error.toString());
            req.flash('error', ret.error.toString());
            // console.log('ret.error', ret.error.toString());
            res.redirect('/addPlayer');
        } else {
            next();
        }
    },*/

    registerPlayerPostValidate: function(req, res, next){
        //console.log('Validation check:', req.body);
        const rulesSchema = Joi.object({
           username: Joi.string().alphanum().max(30).required(),
           password: Joi.string().regex(/[a-zA-Z0-9]{3,30}/).required(),
           firstname: Joi.string().alphanum().max(30).required(),
           lastname: Joi.string().alphanum().max(30).required(),
           email: Joi.string().email().required(),
           gender: Joi.string().required(),
           bot: Joi.string().required(),
           mobile: Joi.number().required(),
           accountNumber: Joi.string().alphanum(),
           country: Joi.string().required(),
           currency: Joi.string().required()
        });

        const ret = Joi.validate(req.body, rulesSchema, {
            allowUnknown: false,
            abortEarly: false
        });

        if (ret.error) {
            // res.status(400).end(ret.error.toString());
            console.log("Error",ret.error.toString());
            req.flash('error', ret.error.toString());
            // console.log('ret.error', ret.error.toString());
            res.redirect('/addPlayer');
        } else {
            next();
        }
    },



    editPlayerPostValidate: function(req, res, next){
        //console.log('Validation check:', req.body);
        const rulesSchema = Joi.object({
           username: Joi.string().alphanum().min(3).max(30).required(),
           password: Joi.string().regex(/[a-zA-Z0-9]{3,30}/).allow('').optional(), 
           firstname: Joi.string().alphanum().min(3).max(30).required(),
           lastname: Joi.string().alphanum().min(3).max(30).required(),
           // email: Joi.string().email().required(),
           gender: Joi.string().required(),
           bot: Joi.string().required(),
           mobile: Joi.number().required(),
           accountNumber: Joi.string().alphanum(),
           country: Joi.string().required(),
           currency: Joi.string().required()
        });

        const ret = Joi.validate(req.body, rulesSchema, {
            allowUnknown: false,
            abortEarly: false
        });

        if (ret.error) {
            // res.status(400).end(ret.error.toString());
            console.log("Error",ret.error.toString());
            req.flash('error', ret.error.toString());
            // console.log('ret.error', ret.error.toString());
            res.redirect('/player');
        } else {
            next();
        }
    },


    stacksValidation: function(req,res,next){

        const rulesSchema = Joi.object({
           minStacks: Joi.string().min(1).required(),
           maxStack: Joi.string().min(1).required(),
           flag: Joi.string(),
        });

        const ret = Joi.validate(req.body, rulesSchema, {
            allowUnknown: false,
            abortEarly: false
        });

        if (ret.error) {
            // res.status(400).end(ret.error.toString());
            console.log("Error",ret.error.toString());
            req.flash('error', ret.error.toString());
            // console.log('ret.error', ret.error.toString());
            res.redirect('/cashgames/stacks');
        } else {
            next();
        }
    },

    rakeCapValidation: function(req,res,next){

        const rulesSchema = Joi.object({
            stack:Joi.string().required(),
            rake:Joi.number().required(),
            player2Cap:Joi.number().required(),
            player3Cap:Joi.number().required(),
            player5Cap:Joi.number().required(),
        });

        const ret = Joi.validate(req.body, rulesSchema, {
            allowUnknown: false,
            abortEarly: false
        });

        if (ret.error) {
            // res.status(400).end(ret.error.toString());
            console.log("Error",ret.error.toString());
            req.flash('error', ret.error.toString());
            // console.log('ret.error', ret.error.toString());
            res.redirect('/cashGames/rakeCap');
        } else {
            next();
        }
    },

    // Setting Validation

    settingsValidation: function(req,res,next){

        const rulesSchema = Joi.object({
           rakePercenage: Joi.number().required(),
           chips: Joi.number().required(),
           //defaultDiamonds: Joi.number().required(),
           //rackAmount: Joi.number().required(),
           //expireTime : Joi.required(),
           id : Joi
        });
        const ret = Joi.validate(req.body, rulesSchema, {
            allowUnknown: true,
            abortEarly: false
        });

        if (ret.error) {

            console.log("Error",ret.error.toString());
            req.flash('error', ret.error.toString());

            res.redirect('/settings');
        } else {
            next();
        }
    },


    addSitGoTouValidation: function(req,res,next){

        const rulesSchema = Joi.object({
            sit_n_go_tur_blind_levels : Joi,
            sit_n_go_tur_1st_payout : Joi,
            sit_n_go_tur_2st_payout : Joi,
            sit_n_go_tur_3st_payout : Joi,
            sit_n_go_tur_breaks_start_time : Joi,
            sit_n_go_tur_breaks : Joi,
            sit_n_go_tur_default_game_play_chips : Joi.number().required(),
            sit_n_go_tur_tex_stacks : Joi,
            sit_n_go_tur_tex_buy_in : Joi.number().required(),
            sit_n_go_tur_tex_entry_fee : Joi.number().required(),
            fee : Joi,
            sit_n_go_tur_omh_stacks : Joi,
            sit_n_go_tur_omh_buy_in : Joi.number().required(),
            sit_n_go_tur_omh_entry_fee : Joi.number().required(),

        });
        const ret = Joi.validate(req.body, rulesSchema, {
            allowUnknown: false,
            abortEarly: false
        });

        if (ret.error) {
            // res.status(400).end(ret.error.toString());
            console.log("Error",ret.error.toString());
            req.flash('error', ret.error.toString());
            // console.log('ret.error', ret.error.toString());
            res.redirect('/regular-tournament/tournament');
        } else {
            next();
        }
    },

    // regular Tournament Validation

    regularTournamentValidation : function(req, res, next){
       const rulesSchema = Joi.object({
             name: Joi.string().min(3).max(30).required(),
             buy_in: Joi.number().required(),
             stacks_chips: Joi.number().min(1).required(),
             entry_fee: Joi.number().required(),
             fee: Joi.string().required(),
             //rebuy_time: Joi.number(),
             breaks_time: Joi.number().required(),
             game_speed: Joi.string().required(),
             min_players: Joi.string().required(),
             max_players: Joi.string().required(),
             register_from_date_time: Joi.date().required(),
             tournament_date_time: Joi.date().required(),
             blind_levels_rise_time: Joi.string().required(),
             description: Joi.string().required(),
        });

       const ret = Joi.validate(req.body, rulesSchema, {
           allowUnknown: true,
           abortEarly: false
       });

       if (ret.error) {
           // res.status(400).end(ret.error.toString());
           console.log("Error",ret.error.toString());
           req.flash('error', ret.error.toString());
           // console.log('ret.error', ret.error.toString());
           res.redirect('/regular-tournament/addRegularTournament');
       } else {
           next();
       }
    },

    regularTournamentUpdateValidation : function(req, res, next){
        const rulesSchema = Joi.object({
              name: Joi.string().min(3).max(30).required(),
              //rebuy_time: Joi.number(),
              breaks_time: Joi.number().required(),
              game_speed: Joi.string().required(),
              min_players: Joi.string().required(),
              max_players: Joi.string().required(),
              register_from_date_time: Joi.date().required(),
              tournament_date_time: Joi.date().required(),
              blind_levels_rise_time: Joi.string().required(),
              description: Joi.string().required(),

         });
 
        const ret = Joi.validate(req.body, rulesSchema, {
            allowUnknown: true,
            abortEarly: false
        });
 
        if (ret.error) {
            // res.status(400).end(ret.error.toString());
            console.log("Error",ret.error.toString());
            req.flash('error', ret.error.toString());
            // console.log('ret.error', ret.error.toString());
            res.redirect('/regular-tournament/addRegularTournament');
        } else {
            next();
        }
     },


    // sit & Go Tournament Validation
    editSngTournamentValidation : function(req, res, next){
        const rulesSchema = Joi.object({
              name: Joi.string().required(),
            //   stacks: Joi.string().required(),
            //   buy_in: Joi.number().required(),
              stacks_chips: Joi.number().required(),
            //   entry_fee: Joi.number().required(),
            //   fee: Joi.string().required(),
            //   game: Joi.string().required(),
              breaks_time: Joi.number().required(),
              game_speed: Joi.string().required(),
            //   min_players: Joi.string().required(),
              max_players: Joi.string().required(),
              blind_levels_rise_time: Joi.string().required(),
              description: Joi.string().required()
         });
 
        const ret = Joi.validate(req.body, rulesSchema, {
            allowUnknown: true,
            abortEarly: false
        });
 
        if (ret.error) {
            // res.status(400).end(ret.error.toString());
            console.log("Error",ret.error.toString());
            req.flash('error', ret.error.toString());
            // console.log('ret.error', ret.error.toString());
            res.redirect('/sng-tournament/addSngTournament');
        } else {
            next();
        }
     },
    sngTournamentValidation : function(req, res, next){
       const rulesSchema = Joi.object({
             name: Joi.string().required(),
             stacks: Joi.string().required(),
             buy_in: Joi.number().required(),
             stacks_chips: Joi.number().required(),
             entry_fee: Joi.number().required(),
             fee: Joi.string().required(),
             game: Joi.string().required(),
             breaks_time: Joi.number().required(),
             game_speed: Joi.string().required(),
            //  min_players: Joi.string().required(),
             max_players: Joi.string().required(),
             blind_levels_rise_time: Joi.string().required(),
             description: Joi.string().required()
        });

       const ret = Joi.validate(req.body, rulesSchema, {
           allowUnknown: true,
           abortEarly: false
       });

       if (ret.error) {
           // res.status(400).end(ret.error.toString());
           console.log("Error",ret.error.toString());
           req.flash('error', ret.error.toString());
           // console.log('ret.error', ret.error.toString());
           res.redirect('/sng-tournament/addSngTournament');
       } else {
           next();
       }
    },

    newsPostValidation: function(req,res,next){

        const rulesSchema = Joi.object({
            title: Joi.string().alphanum().max(30).required(),
            shortDesc: Joi.string().alphanum().required(),
            longDesc: Joi.string().alphanum().required()
        });
        const ret = Joi.validate(req.body, rulesSchema, {
            allowUnknown: false,
            abortEarly: false
        });

        if (ret.error) {
            // res.status(400).end(ret.error.toString());
            console.log("Error",ret.error.toString());
            req.flash('error', ret.error.toString());
            // console.log('ret.error', ret.error.toString());
            res.redirect('/news/add');
        } else {
            next();
        }
    },

}

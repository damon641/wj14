var express = require('express'),
    router = express.Router();
var Sys = require('../../Boot/Sys');

// add passport modules for social media integration
const passport = require('passport');
const passport_conf = require('../../Config/passport')(passport);

// Load Your Cutom Middlewares
router.get('/backend', Sys.App.Middlewares.Frontend.frontRequestCheck, function(req, res) {
    res.send('This is Backend');
});



/**
 * Auth Router
 */
router.get('/', Sys.App.Middlewares.Backend.loginCheck, Sys.App.Controllers.Auth.login);
router.post('/', Sys.App.Middlewares.Backend.loginCheck, Sys.App.Middlewares.Validator.loginPostValidate, Sys.App.Controllers.Auth.postLogin);

router.get('/forgot-password', Sys.App.Controllers.Auth.forgotPassword);
router.post('/forgot-password', Sys.App.Controllers.Auth.forgotPasswordSendMail);
router.get('/reset-password/:token', Sys.App.Controllers.Auth.resetPassword);
router.post('/reset-password/:token', Sys.App.Controllers.Auth.postResetPassword);
router.get('/logout', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.Auth.logout);


router.get('/register', Sys.App.Middlewares.Backend.loginCheck, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.Auth.register);

router.get('/profile', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.Auth.profile);

router.post('/profile/update', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.Auth.profileUpdate);

router.post('/profile/changePwd', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.Auth.changePassword);

router.post('/profile/changeAvatar', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.Auth.changeAvatar);

/**
 * Dashboard Router
 */
router.get('/dashboard', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.Dashboard.home);
router.get('/dashboard/graph', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.Dashboard.graph);
/**
 * User Router
 */
router.get('/user', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.UserController.users);
router.get('/user/getUser', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.UserController.getUser);

router.get('/addUser', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.UserController.addUser);
// post data can beobtained by req.body.<parameter_name>
router.post('/addUser', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Middlewares.Validator.registerUserPostValidate, Sys.App.Controllers.UserController.addUserPostData);
router.post('/user/getUserDelete', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.UserController.getUserDelete);

// here mentioned id is fetched as req.params.id
router.get('/userEdit/:id/', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.UserController.editUser);
router.post('/userEdit/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Middlewares.Validator.editUserPostValidate, Sys.App.Controllers.UserController.editUserPostData);

router.get('/test/testing', Sys.App.Middlewares.Backend.loginCheck, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.Auth.login);

/***

	Player Route
	------------
****/

router.get('/player', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.PlayerController.player);

router.get('/player/getPlayer', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.PlayerController.getPlayer);

router.get('/allPlayers', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.PlayerController.allPlayers);

router.get('/player/getAllPlayers', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.PlayerController.getAllPlayers);

router.get('/player/getActivePlayer', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.PlayerController.getActivePlayer);

router.get('/addPlayer', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.PlayerController.addPlayer);

router.post('/addPlayer', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Middlewares.Validator.registerPlayerPostValidate, Sys.App.Controllers.PlayerController.addPlayerPostData);

router.get('/playerEdit/:id/', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.PlayerController.editPlayer);

router.post('/playerEdit/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Middlewares.Validator.editPlayerPostValidate, Sys.App.Controllers.PlayerController.editPlayerPostData);

router.post('/player/getPlayerDelete', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.PlayerController.getPlayerDelete);

router.post('/player/active', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.PlayerController.active);

router.post('/player/inActive', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.PlayerController.inActive);

router.post('/player/convert', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.PlayerController.convert);
router.post('/player/chipsAdd', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.PlayerController.chipsAdd);
router.post('/player/get/chipsNotes', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.PlayerController.getChipsNotes);
router.post('/player/update/chipNotes', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.PlayerController.updateChipsNotes);

router.post('/player/chipsAction', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.PlayerController.chipsAction);


router.get('/player/chipsHistory/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.PlayerController.chipsHistory);
router.get('/player/getChipsHistory/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.PlayerController.getChipsHistory);

router.get('/player/cashTransactionHistory/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.PlayerController.cashTransactionHistory);
router.get('/player/getCashTransactionHistory/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.PlayerController.getCashTransactionHistory);
//router.get('/get/player/cash/transaction/:id',Sys.App.Middlewares.Backend.Authenticate,Sys.App.Middlewares.Backend.HasRole('admin','senior','master','agent'),Sys.App.Controllers.PlayerController.getCashTransactionHistoryNe);

router.get('/player/loginHistory/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.PlayerController.loginHistory);

router.get('/player/getLoginHistory/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.PlayerController.getLoginHistory);

router.get('/player/gameHistory/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.PlayerController.gameHistory);

router.get('/player/getPlayerGameHistory/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.PlayerController.getPlayerGameHistory);

router.get('/player/profile/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.PlayerController.playerProfile);

// router.get('/accountNumberUpdateRequest',Sys.App.Middlewares.Backend.Authenticate,Sys.App.Middlewares.Backend.HasRole('admin','senior','master','agent'),Sys.App.Controllers.PlayerController.accountNumberUpdateRequest);

// router.get('/getAccountNumberUpdateRequest',Sys.App.Middlewares.Backend.Authenticate,Sys.App.Middlewares.Backend.HasRole('admin','senior','master','agent'),Sys.App.Controllers.PlayerController.getAccountNumberUpdateRequest);

router.post('/accountNumber-request-update', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.PlayerController.UpdateAccountNumberRequest);

/**
 * @description: Routes for withdraw and deposit
 * @author: Naveen
 * @date : 07/Apr/202 
 */
router.get('/deposit-receipt', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.PlayerController.depositReceipt);

router.get('/getDepositReceipt', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.PlayerController.getDepositReceipt);

router.post('/depositAction', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.PlayerController.depositHandler);

router.get('/withdraw', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.PlayerController.withdraw);

router.get('/getWithdraw', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.PlayerController.getWithdraw);

router.post('/withdrawAction', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.PlayerController.withdrawHandler);

/***

	Settings Route

**/

router.post('/settings/add', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Middlewares.Validator.settingsValidation, Sys.App.Controllers.SettingsController.settingsAdd);

router.get('/settings', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.SettingsController.settings);

router.post('/settings/update', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Middlewares.Validator.settingsValidation, Sys.App.Controllers.SettingsController.settingsUpdate);

router.get('/maintenance', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.SettingsController.maintenance);

//router.post('/maintenance/statusChange',Sys.App.Middlewares.Backend.Authenticate,Sys.App.Middlewares.Backend.HasRole('admin'),Sys.App.Controllers.SettingsController.maintenanceStatusChange);

router.get('/maintenance/edit/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.SettingsController.editMaintenance);
router.post('/maintenance/edit/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.SettingsController.updateMaintenance);
router.post('/maintenance/quick/edit/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.SettingsController.quickUpdateMaintenance);
router.post('/maintenance/restartServer', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.SettingsController.restartServer);
/***

	maintenance and DailyReports Route

**/

router.post('/maintenance/DailyReports', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.SettingsController.DailyReports);
router.post('/maintenance/DailyReportsWithMaintenance', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.SettingsController.DailyReportsWithMaintanace);

/***

	Notification Route

**/
router.post('/notification/add', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.notificationController.notificationAdd);

router.get('/notification', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.notificationController.notification);

router.post('/notification/update', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.notificationController.notificationUpdate);

/******

Cash Games

*******/

router.get('/cashGames/rakeCap', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.rackCapController.rakeCap);

router.get('/cashGames/getRakeCaps', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.rackCapController.getRackCape);

router.get('/cashGames/addRakeCap', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.rackCapController.addRackCap);

router.post('/cashGames/addRakeCap', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Validator.rakeCapValidation, Sys.App.Controllers.rackCapController.postRakeCap);

router.post('/cashGames/getRakeCapsDelete', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.rackCapController.getRackCapDelete);

router.get('/cashGames/RakeCapEdit/:id/', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.rackCapController.editRackCap);

router.post('/cashGames/RakeCapEdit/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Validator.rakeCapValidation, Sys.App.Controllers.rackCapController.editRackCapPostData);

// currency

router.get('/currency', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.CurrencyController.currency);

//vatsal code start

router.get('/cashgames/stacks', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.StacksController.stacks);

router.get('/cashgames/getStacks', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.StacksController.getStacks);

router.get('/cashgames/addStacks', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.StacksController.addStacks);

router.post('/cashgames/addStacks', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Validator.stacksValidation, Sys.App.Controllers.StacksController.postStacks);

router.post('/cashgames/getStacksDelete', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.StacksController.getStacksDelete);

router.get('/cashgames/stacksEdit/:id/', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.StacksController.editstacks);

router.post('/cashgames/stacksEdit/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Validator.stacksValidation, Sys.App.Controllers.StacksController.editStacksPostData);

//vatsal code End

router.get('/cashgames/texas', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.TableController.texas);

router.get('/cashgames/getCashGamePoker/:type/:tableType', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.TableController.getCashGamePoker);

router.post('/cashgames/CashPokerDelete', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.TableController.CashPokerDelete);


router.get('/cashgames/omaha', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.TableController.omaha);


router.get('/cashgames/texas/gameHistory', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.GameController.game);

router.get('/cashgames/texas/gameHistory/:type/:tableType', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.GameController.gameHistory);


router.get('/cashgames/texas/tableHistory/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.GameController.tableHistory);

router.get('/cashgames/omaha/gameHistory', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.GameController.gameOmaha);


router.get('/cashgames/omaha/getTableHistory/:type/:tableType', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.GameController.getGameHistory);

router.get('/cashgames/omaha/tableHistory/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.GameController.getTableHistoryOmaha);

/**

		Sit & Go Tournament

**/

router.get('/sit-go-tournament/sitGTouSetting', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.RoomController.settings);

//router.post('/sit-go-tournament/sitGTouSettingAdd',Sys.App.Middlewares.Backend.Authenticate,Sys.App.Middlewares.Validator.addSitGoTouValidation,Sys.App.Controllers.RoomController.sitNGosettingPostDataAdd);


router.post('/sit-go-tournament/sitGTouSettingUpdate/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.RoomController.sitNGosettingPostDataUpdate);


router.get('/sit-go-tournament/texas', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.TableController.texasSitGoTour);

router.get('/sit-go-tournament/getCashGamePoker/:type/:tableType', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.TableController.getPokerSitGoTour);

router.post('/sit-go-tournament/CashPokerDelete', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.TableController.pokerDeleteSitGoTour);

router.get('/sit-go-tournament/omaha', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.TableController.omahaSitGoTour);



router.get('/sit-go-tournament/texas/gameHistory', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.GameController.texasGameHistorySitGo);

router.get('/sit-go-tournament/texas/gameHistory/:type/:tableType', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.GameController.gameHistorySitGo);


router.get('/sit-go-tournament/texas/tableHistory/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.GameController.tableHistorySitGo);

router.get('/sit-go-tournament/omaha/gameHistory', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.GameController.gameHistoryOmahaSitGo);


router.get('/sit-go-tournament/omaha/getTableHistory/:type/:tableType', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.GameController.getGameHistorySitGo);

router.get('/sit-go-tournament/omaha/tableHistory/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.GameController.getTableHistoryOmahaSitGo);

/**

		Regular Tournament

**/

/*router.get('/regular-tournament/tournament',Sys.App.Middlewares.Backend.Authenticate,Sys.App.Controllers.RoomController.tournament);

router.get('/regular-tournament/addTournament',Sys.App.Middlewares.Backend.Authenticate,Sys.App.Controllers.RoomController.addTournament);

router.post('/regular-tournament/postToAddTournament',Sys.App.Middlewares.Backend.Authenticate,Sys.App.Controllers.RoomController.saveRegularTexasTournament);

router.get('/regular-tournament/getRegularTournament',Sys.App.Middlewares.Backend.Authenticate,Sys.App.Controllers.RoomController.getRegularTournament);

router.post('/regular-tournament/delete',Sys.App.Middlewares.Backend.Authenticate,Sys.App.Controllers.RoomController.delete);

router.get('/regular-tournament/editTournament/:id',Sys.App.Middlewares.Backend.Authenticate,Sys.App.Controllers.RoomController.editTournament);

router.post('/regular-tournament/editRegularTournament/:id',Sys.App.Middlewares.Backend.Authenticate,Sys.App.Controllers.RoomController.editRegularTournament);*/


router.get('/regular-tournament/texas', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.TableController.texasRegularTou);

router.get('/regular-tournament/getCashGamePoker/:type/:tableType', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.TableController.getPokerRegularTou);

router.post('/regular-tournament/CashPokerDelete', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.TableController.pokerDeleteRegularTou);

router.get('/regular-tournament/omaha', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.TableController.omahaRegularTou);


router.get('/regular-tournament/texas/gameHistory', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.GameController.gameRegularTou);

router.get('/regular-tournament/texas/gameHistory/:type/:tableType', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.GameController.gameHistoryRegularTou);


router.get('/regular-tournament/texas/tableHistory/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.GameController.tableHistoryRegularTou);

router.get('/regular-tournament/omaha/gameHistory', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.GameController.gameOmahaRegularTou);


router.get('/regular-tournament/omaha/getTableHistory/:type/:tableType', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.GameController.getGameHistoryRegularTou);

router.get('/regular-tournament/omaha/tableHistory/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Controllers.GameController.getTableHistoryOmahaRegularTou);


/**
		Chips History
**/

router.get('/player/chipsHistory', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.ChipsHistory.chipsHistory);


router.get('/player/getChipsHistory', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.ChipsHistory.getChipsHistory);


/**
		Security List
**/

router.get('/security', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.SecurityController.security);

/**
		Game History -- Added by chetan
**/
router.get('/game/history', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.GameController.allGameHistoryLimited)
router.get('/game', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.GameController.allGameData);
router.get('/game/getGameData', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.GameController.getAllGameData);
router.get('/game/allGameHistory/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.GameController.allGameHistory);



/**
 * Table Master - Shubham
 */
router.get('/table', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.RoomController.getTableList);
router.get('/table/add', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.RoomController.getAddTable);
router.post('/table/add', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.RoomController.saveTable);

/**
 * Agents
 */
router.get('/agents', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Middlewares.Backend.agentLimitCheck, Sys.App.Controllers.agentController.agents);
router.get('/allAgents', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Middlewares.Backend.agentLimitCheck, Sys.App.Controllers.agentController.allAgents);
router.get('/agents/getAgents/:type', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.agentController.getAgents);
router.get('/agents/getAllAgents/:type', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.agentController.getAllAgents);
router.get('/addAgent', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Middlewares.Backend.agentLimitCheck, Sys.App.Controllers.agentController.addAgent);
router.post('/addAgent', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Middlewares.Backend.agentLimitCheck, Sys.App.Controllers.agentController.addAgentPostData);
router.get('/agentEdit/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.agentController.editAgent);
router.get('/trasferEdit/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.agentController.getTransferChip);
router.post('/agentEdit/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.agentController.editAgentPostData);
router.post('/agent/getAgentDelete', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.agentController.getAgentDelete);

// router.post('/agent/tempChipsCheckbox', Sys.App.Middlewares.Backend.Authenticate,Sys.App.Middlewares.Backend.HasRole('admin','senior','master','agent'), Sys.App.Controllers.agentController.AgentChipsMove);
// router.get('/agent/chips/update', Sys.App.Controllers.agentController.AgentChipsCloneJob)

router.get('/agent/update/balance', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.agentController.agentUpdateBalance);
// Agent Login
router.get('/agents/login', Sys.App.Middlewares.Backend.loginCheck, Sys.App.Controllers.agentController.agentsLogin);
router.post('/agents/login', Sys.App.Middlewares.Backend.loginCheck, Sys.App.Controllers.agentController.agentsPostLogin);
router.get('/agent/profile', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.agentController.getAgentProfile);
router.post('/agent/profile/update', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.agentController.updateAgentProfile);
router.post('/agent/profile/changePwd', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.agentController.changeAgentPassword);
router.post('/agent/profile/changeAvatar', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.agentController.changeAgentAvatar);
router.post('/agent/active', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.agentController.active);
// router.post('/agent/transfer',Sys.App.Middlewares.Backend.Authenticate,Sys.App.Middlewares.Backend.HasRole('admin','senior','master','agent'),Sys.App.Controllers.agentController.agentTransfer);
router.post('/agent/loginuser/transfer', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.agentController.userAgentTransfer);
router.post('/agent/loginuser/userextraChips', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.agentController.userExtraChipsTransfer);
// router.post('/agent/loginuser/transfer',Sys.App.Controllers.agentController.userAgentTransfer);

router.get('/agent/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.agentController.agentPlayerStats);
router.get('/agent/:id/getAgentStats', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.agentController.getAgentStats);
router.get('/agent/:id/getPlayerStats', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.agentController.getPlayerStats);
router.get('/agent/rack/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.agentController.agentRackHistory);
router.get('/agent/getAgentRackHistory/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.agentController.getAgentRackHistory);


//router.get('/test/agent/rack/:id', Sys.App.Middlewares.Backend.Authenticate,Sys.App.Middlewares.Backend.HasRole('admin','senior','master','agent'), Sys.App.Controllers.agentController.agentRackHistoryTest);
//router.get('/test/agent/getAgentRackHistory/:id', Sys.App.Middlewares.Backend.Authenticate,Sys.App.Middlewares.Backend.HasRole('admin','senior','master','agent'), Sys.App.Controllers.agentController.getAgentRackHistoryTest);


router.get('/my-rack-history', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.agentController.myRackHistory);
router.get('/getMyRackHistory', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.agentController.getMyRackHistory);
router.post('/agent/requestCash', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.agentController.requestCash);
router.post('/agent/get/chipsNotes', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.agentController.getChipsNotes);
router.post('/agent/update/chipNotes', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.agentController.updateChipsNotes);
router.post('/agent/update/chipTransfer', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.agentController.ChipsTransfer);

router.get('/my-chips-Transactions', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.AllUsersTransactionController.allTransactions);
router.get('/getMyChipsTransactions', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.AllUsersTransactionController.getMyChipsTransactions);
router.post('/allUser/requestCash', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.AllUsersTransactionController.requestCash);
router.get('/my-chips-Transactions/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.AllUsersTransactionController.playersTransactions);
router.get('/my-chips-Transactions/getPlayersTransactions/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.AllUsersTransactionController.getPlayersTransactions);
/**
 * Regular Tournament
 */
router.get('/regular-tournament', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.regularTournamentController.RegularTournament);
router.get('/regular-tournament/getRegularTournament', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.regularTournamentController.getRegularTournament);
router.get('/regular-tournament/addRegularTournament', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.regularTournamentController.addRegularTournament);
router.post('/regular-tournament/postToAddTournament', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Middlewares.Validator.regularTournamentValidation, Sys.App.Controllers.regularTournamentController.addRegularTournamentPostData);
router.get('/regular-tournament/editRegularTournament/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.regularTournamentController.editRegularTournament);
router.post('/regular-tournament/editRegularTournament/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Middlewares.Validator.regularTournamentUpdateValidation, Sys.App.Controllers.regularTournamentController.editRegularTournamentPostData);
router.post('/regular-tournament/delete', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.regularTournamentController.deleteRegularTournament);
router.get('/regular-tournament/report/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.regularTournamentController.RegularTournamentReport);
router.get('/regular-tournament/:id/getPlayers', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.regularTournamentController.getTournamentPlayers);
router.get('/regular-tournament/:id/getRooms', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.regularTournamentController.getTournamentRooms);
router.get('/regular-tournament/room/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.regularTournamentController.getRegularTournamentGame);
router.get('/regular-tournament/game/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.regularTournamentController.getRegularTournamentGameData);

/**
 * sng Tournament
 */
router.get('/sng-tournament', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.sngTournamentController.sngTournament);
router.get('/sng-tournament/getSngTournament', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.sngTournamentController.getSngTournament);
router.get('/sng-tournament/addSngTournament', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.sngTournamentController.addSngTournament);
router.post('/sng-tournament/postToAddSngTournament', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Middlewares.Validator.sngTournamentValidation, Sys.App.Controllers.sngTournamentController.addSngTournamentPostData);
router.get('/sng-tournament/editSngTournament/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.sngTournamentController.editSngTournament);
router.post('/sng-tournament/editSngTournament/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Middlewares.Validator.editSngTournamentValidation, Sys.App.Controllers.sngTournamentController.editSngTournamentPostData);
router.post('/sng-tournament/delete', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.sngTournamentController.deleteSngTournament);


router.get('/sng-tournament/report/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.sngTournamentController.SngTournamentReport);
router.get('/sng-tournament/:id/getPlayers', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.sngTournamentController.getSngTournamentPlayers);
router.get('/sng-tournament/:id/getRooms', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.sngTournamentController.getSngTournamentRooms);
router.get('/sng-tournament/room/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.sngTournamentController.getSngTournamentGame);
router.get('/sng-tournament/game/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.sngTournamentController.getSngTournamentGameData);


/**
		Blind Levels
**/
router.get('/blindLevels', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.blindLevelsController.blindLevels);
router.post('/addBlindLevels', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.blindLevelsController.saveBlindLevels);
router.post('/updateBlindLevels', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.blindLevelsController.updateBlindLevels);
router.post('/blindLevelsEdit', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.blindLevelsController.editBlindLevels);
router.post('/blindLevelsDelete', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.blindLevelsController.deleteBlindLevels);
router.post('/blindLevelsParticularDelete', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.blindLevelsController.deleteParticularBlindLevels);
/**
		Price Poool
**/

router.get('/price-pool/sngTournament', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.sngPricepoolController.sngPricePool);
router.post('/price-pool/sngTournament/add', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.sngPricepoolController.sngPricePoolAdd);
router.post('/price-pool/sngTournament/update', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.sngPricepoolController.sngPricePoolUpdate);

router.get('/price-pool/regularTournament', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.regularPricepoolController.regularPricePool);
router.get('/price-pool/regularTournament/add', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.regularPricepoolController.addregularPricePool);
router.post('/price-pool/regularTournament/add', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.regularPricepoolController.addregularPricePoolPostData);
router.get('/price-pool/regularTournament/getRegularPricepool', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.regularPricepoolController.getRegularPricePool);
router.post('/price-pool/regularTournament/delete', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.regularPricepoolController.deleteregularPricePool);
router.get('/price-pool/regularTournament/edit/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.regularPricepoolController.editregularPricePool);
router.post('/price-pool/regularTournament/edit/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.regularPricepoolController.editregularPricePoolPostData);

router.get('/price-pool/regularTournament/getpercentage', Sys.App.Controllers.regularPricepoolController.getpercentage);
router.post('/price-pool/regularTournament/getTournamentPlayersPercentage', Sys.App.Controllers.regularPricepoolController.getTournamentPlayersPercentage);
/**
		Display Rack Data -- Added by chetan
**/
router.get('/rack', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.RackController.racks);
router.get('/rack/getRackData', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.RackController.getRackData)


/**
		Blocked ip list
**/
router.get('/blockedIp', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.SecurityController.blockedIp);

router.get('/blockedIp/getBlockedIp', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.SecurityController.getBlockedIp);

router.get('/blockedIp/add', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.SecurityController.addblockedIp);

router.post('/blockedIp/add', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.SecurityController.addblockedIpPostData);

router.post('/blockedIp/delete', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.SecurityController.deleteBlockedIp);

router.get('/blockedIp/edit/:id/', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.SecurityController.editBlockedIp);

router.post('/blockedIp/edit/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.SecurityController.editBlockedIpPostData);


/**
		Promocode
**/
router.get('/promocode', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.PromocodeController.promocode);

router.get('/promocode/getPromocode', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.PromocodeController.getPromocode);

router.get('/promocode/add', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.PromocodeController.addPromocode);

router.post('/promocode/add', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.PromocodeController.addPromocodePostData);

router.post('/promocode/delete', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.PromocodeController.deletePromocode);

router.get('/promocode/edit/:id/', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.PromocodeController.editPromocode);

router.post('/promocode/edit/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.PromocodeController.editPromocodePostData);

/**
		News
**/
router.get('/news', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.NewsController.news);

router.get('/news/getNews', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.NewsController.getNews);

router.get('/news/add', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.NewsController.addNews);

router.post('/news/add', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.NewsController.postNews);

router.post('/news/delete', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.NewsController.getNewsDelete);

router.get('/news/edit/:id/', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.NewsController.editNews);

router.post('/news/edit/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.NewsController.editNewsPostData);

router.post('/news/upload_editor_image', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.NewsController.uploadEditorImage)



/**
		In-app Purchase
**/
router.get('/inAppPurchase', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.InAppPurchaseController.inAppPurchase);

router.get('/inAppPurchase/getInAppPurchase', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.InAppPurchaseController.getInAppPurchase);

router.get('/inAppPurchase/add', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.InAppPurchaseController.addInAppPurchase);

router.post('/inAppPurchase/add', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.InAppPurchaseController.addInAppPurchasePostData);

router.post('/inAppPurchase/delete', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.InAppPurchaseController.deleteInAppPurchase);

router.get('/inAppPurchase/edit/:id/', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.InAppPurchaseController.editInAppPurchase);

router.post('/inAppPurchase/edit/:id', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.InAppPurchaseController.editInAppPurchasePostData);


/**
 * Game Charts -- Added by chetan
 **/

router.get('/dashboardChart/getMonthlyPlayedGameChart', Sys.App.Controllers.Dashboard.getMonthlyPlayedGameChart);

router.get('/dashboardChart/getGameUsageChart', Sys.App.Controllers.Dashboard.getGameUsageChart);

router.get('/playerChart/getMonthlyGamePlayedByPlayerChart/:id', Sys.App.Controllers.gameStatisticsController.getMonthlyGamePlayedByPlayerChart);





router.get('/agents/tree', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.agentController.agentTree);

router.get('/export', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.PlayerController.exportData)



/**
	test game statistics routes
**/

router.get('/game/statistics/add', Sys.App.Controllers.gameStatisticsController.addStatisticPostdata);
router.post('/player/rackDeduction', Sys.App.Controllers.PlayerController.rackDeduction);

/**
 * Tournament Cron 
 **/
router.get('/tournamentCheck', Sys.Game.Common.Controllers.TournamentController.checkRegularTournamentStatus);
router.get('/backupCheck', Sys.App.Controllers.SettingsController.checkBackupStatus);

//test
router.get('/getByData', Sys.App.Controllers.NewController.getByData);
router.get('/getSingleData', Sys.App.Controllers.NewController.getSingleData);
router.get('/getById', Sys.App.Controllers.NewController.getById);
router.get('/getCount', Sys.App.Controllers.NewController.getCount);
router.get('/getAgents', Sys.App.Controllers.NewController.getAgents);
router.post('/insertData', Sys.App.Controllers.NewController.insertData);
router.post('/deleteData', Sys.App.Controllers.NewController.deleteData);
router.get('/aggregateQuery', Sys.App.Controllers.NewController.aggregateQuery);
router.get('/playerGameStats', Sys.App.Controllers.NewController.playerGameStats);
router.get('/multipleWinner', Sys.App.Controllers.NewController.multipleWinner);


//Reports MOdules routes
// vatsal thakkar 
router.get('/agentReports', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.ReportsController.agentReports);
router.get('/selfReports', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.ReportsController.selfReports);
router.get('/selfRepots/getData', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.ReportsController.getSelfReportData);
router.get('/playerReports', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.ReportsController.playerReports);
router.get('/agentRepots/getData', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.ReportsController.getSelfReportData);
router.get('/playerRepots/getData', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.ReportsController.getPlayerReportData);
router.get('/allUsersChips', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.ReportsController.allUser);
router.get('/allUsersChips/getData', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.ReportsController.allUserGetData);
router.get('/systemChips', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.ReportsController.systemChips);
router.get('/systemChips/getData', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.ReportsController.systemChipsGetData);
router.get('/errorReports', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.ReportsController.errorReports);
router.get('/errorReports/getData', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.ReportsController.errorReportsGetData)
    //old Player router for transaction data collection for 1 miliion records player records
router.get('/playerOldReports', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.ReportsController.playerOldReports);
router.get('/playerOldRepots/getData', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.ReportsController.getPlayerOldReportData);
//prasham Develop routes
router.get('/transactionReports', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.ReportsController.transactionReports);
router.get('/transactionReports/getData', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.ReportsController.transactionReportsGetData);
router.get('/playerReports/:uniqId/:sessionId/:isTournament', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.ReportsController.allPlayerGame);
router.get('/playerGameRepots/getData', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin', 'senior', 'master', 'agent'), Sys.App.Controllers.ReportsController.getAllPlayerGameData);
router.get('/errorReportValidation', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.ReportsController.errorReportValidation);
router.get('/errorReportValidation/getData', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.ReportsController.errorReportValidationGetData);
//cron for daily users chips in all user daily balance
router.get('/allUserDailyBalanceReports', Sys.App.Controllers.ReportsController.allUserdailyBalanceReports);
// router.get('/all/transaction',Sys.App.Middlewares.Backend.Authenticate,Sys.App.Middlewares.Backend.HasRole('admin'),Sys.App.Controllers.ReportsController.plyAllTransaction);
// router.get('/get/all/transaction',Sys.App.Middlewares.Backend.Authenticate,Sys.App.Middlewares.Backend.HasRole('admin'),Sys.App.Controllers.ReportsController.plyAllTransactionGetData);
// set temp_chips rouer
router.get('/player/update/balance', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.PlayerController.updateBalance);
// set all system chips calculate in setting system Chips'
router.get('/updateSystemBalance', Sys.App.Middlewares.Backend.Authenticate, Sys.App.Middlewares.Backend.HasRole('admin'), Sys.App.Controllers.PlayerController.updateSystemBalance);
router.get('/removePlayerFromGame', Sys.Game.CashGame.Texas.Controllers.PlayerController.removePlayerFromRooms);


router.get('/getNotificationCount', Sys.App.Controllers.Dashboard.getNotificationCount);

module.exports = router
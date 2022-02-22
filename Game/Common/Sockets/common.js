var Sys = require('../../../Boot/Sys');

module.exports = function (Socket) {
  try {
    Socket.on("ReconnectPlayer",async function(data,responce) {
      console.log("Reconnect Called............!!!!!!!!",data)
      responce(await Sys.Game.Common.Controllers.PlayerController.reconnectPlayer(Socket,data));
    });

    Socket.on("CheckRunningGame",async function(data,responce) {
      responce(await Sys.Game.Common.Controllers.PlayerController.checkRunningGame(Socket,data));
    });

    Socket.on("LoginPlayer",async function(data,responce) {
      console.log("LoginPlayer called: ", data);
      responce(await Sys.Game.Common.Controllers.PlayerController.playerLogin(Socket,data));
    });

    Socket.on("GetAddVideo",async function(data,responce) {
      console.log("GetAddVideo called: ", data);
      responce(await Sys.Game.Common.Controllers.PlayerController.getVideoLink(Socket,data));
    });
    
    Socket.on("ClaimChips",async function(data,responce) {
      console.log("ClaimChips called: ", data);
      responce(await Sys.Game.Common.Controllers.PlayerController.claimChips(Socket,data));
    });

    Socket.on("RegisterPlayer",async function(data,responce) {
      console.log("Register Player", data);
      responce(await Sys.Game.Common.Controllers.PlayerController.playerRegister(Socket,data));
    });

    Socket.on("UpdateProfile",async function(data,responce) {
      responce(await Sys.Game.Common.Controllers.PlayerController.updateProfile(Socket,data));
    });

    Socket.on("ChangeUsername",async function(data,responce) {
      console.log("ChangeUsername api called", data);
      responce(await Sys.Game.Common.Controllers.PlayerController.changeUsername(Socket,data));
    });

    Socket.on("LogOutPlayer",async function(data,responce) {
      responce(await Sys.Game.Common.Controllers.PlayerController.playerLogout(Socket,data));
    });
    
    Socket.on("GetStacks",async function(data,responce) {
      console.log("GetStacks  Called :",data);
      responce(await Sys.Game.Common.Controllers.RoomController.getStacks(Socket,data));
    });

    Socket.on("SearchLobby",async function(data,responce) {
     console.log("SearchLobby  Called :",data);
      responce(await Sys.Game.Common.Controllers.RoomController.listRooms(Socket,data));
    });

    Socket.on("GetRunningGameList",async function(data,responce) {
     // console.log("SearchLobby  Called :",data);
      responce(await Sys.Game.Common.Controllers.RoomController.getRunningGameList(Socket,data));
    });

    Socket.on("PrivateRoomLogin",async function(data,responce) {
      console.log("PrivateRoomLogin  Called :",data);
      responce(await Sys.Game.Common.Controllers.RoomController.privateRoomLogin(Socket,data));
    });

    /** Sng Tournament Events */


    Socket.on("SearchSngLobby",async function(data,responce) {
     console.log("SearchSngLobby  Called :",data);
      responce(await Sys.Game.Common.Controllers.TournamentController.listSngRooms(Socket,data));
    });

    Socket.on("SngTournamentInfo",async function(data,responce) {
      console.log("SngTournamentInfo  Called :",data);
      responce(await Sys.Game.Common.Controllers.TournamentController.sngTournamentInfo(Socket,data));
    });

    Socket.on("RegisterSngTournament", async function(data,responce){
      console.log("RegisterSngTournament  Called :",data);
      responce(await Sys.Game.Common.Controllers.TournamentController.registerSngTournament(Socket,data));
    });

    Socket.on("SngTournamentPlayers",async function(data,responce) {
      console.log("TournamentPlayers  Called :",data);
      responce(await Sys.Game.Common.Controllers.TournamentController.sngTournamentPlayers(Socket,data));
    });

    Socket.on("SngTournamentTables",async function(data,responce) {
      console.log("TournamentTables  Called :",data);
      responce(await Sys.Game.Common.Controllers.TournamentController.sngTournamentTables(Socket,data));
    });

    Socket.on("SngTournamentPayout",async function(data,responce) {
      console.log("TournamentPayout  Called :",data);
      responce(await Sys.Game.Common.Controllers.TournamentController.sngTournamentPayout(Socket,data));
    });

    Socket.on("SngTournamentBlinds",async function(data,responce) {
      console.log("TournamentBlinds  Called :",data);
      responce(await Sys.Game.Common.Controllers.TournamentController.sngTournamentBlinds(Socket,data));
    });

    Socket.on("UnRegisterSngTournament", async function(data,responce){
      responce(await Sys.Game.Common.Controllers.TournamentController.unRegisterSngTournament(Socket,data));
    });

    /** Sng Tournament Events : end */

    Socket.on("JoinTournament",async function(data,responce) {
      console.log("JoinTournament  Called :",data);
      responce(await Sys.Game.Common.Controllers.TournamentController.joinTournament(Socket,data));
    });
    
    Socket.on("RejectTournament", async function(data,responce){
      console.log("RejectTournament  Called :",data);
      responce(await Sys.Game.Common.Controllers.TournamentController.rejectTournament(Socket,data));
    });

    /** Reguler Tournament Events */

    Socket.on("SearchTournamentLobby",async function(data,responce) {
      //console.log("SearchTournamentLobby  Called :",data);
      responce(await Sys.Game.Common.Controllers.TournamentController.searchTournamentLobby(Socket,data));
    });

    Socket.on("Leaderboard",async function(data,responce) {
      console.log("Leaderboard  Called :",data);
      responce(await Sys.Game.Common.Controllers.PlayerController.Leaderboard(Socket,data));
    });

   /* Socket.on("playerStatistics",async function(data,responce) {
      console.log("playerStatistics  Called :",data);
      responce(await Sys.Game.Common.Controllers.PlayerController.playerStatistics(Socket,data));
    });*/

    Socket.on("purchaseHistory",async function(data,responce) {
      console.log("purchaseHistory  Called :",data);
      responce(await Sys.Game.Common.Controllers.PlayerController.purchaseHistory(Socket,data));
    });

    Socket.on("Playerprofile",async function(data,responce) {
       //console.log("Playerprofile  Called :",data);
      responce(await Sys.Game.Common.Controllers.PlayerController.playerProfile(Socket,data));
    });
   
// *************************************Tournament*********************************************************
    Socket.on("TournamentInfo",async function(data,responce) {
      console.log("TournamentInfo  Called :",data);
      responce(await Sys.Game.Common.Controllers.TournamentController.tournamentInfo(Socket,data));
    });

    Socket.on("TournamentPlayers",async function(data,responce) {
      // console.log("TournamentPlayers  Called  :",data);
      responce(await Sys.Game.Common.Controllers.TournamentController.tournamentPlayers(Socket,data));
    });

    Socket.on("TournamentTables",async function(data,responce) {
      console.log("TournamentTables  Called :",data);
      responce(await Sys.Game.Common.Controllers.TournamentController.tournamentTables(Socket,data));
    });

    Socket.on("TournamentPayout",async function(data,responce) {
      console.log("TournamentPayout  Called :",data);
      responce(await Sys.Game.Common.Controllers.TournamentController.tournamentPayout(Socket,data));
    });

    Socket.on("TournamentBlinds",async function(data,responce) {
      console.log("TournamentBlinds  Called :",data);
      responce(await Sys.Game.Common.Controllers.TournamentController.tournamentBlinds(Socket,data));
    });

    Socket.on("RegisterTournament", async function(data,responce){
      console.log("RegisterTournament Called :",data);
      responce(await Sys.Game.Common.Controllers.TournamentController.registerTournament(Socket,data));
    });

    Socket.on("UnRegisterTournament", async function(data,responce){
      console.log("UnRegisterTournament Called :",data);
      responce(await Sys.Game.Common.Controllers.TournamentController.unRegisterTournament(Socket,data));
    });

  /** Reguler Tournament Events : End Here */

    Socket.on("playerProfilePic",async function(data,responce) {
      responce(await Sys.Game.Common.Controllers.PlayerController.playerPicUpdate(Socket,data));
    });

    Socket.on("playerForgotPassword",async function(data,responce) {
      responce(await Sys.Game.Common.Controllers.PlayerController.playerForgotPassword(Socket,data));
    });

    Socket.on("playerChangePassword",async function(data,responce) {
      responce(await Sys.Game.Common.Controllers.PlayerController.playerChangePassword(Socket,data));
    });

    Socket.on("cashGameTournary",async function(data,responce) {
      console.log("cashGameTournary  Called :",data);
      responce(await Sys.Game.Common.Controllers.PlayerController.cashGameTournary(Socket,data));
    });

    Socket.on("newsBlog",async function(data,responce) {
      console.log("newsBlog  Called :",data);
      responce(await Sys.Game.Common.Controllers.PlayerController.newsBlog(Socket,data));
    });

    Socket.on("playerGameHistory", async function(data,responce){
      console.log("PlayerGameHistory  Called :",data);
      responce(await Sys.Game.Common.Controllers.PlayerController.playerGameHistory(Socket, data));
    });

    Socket.on("GameHistory", async function(data,responce){
      console.log("==================GameHistory  Called :==================",data);
      responce(await Sys.Game.Common.Controllers.PlayerController.GameHistory(Socket, data));
    });
  
    Socket.on("FindRoom",async function(data,responce) {
      console.log("FindRoom Called",data);
      responce(await Sys.Game.Common.Controllers.RoomController.findRoom(Socket,data));
    });
  
    Socket.on("createNamespace",async function(data,responce) {
      responce(await Sys.Game.Common.Controllers.RoomController.test(Socket,data));
    });
  
    Socket.on("Localaccess",async function(data,responce) {
      responce(await Game.ThreeCards.Controllers.PlayerController.localaccess(Socket,data));
    });
  
    Socket.on("CreateGuest", async function(data,responce) {
      responce(await Game.ThreeCards.Controllers.PlayerController.createGuest(Socket,data));
    });

    /** In-app-purchase events*/

    Socket.on("AvailableInAppPurchase",async function(data,responce) {
      console.log("AvailableInAppPurchase  Called :",data);
      responce(await Sys.Game.Common.Controllers.InAppPurchaseController.availableInAppPurchase(Socket,data));
    });
        
    Socket.on("VerifyInApp",async function(data,responce) {
      console.log("VerifyInApp  Called :",data);
      responce(await Sys.Game.Common.Controllers.InAppPurchaseController.verifyInApp(Socket,data));
    });

    
    Socket.on("test",async function(data,responce) {
      responce(await Sys.Game.Common.Controllers.PlayerController.test(Socket,data));
    });

    Socket.on("sendMulNotifications",async function(data,responce) {
      responce(await Sys.Game.Common.Controllers.InAppPurchaseController.sendMulNotifications(Socket,data));
    });

    // show cards of folded player event
    Socket.on("ShowFoldedPlayerCards",async function(data,responce) {
      console.log("ShowFoldedPlayerCards :",data);
      //responce(await Sys.Game.Common.Controllers.RoomController.showFoldedPlayerCards(Socket,data));
    });

    // chips transfer one player to another player
    Socket.on("TransferChips",async function(data,responce) {
      console.log("TransferChips is called: ",data);
      responce(await Sys.Game.Common.Controllers.PlayerController.transferChips(Socket,data));
      //responce({status: 'fail',result: null,message: 'This feature is temporarily under-maintenance',statusCode: 400});
    });
    // chips transfer one player to another player

    //JoinRoom byuin and playerchips cashgame
    Socket.on("GetBuyinsAndPlayerchips",async function(data,responce) {
      console.log("GetBuyinsAndPlayerchips :",data);
      responce(await Sys.Game.Common.Controllers.RoomController.getBuyinsAndPlayerchips(Socket,data));
    });
    
    Socket.on("SendIPAddress", async function(data,responce) {
      console.log("SendIPAddress is called: ", data);
      responce(await Sys.Game.Common.Controllers.PlayerController.sendIPAddress(Socket,data));
    });

    //Geo Location 
    Socket.on("LocationTableValidation", async function(data,responce) {
      console.log("LocationTableValidation is called: ", data);
      responce(await Sys.Game.Common.Controllers.RoomController.LocationTableValidation(Socket,data));
    });

    // Verify and login with identifier token in webgl
    Socket.on("VerifyIdentifierToken", async function(data,responce) {
      console.log("VerifyIdentifierToken Called :", data);
      responce(await Sys.Game.Common.Controllers.PlayerController.verifyIdentifierToken(Socket,data));
    });

    /** 
     * @description: Event for update account number
     * @author: Naveen 
     * @date : 03/Apr/2020
     */
    Socket.on("UpdateAccountNumber", async function(data,responce) {
      console.log("UpdateAccountNumber Called :", data);
      responce(await Sys.Game.Common.Controllers.PlayerController.updateAccountNumber(Socket,data));
    });

    /** 
     * @description: Event for upload deposits receipt
     * @author: Naveen 
     * @date : 06/Apr/2020
     */
    Socket.on("UploadDepositReceipt", async function(data,responce) {
      console.log("UploadDepositReceipt Called :", data);
      responce(await Sys.Game.Common.Controllers.PlayerController.uploadDepositReceipt(Socket,data));
    });

    /** 
     * @description: Event for withdrawal 
     * @author: Naveen 
     * @date : 07/Apr/2020
     */
    Socket.on("Withdrawal",async function(data,responce) {
      console.log("Withdrawal",data);
      responce(await Sys.Game.Common.Controllers.PlayerController.withdraw(Socket,data));
    });

    /** 
     * @description: Event for getting account info. 
     * @author: Naveen 
     * @date : 14/Apr/2020
     */
    Socket.on("GetPlayerAccountInfo",async function(data,responce) {
      console.log("GetPlayerAccountInfo",data);
      responce(await Sys.Game.Common.Controllers.PlayerController.getPlayerAccountInfo(Socket,data));
    });

    /** 
     * @description: Event for getting auth Token for HTML. 
     * @author: Naveen 
     * @date : 13/May/2020
     */
    Socket.on("GetTokenForEssentials",async function(data,responce) {
      console.log("GetTokenForEssentials",data);
      responce(await Sys.Game.Common.Controllers.PlayerController.getPlayerToken(Socket,data));
    });

    Socket.on("disconnect", async function() {
      console.log("Socket Disconnected");
    });

  }
  catch (error) {
    console.log("Error In Common Socket Handler : ", error);
  }

}

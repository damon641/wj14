
var Sys = require('../../../../Boot/Sys');

module.exports = function (Socket) {
  try {

    Socket.on("JoinTournament",async function(data,responce) {
      console.log("JoinTournament  Called :",data);
      responce(await Sys.Game.Reguler.Texas.Controllers.TournamentController.joinTournament(Socket,data));
    });

    Socket.on("SubscribeRoom",async function(data,responce) {
      console.log("SubscribeRoom Regualer Called neew :",data);
      responce(await Sys.Game.Reguler.Texas.Controllers.RoomController.subscribeRoom(Socket,data));
    });


    Socket.on("ReconnectGame",async function(data,responce) {
      console.log("ReconnectGame Regualer Called :",data);
      responce(await Sys.Game.Reguler.Texas.Controllers.RoomController.reconnectGame(Socket,data));
    });


    Socket.on("UnSubscribeRoom",async function(data,responce) {
      console.log("UnSubscribeRoom  Called :",data);
      responce(await Sys.Game.Reguler.Texas.Controllers.RoomController.unSubscribeRoom(Socket,data));
    });


    Socket.on("RoomInfo",async function(data,responce) {
      console.log("RoomInfo  Called :",data);
      responce(await Sys.Game.Reguler.Texas.Controllers.RoomController.roomInfo(Socket,data));
    });


  

    Socket.on("LeaveRoom",async function(data,responce) {
      console.log("LeaveRoom  Called :",data);
      responce(await Sys.Game.Reguler.Texas.Controllers.RoomController.leaveRoom(Socket,data));
    });

    Socket.on("SitOutNextHand",async function(data,responce) {
      console.log("TSitOut Called :",data);
      responce(await Sys.Game.Reguler.Texas.Controllers.RoomController.sitOutNextHand(Socket,data));
    });

    Socket.on("SitOutNextBigBlind",async function(data,responce) {
      console.log("sitOutNextBigBlind Called :",data);
      responce(await Sys.Game.Reguler.Texas.Controllers.RoomController.sitOutNextBigBlind(Socket,data));
    });

    // Player Events
    Socket.on("Tip",async function(data,responce) {
      console.log("Tip  Called :",data);
      responce(await Sys.Game.Reguler.Texas.Controllers.PlayerController.tip(Socket,data));
    });

    Socket.on("Requestchips",async function(data,responce) {
      console.log("Requestchips  Called :",data);
      responce(await Sys.Game.Reguler.Texas.Controllers.PlayerController.requestChips(Socket,data));
    });

    Socket.on("Chat",async function(data,responce) {
      console.log("Chat  Called :",data);
      responce(await Sys.Game.Reguler.Texas.Controllers.PlayerController.chat(Socket,data));
    });

    Socket.on("Gift",async function(data,responce) {
      console.log("Gift  Called :",data);
      responce(await Sys.Game.Reguler.Texas.Controllers.PlayerController.gift(Socket,data));
    });

    Socket.on("InviteFriend",async function(data,responce) {
      console.log("InviteFriend  Called :",data);
      responce(await Sys.Game.Reguler.Texas.Controllers.PlayerController.inviteFriend(Socket,data));
    });

    Socket.on("PlayerAction",async function(data,responce) {
      console.log("PlayerAction  Called :",data);
      responce(await Sys.Game.Reguler.Texas.Controllers.PlayerController.playerAction(Socket,data));
    });

    Socket.on("Playerdetail",async function(data,responce) {
      console.log("Playerdetail  Called :",data);
      responce(await Sys.Game.Reguler.Texas.Controllers.PlayerController.playerDetails(Socket,data));
    });

    Socket.on("Dummytest",async function(data,responce) {
      console.log("Dummytest  Called :",data);
      responce(await Sys.Game.Reguler.Texas.Controllers.PlayerProcess.testWinner());
    });

    Socket.on("DeletePlayer",async function(data,responce) {
      console.log("Requestchips Called :",data);
      responce(await Sys.Game.Reguler.Texas.Controllers.RoomController.deletePlr(Socket,data));
    });

    // show cards event
    Socket.on("ShowMyCards",async function(data,responce) {
      console.log("ShowMyCards Called :",data);
      responce(await Sys.Game.Reguler.Texas.Controllers.RoomController.showMyCards(Socket,data));
    });

    // prebets
    Socket.on("DefaultActionSelection",async function(data,responce) {
      console.log("DefaultActionSelection Called :",data);
      responce(await Sys.Game.Reguler.Texas.Controllers.RoomController.defaultActionSelection(Socket,data));
    });

    Socket.on("PlayerOnline",async function(data,responce) {
      console.log("PlayerOnline Called :",data);
      responce(await Sys.Game.Reguler.Texas.Controllers.RoomController.playerOnline(Socket,data));
    });


    Socket.on("disconnect",async function() {
      console.log("disconnect Called");
      if(Socket.myData != undefined){
        if(Socket.myData.playerID != undefined && Socket.myData.roomID != undefined ){
          let data = {
            playerId : Socket.myData.playerID,
            roomId  : Socket.myData.roomID
          }
         // await Sys.Game.Reguler.Texas.Controllers.RoomController.leaveRoom(Socket, data);
          console.log("Socket ID", Socket.id, "Disconnected From Game Play");
        }
        else{
          //console.log("********************************** In Socket Disconnect : Some ID not found **********************************");
        }
      }
      else{
        //console.log("********************************** In Socket Disconnect : myData not found **********************************");
      }
    });

    /* Socket.on("PushOpenDeck",async function(data,responce) {
      console.log("PushOpenDeck  Called :",data);
      responce(await Sys.Game.Reguler.Texas.Controllers.RoomController.pushOpenDeck(Socket,data));
    });

    Socket.on("PopOpenDeck",async function(data,responce) {
      console.log("PopOpenDeck  Called :",data);
      responce(await Sys.Game.Reguler.Texas.Controllers.RoomController.popOpenDeck(Socket,data));
    });

    Socket.on("PopCloseDeck",async function(data,responce) {
      console.log("JoinRoom  Called :",data);
      responce(await Sys.Game.Reguler.Texas.Controllers.RoomController.popCloseDeck(Socket,data));
    });

    Socket.on("PlayerDrop",async function(data,responce) {
      console.log("PlayerDrop  Called :",data);
      responce(await Sys.Game.Reguler.Texas.Controllers.RoomController.playerDrop(Socket,data));
    });

    Socket.on("PlayerCardsScore",async function(data,responce) {
      console.log("PlayerCardsScore  Called :");
      responce(await Sys.Game.Reguler.Texas.Controllers.RoomController.playerCardsScore(Socket,data));
    });

    Socket.on("FinishGame",async function(data,responce) {
      console.log("FinishGame  Called :",data);
      responce(await Sys.Game.Reguler.Texas.Controllers.RoomController.declarefinishGame(Socket,data));
    });

    Socket.on("DeclareGame",async function(data,responce) {
      console.log("DeclareGame  Called :",data);
      responce(await Sys.Game.Reguler.Texas.Controllers.RoomController.declareGame(Socket,data));
    }); */
  }
  catch (e) {
    console.log("Error in Cash Game Socket Handler : ", e);
  }

}

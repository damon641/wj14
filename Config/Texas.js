module.exports = {
   RackPercent:2,
    RoomExpireHours:1,
    RoomExpireHoursCheckCronRepeatTime : 60000,

    waitAfterRoundComplete: 1000,  // 2000
    waitAfterGameReset:1000,
    waitBeforeGameReset:1000, // 4000
    Regular:20000,
    Fast:10000,
    waitBeforeGameStart: 2000, //second 3000

    // Setting Default
    turnTime : 10,
   
    // Turn Action
    SmallBlind : 0,
    BigBlind : 1,
    Check : 2,
    Bet : 3,
    Call : 4,
    Fold : 6,
    AllIn: 8,



    RegularTimer : 20,
    waitBeforeCardDistribut : 1, // Second 2

    // Tournament
    regulaerBreakStartIn : 60,

    // Speed of Turn
    
    turbo : 30,
    hyper_turbo : 10,


    fast : 15, //8
    regular : 30, //60
    slow : 45, //60 

    // oldPlayerLeftTime

    oldPlayerLeftTimeInMin : 30,

    gameURL : "https://pokerscript.net/webgl",     //  http://pokerscript.net/
    adminURL : "https://pokerscript.net/",   //  http://pokerscript.net/
    loginRedirectUrl: "https://pokerscript.net/"  // for local and staging
}

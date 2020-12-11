module.exports = {
    details: {
        name: 'Byte Poker'
    },
    maxPlayers: 9,
    logger: {
        logFolder: 'Log', // Change Your Name With Your Custom Folder
        logFilePrefix: 'game'
    },
    defaultUserLogin: {
        name: 'Byte Poker',
        email: 'admin@pokerscript.net',
        password: '123456',
        role: 'admin',
        avatar: 'user.png'
    },
    mailer: {
        auth: {
            user: 'admin@pokerscript.net',
            pass: 'BYTE@#!@#$!@SW',
        },
        defaultFromAddress: 'Byte Poker <admin@pokerscript.net>'
    },
}
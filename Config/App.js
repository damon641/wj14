module.exports = {
    details: {
        name: 'White Poker'
    },
    maxPlayers: 9,
    logger: {
        logFolder: 'Log', // Change Your Name With Your Custom Folder
        logFilePrefix: 'game'
    },
    defaultUserLogin: {
        name: 'White Poker',
        email: 'admin@pokerscript.net',
        password: '123456',
        role: 'admin',
        admin_type: 'admin',
        avatar: 'user.png'
    },
    mailer: {
        auth: {
            user: 'admin@pokerscript.net',
            pass: 'BYTE@#!@#$!@SW',
        },
        defaultFromAddress: 'White Poker <admin@pokerscript.net>'
    },
}
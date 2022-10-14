const { XrplClient } = require('xrpl-client')
const debug = require('debug')
const messagebird = require('messagebird')(process.env.YOUR-API-KEY)
const dotenv = require('dotenv')
const log = debug('deadman:main')
const client = new XrplClient([process.env.VALIDATOR-ADMIN-WEBSOCKET])

const isConnected = (async () => {
    const state = await client.getState()
    const server_info = await client.send({"id": 1, "command": "server_info"})
    if (state == null || state.online == false) {
        return true
    }
    
    if (server_info.info.peers < process.env.PEER-MIN-LIMIT) {
        return true
    }

    // check a book on the DEX>
    const asks_books = {
        'id': 2,
        'command': 'book_offers',
        'taker': 'rThREeXrp54XTQueDowPV1RxmkEAGUmg8',
        'taker_gets': {'currency': 'USD', 'issuer': 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B' },
        'taker_pays': {'currency': 'XRP' }
    }
    const book_result = await client.send(asks_books)

    if ('error' in book_result) {
        // this usually traps the limited connection error when a node does not have enough connection
        return true
    }

    // we are fine and connected
    return false    
})

export default (async () => {
    dotenv.config()
    const result = isConnected()
    if (!result) {
        messagebird.messages.create({
            originator : process.env.ORIGINATOR,
            recipients : [process.env.RECIPIANTS],
            body : 'PINEAPPLE PIZZA, your validator is down!'
        })
    }   
})()
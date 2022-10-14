const { XrplClient } = require('xrpl-client')
const debug = require('debug')
const messagebird = require('messagebird')(process.env.YOUR_API_KEY)
const dotenv = require('dotenv')
const log = debug('deadman:main')

class deadman {
	constructor() {
        Object.assign(this, {
            run() {
                dotenv.config()
                let last_sent = 0
                const self = this
                setTimeout(async () => {
                    if (last_sent + (process.env.RESEND_TEXT * 1000) > new Date().getTime()) { return }
            
                    const result = await self.isConnected()
                    log('is connected:', result)
                    if (!result) {
                        last_sent =  new Date().getTime()
                        messagebird.messages.create({
                            originator : process.env.ORIGINATOR,
                            recipients : [process.env.RECIPIANTS],
                            body : 'PINEAPPLE PIZZA, your validator is down!'
                        }, function (err, response) {
                            if (err) {
                               log('ERROR:', err)
                           } else {
                               log('PINEAPPLE HEAD GOT MESSAGE:', response)
                           }
                        })
                    }   
                }, 10000)
            },
            async isConnected() {
                log('checking connection')
                const client = new XrplClient(process.env.VALIDATOR_ADMIN_WEBSOCKET)
                
                const server_info = await client.send({id: 1, command: 'server_info'})

                if (server_info.info.server_state != process.env.REQUIRED_STATE) {
                    log('not ' + process.env.REQUIRED_STATE, server_info.info.server_state)
                    return false
                }

                if (server_info.info.peers < process.env.PEER_MIN_LIMIT) {
                    log('to few peers')
                    return false
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
                    log('query result error', error)
                    return false
                }
            
                // we are fine and connected
                return true    
            }
        })
    }
}

const main = new deadman()
main.run()
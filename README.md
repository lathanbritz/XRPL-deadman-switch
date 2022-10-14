# XRPL-deadman-switch

Sends a text message to your mobile when your validator goes walk abouts (off line)

1. clone repo onto validator
2. run `yarn`
3. create an account at https://www.messagebird.com/en/ add some $$
4. copy env.sample to .env and adjust as needed with your details
5. run `./run.sh` if you have PM2 installed else `yarn prod`
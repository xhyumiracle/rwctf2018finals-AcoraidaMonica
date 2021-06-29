#!/bin/sh

DATA_DIR=/root/gethdata/
GENESIS_NAME=/root/genesis.json
LOG_DIR=/root/logs/

cd /root

# Launch chain

echo '[*] creating log dir'
mkdir -p $LOG_DIR

echo '[*] setting up geth with genesis.json'
geth --datadir $DATA_DIR init $GENESIS_NAME

nohup geth --datadir $DATA_DIR --identity "rwctf" --nodiscover --ws --rpc --rpcaddr "0.0.0.0" --rpccorsdomain "*" --rpcapi "net,web3,eth,personal,debug"  --mine --nat "any" --unlock "0,1" --password kspwd --etherbase 0x7fa054c962bb832e5cbc493a4d293b262a3f597d  &

# Launch solidity source code server

cd /root/src_server
nohup python3 src_server.py &

# Start deployment

echo '[*] Waiting geth start for 5s ...'
sleep 5

cd /root
node deploy.js 8545 $LOG_DIR
node watching.js 8545 $LOG_DIR

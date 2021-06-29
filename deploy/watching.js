let fs = require("fs");
let Web3 = require('web3');
let web3 = new Web3();
let sleep = require('sleep').sleep;
let keythereum = require('keythereum');

log_dir = process.argv[3]
var stream = fs.createWriteStream(log_dir+"watching.log", {flags:'a'});
var hassent=false

// web3@0.20.7
web3.setProvider(new web3.providers.HttpProvider('http://localhost:'+process.argv[2]));

adminAddr = '0x492705c00090cb7c1cbb5ec3ab0b09f310dec399'
adminPwd = 'realworldfinalcominghhh'
function setDefaultAccountUnlock(){
    log("Unlocking ", adminAddr);
    web3.eth.defaultAccount = adminAddr;
    try {
        web3.personal.unlockAccount(web3.eth.defaultAccount, adminPwd);
    } catch(e) {
        log(e)
        return;
    }
}

function sendFlagTo(){
    if (hassent) return;
    playerBalance=web3.eth.getBalance(playerAddr).toNumber();
    tcBalance=web3.eth.getBalance(targetContractAddr).toNumber();

    if(tcBalance == 0 && playerBalance >= targetBalance){
        log('targets achieve!');
        let flag = fs.readFileSync("flag.txt");
    	setDefaultAccountUnlock()
    	log('sending flag!');
    	flagdata = '0x'+Buffer.from(flag.toString().trim(), 'utf8').toString('hex');
    	txhs = web3.eth.sendTransaction({from: web3.eth.defaultAccount, to:playerAddr, value: 10, gasLimit: 21000, gasPrice: 20000000000, data: flagdata})
    	log('flag tx hash:' + txhs);
        hassent=true
    }
    //return txhs;
}

//importAccount()
setDefaultAccountUnlock();

function watchBalance(playerAddr, targetContractAddr, targetBalance){
    log('watching balances, target:')
    log('player '+ playerAddr+ 'should >= 1e24 wei');
    log('target '+ targetContractAddr+ 'should == 0 wei');
    setInterval(sendFlagTo, 500)
}
function log(str){
    stream.write(str + "\n");
    stream.uncork();
    console.log(str);
}

if(process.argv.length != 4){
    console.log('Usage: node watching.js <rpc port> <log dir>');
}

playerAddr='0x19baa751d1092c906ac84ea4681fa91e269e6cb9';
targetContractAddr = '0xa9e63a4487f06aa51c2f815b4807b80b64363594';
targetBalance = 1e24;
watchBalance(playerAddr, targetContractAddr, targetBalance);
//stream.end();

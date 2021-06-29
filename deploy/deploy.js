let fs = require("fs");
let Web3 = require('web3');
let web3 = new Web3();
let keythereum = require('keythereum');
let sleep = require('sleep').sleep;

// web3@0.20.7
web3.setProvider(new web3.providers.HttpProvider('http://localhost:'+process.argv[2]));

/*
function setDefaultAccountUnlock(){
    log("Unlocking admin account");
    var adminAddr = keythereum.privateKeyToAddress(privk);
    try {
        web3.personal.unlockAccount(web3.eth.defaultAccount, password);
    } catch(e) {
        log(e)
        return;
    }
}
*/

/*
 * contractsFilename: the .sol/.json filename without extension
 */
function getContractAbiCode(contractsFilename, contractName){
    let source = fs.readFileSync(contractsFilename+'.json');
    let contracts = JSON.parse(source)["contracts"];

    let abi = JSON.parse(contracts[contractsFilename+'.sol:'+contractName]['abi']);
    let code = '0x' + contracts[contractsFilename+'.sol:'+contractName]['bin'];

    return [abi, code];
}
/*
 * abi: [{"inputs": [], "payable": false...}, {...}, ...]
 * code: "0x1234..."
 */
function deploy_raw(abi, code, _gas, _wei, ...args){
    let c = web3.eth.contract(abi);
    log("Deploying the contract");
    let contract = c.new(...args, {from: web3.eth.defaultAccount, gas: _gas, data: code, value: _wei});
    log("The contract is being deployed in transaction " + contract.transactionHash);
    return contract;
}
function deploy(contractsFilename, contractName, _gas, _wei, ...args){
    var rst = getContractAbiCode(contractsFilename, contractName);
    var abi = rst[0];
    var code = rst[1];
    contract = deploy_raw(abi, code, _gas, _wei, ...args);
    return contract;
}

/*function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}*/

function sendFlagTo(contract){
    let flag = fs.readFileSync("flag.txt");
    log('unlocking account');
    setDefaultAccountUnlock()
    log('sending flag!');
    contract.publishMessage(flag.toString().trim());
}


// We need to wait until any miner has included the transaction
// in a block to get the address of the contract
function waitGetContractAddr(contract, cName) {
  while (true) {
    let receipt = web3.eth.getTransactionReceipt(contract.transactionHash);
    if (receipt && receipt.contractAddress) {
      log(cName + " has been deployed at " + receipt.contractAddress);
      return receipt.contractAddress;
    }
    log("Waiting a mined block to include "+cName+"... currently in block " + web3.eth.blockNumber);
    sleep(3);
  }
}

function waitTxMined(txhs) {
  while (true) {
    let receipt = web3.eth.getTransactionReceipt(txhs);
    if (receipt) {
      log("The tx has been mined!");
      return receipt;
    }
    log("Waiting a mined block to include the tx... currently in block " + web3.eth.blockNumber);
    sleep(3);
  }
}

function getContractInstance(contractsFilename, contractName, contractAddr){
    return web3.eth.contract(getContractAbiCode(contractsFilename, contractName)[0]).at(contractAddr);
}

function log(str){
    /*
    fs.appendFile(log_dir+"deploy.log", str+'\n', function(err) {
        if(err) {
            return console.log(err);
        }
    });
    */
    stream.write(str + "\n");
    console.log(str);
}

if(process.argv.length != 4){
    console.log('Usage: node deploy.js <rpc port> <log dir>');
}

log_dir = process.argv[3]
var stream = fs.createWriteStream(log_dir+"deploy.log", {flags:'a'});

/* set default account */
web3.eth.defaultAccount = '0x492705c00090cb7c1cbb5ec3ab0b09f310dec399';

argument = '0x5b633ccfd60b61262a556109c4610171f36080604052600436106100985763ffffffff7c0100000000000000000000000000000000000000000000000000000000600035041663281ba0a8811461009a5780633fad9ae01461012457806346a3ec671461013957806354fd4d50146101855780637284e416146101ac578063aa332032146101c1578063c76de3e91461020f578063f24ccbfe14610299578063f7ff68a3146102d7575b005b3480156100a657600080fd5b506100af6102ec565b6040805160208082528351818301528351919283929083019185019080838360005b838110156100e95781810151838201526020016100d1565b50505050905090810190601f1680156101165780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34801561013057600080fd5b506100af61034c565b6040805160206004803580820135601f81018490048402850184019095528484526100989436949293602493928401919081908401838280828437509497506103da9650505050505050565b34801561019157600080fd5b5061019a61053b565b60408051918252519081900360200190f35b3480156101b857600080fd5b506100af610541565b6040805160206004803580820135601f8101849004840285018401909552848452610098943694929360249392840191908190840183828082843750949750509335945061059b9350505050565b6040805160206004803580820135601f810184900484028501840190955284845261009894369492936024939284019190819084018382808284375050604080516020601f89358b018035918201839004830284018301909452808352979a9998810197919650918201945092508291508401838280828437509497506108139650505050505050565b3480156102a557600080fd5b506102ae6108ae565b6040805173ffffffffffffffffffffffffffffffffffffffff9092168252519081900360200190f35b3480156102e357600080fd5b506100af6108c6565b606060405190810160405280603081526020017f242a2126235e5b602061402e333b5461262a54602052603c607e355a605e355681526020017f20596f752062656174206d6521203a440000000000000000000000000000000081525081565b6003805460408051602060026001851615610100026000190190941693909304601f810184900484028201840190925281815292918301828280156103d25780601f106103a7576101008083540402835291602001916103d2565b820191906000526020600020905b8154815290600101906020018083116103b557829003601f168201915b505050505081565b33803b9081156103e957600080fd5b826040518082805190602001908083835b602083106104195780518252601f1990920191602091820191016103fa565b5181516020939093036101000a60001901801990911692169190911790526040519201829003909120600454149250508115905061045f5750670de0b6b3a76400003410155b15610536576002805473ffffffffffffffffffffffffffffffffffffffff1916339081179091556104b13660a01415815761402e61049d3361ffff16565b5101561580156104b1563d6000803e3d6000fd5b50604080517f0900f0100000000000000000000000000000000000000000000000000000000081523360048201529051735e351bd4247f0526359fb22078ba725a192872f391630900f01091602480830192600092919082900301818387803b15801561051d57600080fd5b505af1158015610531573d6000803e3d6000fd5b505050505b505050565b60005481565b60018054604080516020600284861615610100026000190190941693909304601f810184900484028201840190925281815292918301828280156103d25780601f106103a7576101008083540402835291602001916103d2565b60025473ffffffffffffffffffffffffffffffffffffffff16331480156105ca57506706f05b59d3b200003410155b1561080f5760408051606081018252603080825256242a2126235e5b602061402e333b5461262a54602052603c607e355a605e3556602083019081527f20596f752062656174206d6521203a4400000000000000000000000000000000838501529251919282918083835b602083106106545780518252601f199092019160209182019101610635565b5181516020939093036101000a60001901801990911692169190911790526040519201829003909120841415925061068e91505057600080fd5b81516106a19060039060208501906108fd565b5060048181556040517ff19524730000000000000000000000000000000000000000000000000000000081526020918101828152845160248301528451735e351bd4247f0526359fb22078ba725a192872f39363f195247393879392839260449092019185019080838360005b8381101561072657818101518382015260200161070e565b50505050905090810190601f1680156107535780820380516001836020036101000a031916815260200191505b5092505050600060405180830381600087803b15801561077257600080fd5b505af1158015610786573d6000803e3d6000fd5b5050604080517f679e1149000000000000000000000000000000000000000000000000000000008152600481018590529051735e351bd4247f0526359fb22078ba725a192872f3935063679e11499250602480830192600092919082900301818387803b1580156107f657600080fd5b505af115801561080a573d6000803e3d6000fd5b505050505b5050565b600454151561080f57806040518082805190602001908083835b6020831061084c5780518252601f19909201916020918201910161082d565b51815160209384036101000a600019018019909216911617905260405191909301819003902060045550845161088a935060039250908501906108fd565b506002805473ffffffffffffffffffffffffffffffffffffffff1916331790555050565b735e351bd4247f0526359fb22078ba725a192872f381565b60408051808201909152601781527f57686f2069732041636f7261696461204d6f6e6963613f000000000000000000602082015281565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061093e57805160ff191683800117855561096b565b8280016001018555821561096b579182015b8281111561096b578251825591602001919060010190610950565b5061097792915061097b565b5090565b61099591905b808211156109775760008155600101610981565b905600a165627a7a723058205bf450560abe05048d3aecd129bb6420ca5acbef2f19c0ef9dca3f158d49e23f0029'

/*contracts file name*/
let cfn='AcoraidaMonicaGameContracts';

/* set up logger and logger agent */
_LADepTx = deploy(cfn, 'LoggerAgent', 3000000, 0);
_LoggerDepTx = deploy(cfn, 'Logger', 3000000, 0);
_AMGameDepTx = deploy(cfn, 'AcoraidaMonicaGame', 3000000, 0, argument);

LAAddr = waitGetContractAddr(_LADepTx, 'loggerAgent');
LoggerAddr = waitGetContractAddr(_LoggerDepTx, 'Logger');
log(LAAddr);
log('should be 5e351bd4247f0526359fb22078ba725a192872f3');

LA = getContractInstance(cfn, 'LoggerAgent', LAAddr);
LA.upgrade(LoggerAddr);

/* make sure AMGame gets mined */
AMGameAddr = waitGetContractAddr(_AMGameDepTx, 'AMGame');
AMGame = getContractInstance(cfn, 'AcoraidaMonicaGame', AMGameAddr)

/* create a, and call AMGame.Start internally */
_aDepTx = deploy(cfn, 'a', 5000000, 0, AMGameAddr, "In Madagascar, you cannot take a picture of a lemur with gray hair. Why?", "r");
/* make sure a gets mined and called Start */
aAddr = waitGetContractAddr(_aDepTx, 'a');

//txhs = AMGame.Start("q","No way, I wan't tell you.'", {from: web3.eth.defaultAccount, to:AMGameAddr, value: web3.toWei(1000000, 'ether'), gasLimit: 21000, gasPrice: 20000000000});
txhs = AMGame.Start("In Madagascar, you cannot take a picture of a lemur with gray hair. Why?","You need a camera instead of gray hair.", {from: web3.eth.defaultAccount, to:AMGameAddr, value: web3.toWei(1000000, 'ether'), gasLimit: 21000, gasPrice: 20000000000});
/* make sure Start get called */
waitTxMined(txhs);

log('locking account');
web3.personal.lockAccount('0x492705c00090cb7c1cbb5ec3ab0b09f310dec399');

//log('waiting for transfer event...');
//watchTransferEvent(wallet, token);

res = AMGame.question();
log(res);

//txhs = web3.eth.sendTransaction({from: web3.eth.defaultAccount, to:AMGameAddr, value: web3.toWei(0.1234, 'ether'), gasLimit: 21000, gasPrice: 20000000000})
//log(txhs);
//log('----------');
//log(waitTxMined(txhs));

amBalance = web3.eth.getBalance(AMGameAddr).toNumber();
log('Deployment finished.');
log('AMGame addr: '+AMGameAddr)
log('Logger addr: '+LoggerAddr)
log('LA addr: '+LAAddr)
log('a addr: '+aAddr)
log('AMGame init balance: '+ amBalance);
stream.end();

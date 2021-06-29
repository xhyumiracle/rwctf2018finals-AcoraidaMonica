RealWorldCTF 2018 Finals - AcoraidaMonica
-----------------------

### Challenge
#### Background:

"I exhausted all the words, couldn't describe her beauty", so many handsome charming men say that.
That girl is Acoraida Monica. Her cute comes from her intelligence. She only admires who are smarter than her.
So she designed this Q&A game and delegate someone to pushlish it on an Ethereum chain.   Anyone who solves her puzzle could win 1000000 ETH and ... maybe her heart. :P

#### Description:

1. Web3 http provider to access the private chain (geth): http://<ip>:8090
2. Target contract address: 0xa9e63a4487f06aa51c2f815b4807b80b64363594
3. Player account: 0x19baa751d1092c906ac84ea4681fa91e269e6cb9
4. Query the source code of a sepecific contract address: http://<ip>:8091/<THE CONTRACT ADDRESS>
   example: curl http://0.0.0.0:8091/0x5e351bd4247f0526359fb22078ba725a192872f3

#### Goal:

Drain the target contract, transfer ALL the ETH to your account, specifically:
1. The balance of 0x19baa7...6cb9 should become at least 1e24 wei (=1000000 eth)
2. The balance of 0xa9e63a...3594 should become 0.
3. If these two conditions achieved, the admin account will send the hex format flag inside a transaction input, which is from 0x492705c00090cb7c1cbb5ec3ab0b09f310dec399 to 0x19baa751d1092c906ac84ea4681fa91e269e6cb9.

### Deployment
**Build/Pull**
```
$ git clone https://github.com/xhyumiracle/rwctf2018finals-AcoraidaMonica.git
$ cd deploy
$ docker build -t xhyumiracle/rw18-amg .
```
or
```
$ docker pull xhyumiracle/rw18-amg
```
**Run**
```
$ docker run -d --rm -p 0.0.0.0:8090:8545 -p 0.0.0.0:8091:8091 --name=amg -e TERM=xterm xhyumiracle/rw18-amg
```
### Info
1. genesis.json, player-privkey.txt, AcoraidaMonicaGame.sol (the target contract) are provided.
2. Don't scan port 8090, 8091, there's no other api.
3. Don't scan ports, there's no other open ports related to this challenge.

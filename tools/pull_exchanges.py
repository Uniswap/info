#
# This script loads a logs json (outputted from crawl_exchange_logs.py) and pulls all the tokens details for each one.
# Outputs to exchange.json
#

from web3 import Web3

import json
import os
import sys

if (len(sys.argv) < 2):
    print("Expected 1 arg! [infura_project_id]");
    sys.exit()

infura_project_id = sys.argv[1];    

#DAI, MKR specify Symbol as bytes32 and not a string and this blows up the symbol call
DSTOKEN_ABI = json.loads('[{"name":"name","inputs":[],"type":"function","constant":true,"outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view"},{"name":"stop","outputs":[],"inputs":[],"constant":false,"payable":false,"type":"function","stateMutability":"nonpayable"},{"name":"approve","outputs":[{"type":"bool","name":""}],"inputs":[{"name":"guy","type":"address"},{"name":"wad","type":"uint256"}],"constant":false,"payable":false,"type":"function","stateMutability":"nonpayable"},{"name":"setOwner","outputs":[],"inputs":[{"name":"owner_","type":"address"}],"constant":false,"payable":false,"type":"function","stateMutability":"nonpayable"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function","stateMutability":"view"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function","stateMutability":"nonpayable"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function","stateMutability":"view"},{"constant":false,"inputs":[{"name":"guy","type":"address"},{"name":"wad","type":"uint256"}],"name":"mint","outputs":[],"payable":false,"type":"function","stateMutability":"nonpayable"},{"constant":false,"inputs":[{"name":"wad","type":"uint256"}],"name":"burn","outputs":[],"payable":false,"type":"function","stateMutability":"nonpayable"},{"constant":false,"inputs":[{"name":"name_","type":"bytes32"}],"name":"setName","outputs":[],"payable":false,"type":"function","stateMutability":"nonpayable"},{"constant":true,"inputs":[{"name":"src","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function","stateMutability":"view"},{"inputs":[],"type":"function","constant":true,"name":"stopped","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view"},{"payable":false,"type":"function","constant":false,"inputs":[{"name":"authority_","type":"address"}],"name":"setAuthority","outputs":[],"stateMutability":"nonpayable"},{"inputs":[],"name":"owner","type":"function","constant":true,"outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view"},{"inputs":[],"name":"symbol","type":"function","constant":true,"outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view"},{"constant":false,"inputs":[{"name":"guy","type":"address"},{"name":"wad","type":"uint256"}],"name":"burn","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"wad","type":"uint256"}],"name":"mint","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"push","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"move","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"start","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"authority","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"guy","type":"address"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"src","type":"address"},{"name":"guy","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"wad","type":"uint256"}],"name":"pull","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"symbol_","type":"bytes32"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"guy","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"guy","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"authority","type":"address"}],"name":"LogSetAuthority","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"}],"name":"LogSetOwner","type":"event"},{"anonymous":true,"inputs":[{"indexed":true,"name":"sig","type":"bytes4"},{"indexed":true,"name":"guy","type":"address"},{"indexed":true,"name":"foo","type":"bytes32"},{"indexed":true,"name":"bar","type":"bytes32"},{"indexed":false,"name":"wad","type":"uint256"},{"indexed":false,"name":"fax","type":"bytes"}],"name":"LogNote","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"guy","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Transfer","type":"event"}]') 
ERC20_ABI = json.loads('[{"name":"name","outputs":[{"name":"","type":"string"}],"inputs":[],"constant":true,"payable":false,"type":"function","stateMutability":"view"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}]') 

INPUT_PROVIDER = 'https://mainnet.infura.io/v3/' + infura_project_id;

fname = "./logs.json"

w3 = Web3(Web3.HTTPProvider(INPUT_PROVIDER))

raw_exchanges = {}
sorted_exchanges = {} #python 3.7 preserves key insertion order into objects

print("Pulling exchange details...");

with open(fname) as json_file:  
	data = json.load(json_file)
	for p in data['result']:
		token = Web3.toChecksumAddress(p['topics'][1].replace("0x000000000000000000000000", "0x"));
		
		exchange = p['topics'][2].replace("0x000000000000000000000000", "0x")

		erc20 = w3.eth.contract(address=token, abi=ERC20_ABI)

		print("pulling e=" + exchange + ", t=" + token);

		try :
			decimals = erc20.functions.decimals().call();
		except Exception as e:
			try:
				erc20 = w3.eth.contract(address=token, abi=DSTOKEN_ABI)
				decimals = erc20.functions.decimals().call();
			except Exception:
				print("Could not read exchange, skipping e=" + exchange + ", t=" + token);
				continue;		

		try:
			symbol = erc20.functions.symbol().call();
		except OverflowError:
			#print("Overflow... trying DSToken ABI");
			
			#some tokens specify their symbol as bytes32 instead of string
			erc20 = w3.eth.contract(address=token, abi=DSTOKEN_ABI)
			
			symbol = erc20.functions.symbol().call();
			symbol = symbol.hex().rstrip("0")

			if (len(symbol) % 2 != 0):
				symbol = symbol + '0'
			symbol = bytes.fromhex(symbol).decode('utf8')
				
		# print(str(token) + "\n" + str(exchange) + "\n" + str(symbol) + "\n" + str(decimals));
		
		raw_exchanges[symbol] = {
			"address" : exchange,
			"tokenAddress" : token,
			"decimals" : decimals
		}

print() #newline

# sort the keys
sorted_key_list = sorted(raw_exchanges.keys())

# build the sorted exchange list
for key in sorted_key_list:
	sorted_exchanges[key] = raw_exchanges[key];

# delete previous exchanges file if exists
fname = 'exchanges.json'
if (os.path.exists(fname)):
	os.remove(fname);

with open(fname, 'a') as the_file:
	the_file.write(json.dumps(sorted_exchanges))

print("wrote exchanges to " + fname)
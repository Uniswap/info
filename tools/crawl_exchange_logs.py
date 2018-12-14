#
# This script crawls all the event logs for the Uniswap factory and outputs them to a json file.
#
from web3 import Web3

import json
import requests
import os
import sys

if (len(sys.argv) < 3):
    print("Expected 2 args! [blockNumber, infura_project_id]");
    sys.exit()

# grab the input parameters
blockNumber = int(sys.argv[1]);
infura_project_id = sys.argv[2];

factory_address = "0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95"

params = [
    {
        "fromBlock": hex(blockNumber),
        "address" : factory_address
    }
]

# setup the payload
payload = {
    "jsonrpc" : "2.0",
    "method" : "eth_getLogs",
    "params" : params,
    "id" : 1
}

# setup the headers
headers = {"Content-Type": "application/json", "Accept": "application/json"}

url = "https://mainnet.infura.io/v3/" + infura_project_id;

# make the request
r = requests.post(url, data=json.dumps(payload), headers=headers);

# delete previous logs if found
fname = 'logs.json'
if (os.path.exists(fname)):
    os.remove(fname);

# write new logs file
with open(fname, 'a') as the_file:
    the_file.write(r.text);

print("wrote logs to " + fname)    
// Getting transaction information from an address
// on the BitcoinSV network

var bsv = require('bsv');
var axios = require('axios');

// Where you're sending bitcoin from
var publicAddress = '198bzKiboq4raWDAHH79xTFFeb8DtTNjr3';
var privateKeyString = 'L1qWzD5XX8GxUnxJchqm2wfqHXyQi3L9nwg8S62Be61ZA37oHMPV';

var privateKey = bsv.PrivateKey.fromWIF(privateKeyString);

// Where you're sending bitcoin to
// Replace this with another public address you generate,
// or from an existing wallet
var newAddress = '1EAFnrnVeDUbETjfshAAGd91kdMAkX6QaN';

// Create a UTXO object based on an existing bitcoin UTXO (unspent transaction)
// Replace this .json object with yours
// You can get this data from whatsonchain. Just put the address and get the data
var utxo = new bsv.Transaction.UnspentOutput({
  address: '198bzKiboq4raWDAHH79xTFFeb8DtTNjr3',
  txid: 'd6f1fe7ea394571f0cabc57ffbcc429d7be0bcab8e120ffeb3b27470e824a64d',
  vout: 1,
  amount: 0.00051226,
  satoshis: 51226,
  value: 51226,
  height: 757998,
  confirmations: 1,
  scriptPubKey: '76a91459311ff1d1a2af9e3aefb09cae44a8c6a32d8d3888ac',
  script: '76a91459311ff1d1a2af9e3aefb09cae44a8c6a32d8d3888ac',
  outputIndex: 0,
});

// Set the amount of Satoshis to be sent to the new address
// The amount of Satoshis is based on the `satoshis` in the object above
var transaction = new bsv.Transaction()
  .from([utxo])
  .to(newAddress, 51226)
  .change(publicAddress)
  .sign(privateKey);
// Set the fee to at least 546 Satoshis (minimum amount)
// if (transaction.getFee() < 546) {
//   transaction.fee(546);
// }

// turn this Transaction into a hex
var hash = transaction.serialize();

function resolve(result) {
  console.log('====> RESULT', result);
}
function reject(result) {
  console.log('====> REJECTION', result);
}

// Sends, or "Broadcasts" the data
function send(tx) {
  const txhash = tx.serialize();
  const url = 'https://api.whatsonchain.com/v1/bsv/main/tx/raw';
  const headers = { 'Content-Type': 'application/json' };
  const data = { txhex: txhash };
  const opts = {
    method: 'POST',
    url: url,
    headers,
    data: JSON.stringify(data),
  };

  return new Promise(function (resolve, reject) {
    axios(opts)
      .then((r) => {
        if (r.status !== 200) {
          console.log('REJECTING', r, r.status);
          reject('error while retrieving response from server ' + r.status);
        } else {
          console.log('=======>', r);
          console.log('=======> Transaction ID', r.data);
          resolve(r);
        }
      })
      .catch(reject);
  });
}

var submission = send(transaction); // will return a javascript Promise

// Get a Transaction ID for your latest, posted bitcoin Transaction
// You'll see something like this in the Terminal:
// =======> Transaction ID 9967bc109e0b58b825789512f30ea2b976579775ce003e811b4b607b9ae36403




const etherscanKey = "6ZEJRJXFY8NFS8PT9UTKCDZRJ3ZPZJ51KT"



export async function getBlockFromTimestamp(unixTimestamp) {
    const etherscanBlockApi = `https://api.etherscan.io/api?module=block&action=getblocknobytime&timestamp=${unixTimestamp}&closest=before&apikey=${etherscanKey}`
    const response = await fetch(etherscanBlockApi)
    const data = response.json()
    return data.result

}
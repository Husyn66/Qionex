document.getElementById("addMetaMask").onclick = async () => {
  try {
    const wasAdded = await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4',
          symbol: 'QNX',
          decimals: 18,
          image: 'https://qionex.com/assets/qionex-logo.png',
        },
      },
    });
    if (wasAdded) {
      alert('QNX successfully added to MetaMask!');
    }
  } catch (error) {
    console.error(error);
  }
};

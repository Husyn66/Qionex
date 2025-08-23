// Конфигурация токена
const TOKEN_CONFIG = {
  address: '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4',
  symbol: 'QNX',
  decimals: 18,
  image: 'https://husyn66.github.io/Qionex/assets/qionex-logo.png'
};

// Функция для проверки наличия MetaMask
function isMetaMaskInstalled() {
  return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
}

// Функция для добавления токена в MetaMask
async function addTokenToMetaMask() {
  // Проверяем, установлен ли MetaMask
  if (!isMetaMaskInstalled()) {
    alert('MetaMask не установлен! Пожалуйста, установите MetaMask расширение.');
    window.open('https://metamask.io/download/', '_blank');
    return;
  }

  const button = document.getElementById("addMetaMask");
  
  try {
    // Отключаем кнопку во время выполнения
    button.disabled = true;
    button.textContent = 'Добавление...';
    
    // Запрашиваем добавление токена
    const wasAdded = await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: TOKEN_CONFIG.address,
          symbol: TOKEN_CONFIG.symbol,
          decimals: TOKEN_CONFIG.decimals,
          image: TOKEN_CONFIG.image
        },
      },
    });

    if (wasAdded) {
      // Успешно добавлен
      alert(`Токен ${TOKEN_CONFIG.symbol} успешно добавлен в MetaMask!`);
      button.textContent = '✓ Добавлен в MetaMask';
      button.style.background = 'linear-gradient(45deg, #28a745, #34ce57)';
      
      // Сохраняем статус в localStorage
      localStorage.setItem('qnx_token_added', 'true');
      
    } else {
      // Пользователь отклонил добавление
      alert('Добавление токена было отменено.');
      button.textContent = 'Добавить в MetaMask';
    }
    
  } catch (error) {
    console.error('Ошибка при добавлении токена:', error);
    
    // Обработка различных типов ошибок
    let errorMessage = 'Произошла ошибка при добавлении токена.';
    
    if (error.code === 4001) {
      errorMessage = 'Вы отменили добавление токена.';
    } else if (error.code === -32602) {
      errorMessage = 'Неверные параметры токена.';
    } else if (error.message) {
      errorMessage = `Ошибка: ${error.message}`;
    }
    
    alert(errorMessage);
    button.textContent = 'Добавить в MetaMask';
    
  } finally {
    // Включаем кнопку обратно
    button.disabled = false;
  }
}

// Функция для проверки подключения к MetaMask
async function checkMetaMaskConnection() {
  if (!isMetaMaskInstalled()) return false;
  
  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts.length > 0;
  } catch (error) {
    console.error('Ошибка при проверке подключения:', error);
    return false;
  }
}

// Функция для подключения к MetaMask
async function connectMetaMask() {
  if (!isMetaMaskInstalled()) {
    alert('MetaMask не установлен!');
    return false;
  }
  
  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    return true;
  } catch (error) {
    console.error('Ошибка подключения к MetaMask:', error);
    return false;
  }
}

// Функция для обновления UI в зависимости от статуса
async function updateButtonStatus() {
  const button = document.getElementById("addMetaMask");
  if (!button) return;
  
  // Проверяем, был ли токен уже добавлен
  const tokenWasAdded = localStorage.getItem('qnx_token_added') === 'true';
  
  if (tokenWasAdded) {
    button.textContent = '✓ Добавлен в MetaMask';
    button.style.background = 'linear-gradient(45deg, #28a745, #34ce57)';
  }
  
  // Проверяем подключение к MetaMask
  const isConnected = await checkMetaMaskConnection();
  if (!isConnected && isMetaMaskInstalled()) {
    // Показываем кнопку подключения
    const connectButton = document.createElement('button');
    connectButton.textContent = 'Подключить MetaMask';
    connectButton.id = 'connectMetaMask';
    connectButton.className = button.className;
    connectButton.onclick = async () => {
      const connected = await connectMetaMask();
      if (connected) {
        connectButton.style.display = 'none';
        button.style.display = 'inline-block';
      }
    };
    
    button.parentNode.insertBefore(connectButton, button);
  }
}

// Обработчик события для кнопки добавления токена
document.addEventListener('DOMContentLoaded', () => {
  const addButton = document.getElementById("addMetaMask");
  
  if (addButton) {
    addButton.onclick = addTokenToMetaMask;
    
    // Обновляем статус кнопки при загрузке страницы
    updateButtonStatus();
  }
  
  // Слушаем изменения в MetaMask
  if (isMetaMaskInstalled()) {
    window.ethereum.on('accountsChanged', (accounts) => {
      console.log('Аккаунты изменились:', accounts);
      updateButtonStatus();
    });
    
    window.ethereum.on('chainChanged', (chainId) => {
      console.log('Сеть изменилась:', chainId);
      // Можно добавить проверку сети, если токен доступен только в определенной сети
    });
  }
});

// Экспортируем функции для использования в других частях приложения
window.MetaMaskUtils = {
  addTokenToMetaMask,
  checkMetaMaskConnection,
  connectMetaMask,
  isMetaMaskInstalled,
  TOKEN_CONFIG
};

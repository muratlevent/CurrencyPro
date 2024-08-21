import currencyData from './currency-data.json';

document.addEventListener("DOMContentLoaded", function() {
    const params = new URLSearchParams(window.location.search);
    let baseCurrency = params.get('base');
    let targetCurrency = params.get('target');
    const amountInput = document.getElementById('amount');
    const conversionResult = document.getElementById('conversion-result');
    const baseCurrencySpan = document.getElementById('base-currency');
    const targetCurrencySpan = document.getElementById('target-currency');
    const conversionTextSpan = document.getElementById('conversion-text');
    const refreshLink = document.getElementById('refresh');
    const swapButton = document.getElementById('swap');

    let lastFetchTime = new Date();
    let timer;

    const allCurrencies = JSON.parse(localStorage.getItem('allCurrencies')) || [];

    if (!baseCurrency || !targetCurrency) {
        conversionResult.textContent = 'Please select both base and target currencies.';
        return;
    }

    function getCurrencyEmoji(currencyCode) {
        return currencyData[currencyCode] || '';
    }

    function getCurrencyName(currencyCode) {
        const currency = allCurrencies.find(currency => currency[0] === currencyCode);
        return currency ? currency[1] : '';
    }

    baseCurrencySpan.innerHTML = `${getCurrencyEmoji(baseCurrency)} ${baseCurrency} - ${getCurrencyName(baseCurrency)}`;
    targetCurrencySpan.innerHTML = `${getCurrencyEmoji(targetCurrency)} ${targetCurrency} - ${getCurrencyName(targetCurrency)}`;

    function fetchExchangeRate() {
        const amount = parseFloat(amountInput.value);

        if (isNaN(amount) || amount <= 0) {
            conversionResult.textContent = `⚠️ Please enter a valid amount to convert.`;
            return;
        }

        fetch('./config.json')
            .then(response => response.json())
            .then(config => {
                fetch(`https://v6.exchangerate-api.com/v6/${config.apiKey}/pair/${baseCurrency}/${targetCurrency}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.result === 'success') {
                            const rate = data.conversion_rate;
                            const result = (amount * rate).toFixed(5);
                            const [integerPart, decimalPart] = result.split('.');
                            const firstTwoDecimals = decimalPart.slice(0, 2);
                            const remainingDecimals = decimalPart.slice(2);
                            conversionResult.innerHTML = `
                                <div class="base-result">${amount} ${baseCurrency} = </div>
                                <div class="target-result">
                                    ${integerPart},${firstTwoDecimals}<span class="fractional-part">${remainingDecimals}</span> ${targetCurrency}
                                </div>`;

                            lastFetchTime = new Date();
                            updateConversionText();

                            clearInterval(timer);
                            startTimer();
                        } else {
                            conversionResult.textContent = '⚠️ We’re having trouble fetching the exchange rate. Please try refreshing the page or check back later.';
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching exchange rate:', error);
                        conversionResult.textContent = '⚠️ We’re having trouble fetching the exchange rate. Please try refreshing the page or check back later.';
                    });
            })
            .catch(error => {
                console.error('Error loading config:', error);
                conversionResult.textContent = '⚠️ We’re having trouble fetching the exchange rate. Please try refreshing the page or check back later.';
            });
    }

    function updateConversionText() {
        const now = new Date();
        const timeDiff = now - lastFetchTime;
        const minutesAgo = Math.floor(timeDiff / 60000);
        const secondsAgo = Math.floor((timeDiff % 60000) / 1000);

        if (minutesAgo === 0) {
            conversionTextSpan.innerHTML = `${getCurrencyName(baseCurrency)} to ${getCurrencyName(targetCurrency)} conversion — Last updated ${secondsAgo} seconds ago`;
        } else {
            conversionTextSpan.innerHTML = `${getCurrencyName(baseCurrency)} to ${getCurrencyName(targetCurrency)} conversion — Last updated ${minutesAgo} minutes ago`;
        }
    }

    function startTimer() {
        timer = setInterval(() => {
            updateConversionText();
        }, 60000);
    }

    amountInput.addEventListener('input', fetchExchangeRate);
    refreshLink.addEventListener('click', function(event) {
        event.preventDefault();
        fetchExchangeRate();
    });

    swapButton.addEventListener('click', function() {
        [baseCurrency, targetCurrency] = [targetCurrency, baseCurrency];
        baseCurrencySpan.innerHTML = `${getCurrencyEmoji(baseCurrency)} ${baseCurrency} - ${getCurrencyName(baseCurrency)}`;
        targetCurrencySpan.innerHTML = `${getCurrencyEmoji(targetCurrency)} ${targetCurrency} - ${getCurrencyName(targetCurrency)}`;
        fetchExchangeRate();
    });

    fetchExchangeRate();
});
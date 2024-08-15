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
        fetch(`https://v6.exchangerate-api.com/v6/ec08bfe392aaa50ccb5e87f9/pair/${baseCurrency}/${targetCurrency}`)
            .then(response => response.json())
            .then(data => {
                if (data.result === 'success') {
                    const rate = data.conversion_rate;
                    const amount = parseFloat(amountInput.value);
                    const result = (amount * rate).toFixed(5);
                    const [integerPart, decimalPart] = result.split('.');
                    const firstTwoDecimals = decimalPart.slice(0, 2);
                    const remainingDecimals = decimalPart.slice(2);
                    conversionResult.innerHTML = `
                        <div class="base-result">${amount} ${baseCurrency} = </div>
                        <div class="target-result">
                            ${integerPart},${firstTwoDecimals}<span class="fractional-part">${remainingDecimals}</span> ${targetCurrency}
                        </div>`;
                } else {
                    conversionResult.textContent = 'Error fetching exchange rate.';
                }
            })
            .catch(error => {
                console.error('Error fetching exchange rate:', error);
                conversionResult.textContent = 'Error fetching exchange rate.';
            });
    }

    function updateConversionText() {
        conversionTextSpan.innerHTML = `${getCurrencyName(baseCurrency)} to ${getCurrencyName(targetCurrency)} conversion`;
    }

    amountInput.addEventListener('input', fetchExchangeRate);
    refreshLink.addEventListener('click', function(event) {
        event.preventDefault();
        fetchExchangeRate();
    });

    updateConversionText();
    swapButton.addEventListener('click', function() {
        [baseCurrency, targetCurrency] = [targetCurrency, baseCurrency];
        baseCurrencySpan.innerHTML = `${getCurrencyEmoji(baseCurrency)} ${baseCurrency} - ${getCurrencyName(baseCurrency)}`;
        targetCurrencySpan.innerHTML = `${getCurrencyEmoji(targetCurrency)} ${targetCurrency} - ${getCurrencyName(targetCurrency)}`;
        updateConversionText();
        fetchExchangeRate();
    });

    fetchExchangeRate();
});
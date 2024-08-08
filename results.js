document.addEventListener("DOMContentLoaded", function() {
    const params = new URLSearchParams(window.location.search);
    let baseCurrency = params.get('base');
    let targetCurrency = params.get('target');
    const amountInput = document.getElementById('amount');
    const conversionResult = document.getElementById('conversion-result');
    const baseCurrencySpan = document.getElementById('base-currency');
    const targetCurrencySpan = document.getElementById('target-currency');
    const refreshLink = document.getElementById('refresh');
    const swapButton = document.getElementById('swap');

    if (!baseCurrency || !targetCurrency) {
        conversionResult.textContent = 'Please select both base and target currencies.';
        return;
    }

    baseCurrencySpan.textContent = `${baseCurrency}`;
    targetCurrencySpan.textContent = `${targetCurrency}`;

    function fetchExchangeRate() {
        fetch(`https://v6.exchangerate-api.com/v6/ec08bfe392aaa50ccb5e87f9/pair/${baseCurrency}/${targetCurrency}`)
            .then(response => response.json())
            .then(data => {
                if (data.result === 'success') {
                    const rate = data.conversion_rate;
                    const amount = parseFloat(amountInput.value);
                    const result = (amount * rate).toFixed(2);
                    conversionResult.innerHTML = `<p>${amount} ${baseCurrency} = ${result} ${targetCurrency}</p>`;
                } else {
                    conversionResult.textContent = 'Error fetching exchange rate.';
                }
            })
            .catch(error => {
                console.error('Error fetching exchange rate:', error);
                conversionResult.textContent = 'Error fetching exchange rate.';
            });
    }

    amountInput.addEventListener('input', fetchExchangeRate);
    refreshLink.addEventListener('click', function(event) {
        event.preventDefault();
        fetchExchangeRate();
    });

    swapButton.addEventListener('click', function() {
        [baseCurrency, targetCurrency] = [targetCurrency, baseCurrency];
        baseCurrencySpan.textContent = `${baseCurrency}`;
        targetCurrencySpan.textContent = `${targetCurrency}`;
        fetchExchangeRate();
    });

    fetchExchangeRate();
});
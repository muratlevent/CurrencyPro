document.addEventListener("DOMContentLoaded", function() {
    const params = new URLSearchParams(window.location.search);
    const baseCurrency = params.get('base');
    const targetCurrency = params.get('target');
    const amountInput = document.getElementById('amount');
    const conversionResult = document.getElementById('conversion-result');

    if (!baseCurrency || !targetCurrency) {
        conversionResult.textContent = 'Please select both base and target currencies.';
        return;
    }

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

    fetchExchangeRate();
});
import FetchWrapper from "./fetch-wrapper.js";

document.addEventListener("DOMContentLoaded", function() {
    const baseCurrencyContainer = document.getElementById('base-currency');
    const targetCurrencyContainer = document.getElementById('target-currency');
    const trackRateButton = document.getElementById('track-rate-button');

    const API = new FetchWrapper('https://v6.exchangerate-api.com/v6/ec08bfe392aaa50ccb5e87f9/')

    API.get('codes').then(data => {
        if(data.result === 'success') {
            const currencies = data.supported_codes;
            currencies.forEach(currency => {
                const baseButton = document.createElement('button');
                baseButton.textContent = currency[0];
                baseButton.addEventListener('click', () => selectCurrency(baseButton, 'base'));
                baseCurrencyContainer.appendChild(baseButton);

                const targetButton = document.createElement('button');
                targetButton.textContent = currency[0];
                targetButton.addEventListener('click', () => selectCurrency(targetButton, 'target'));
                targetCurrencyContainer.appendChild(targetButton);
            });
        } else {
            console.error('Error fetching currency codes:', data);
        }
    });


    let selectedBaseCurrency = null;
    let selectedTargetCurrency = null;

    function selectCurrency(button, type) {
        const buttons = type === 'base' ? baseCurrencyContainer.querySelectorAll('button') : targetCurrencyContainer.querySelectorAll('button');
        buttons.forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        if (type === 'base') {
            selectedBaseCurrency = button.textContent;
        } else {
            selectedTargetCurrency = button.textContent;
        }
        updateTrackRateButton();
    }

    function updateTrackRateButton() {
        if (selectedBaseCurrency && selectedTargetCurrency) {
            trackRateButton.classList.add('enabled');
            trackRateButton.disabled = false;
        } else {
            trackRateButton.classList.remove('enabled');
            trackRateButton.disabled = true;
        }
    }
});
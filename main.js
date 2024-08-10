import FetchWrapper from './fetch-wrapper.js';
import currencyData from './currency-data.json';

document.addEventListener("DOMContentLoaded", function () {
    const baseCurrencyContainer = document.getElementById('base-currency');
    const targetCurrencyContainer = document.getElementById('target-currency');
    const baseDropdownButton = document.getElementById('show-more-base');
    const targetDropdownButton = document.getElementById('show-more-target');
    const baseDropdown = document.getElementById('base-dropdown');
    const targetDropdown = document.getElementById('target-dropdown');
    const trackRateLink = document.getElementById('track-rate');

    const api = new FetchWrapper('https://v6.exchangerate-api.com/v6/ec08bfe392aaa50ccb5e87f9/');
    let allCurrencies = [];
    let displayedBaseCurrencies = [];
    let displayedTargetCurrencies = [];

    api.get('codes').then(data => {
        if (data.result === 'success') {
            allCurrencies = data.supported_codes;
            const top10Currencies = ['USD', 'EUR', 'JPY', 'GBP', 'CNY', 'AUD', 'CAD', 'CHF', 'HKD', 'SGD'];
            displayedBaseCurrencies = allCurrencies.filter(currency => top10Currencies.includes(currency[0]));
            displayedTargetCurrencies = [...displayedBaseCurrencies];
            renderCurrencies();
        } else {
            console.error('Error fetching currency codes:', data);
        }
    });

    function getCurrencyEmoji(currencyCode) {
        return currencyData[currencyCode] || '';
    }

    function renderCurrencies() {
        baseCurrencyContainer.innerHTML = '';
        targetCurrencyContainer.innerHTML = '';
        baseDropdown.innerHTML = '<input type="text" id="base-search" placeholder="Search currency...">';
        targetDropdown.innerHTML = '<input type="text" id="target-search" placeholder="Search currency...">';

        const baseSearch = document.getElementById('base-search');
        const targetSearch = document.getElementById('target-search');
        baseSearch.addEventListener('input', () => filterCurrencies(baseSearch.value, baseDropdown));
        targetSearch.addEventListener('input', () => filterCurrencies(targetSearch.value, targetDropdown));

        displayedBaseCurrencies.forEach(currency => {
            const baseButton = document.createElement('button');
            baseButton.innerHTML = `<div>${getCurrencyEmoji(currency[0])} ${currency[0]}</div><div>${currency[1]}</div>`;
            baseButton.addEventListener('click', () => selectCurrency(baseButton, 'base'));
            baseCurrencyContainer.appendChild(baseButton);
        });

        displayedTargetCurrencies.forEach(currency => {
            const targetButton = document.createElement('button');
            targetButton.innerHTML = `<div>${getCurrencyEmoji(currency[0])} ${currency[0]}</div><div>${currency[1]}</div>`;
            targetButton.addEventListener('click', () => selectCurrency(targetButton, 'target'));
            targetCurrencyContainer.appendChild(targetButton);
        });

        const otherBaseCurrencies = allCurrencies.filter(currency => !displayedBaseCurrencies.some(displayed => displayed[0] === currency[0]));
        otherBaseCurrencies.forEach(currency => {
            const baseButton = document.createElement('button');
            baseButton.innerHTML = `<div>${getCurrencyEmoji(currency[0])} ${currency[0]}</div><div>${currency[1]}</div>`;
            baseButton.addEventListener('click', () => {
                selectCurrency(baseButton, 'base');
                baseDropdownButton.textContent = `${getCurrencyEmoji(currency[0])} ${currency[0]}`;
            });
            baseDropdown.appendChild(baseButton);
        });

        const otherTargetCurrencies = allCurrencies.filter(currency => !displayedTargetCurrencies.some(displayed => displayed[0] === currency[0]));
        otherTargetCurrencies.forEach(currency => {
            const targetButton = document.createElement('button');
            targetButton.innerHTML = `<div>${getCurrencyEmoji(currency[0])} ${currency[0]}</div><div>${currency[1]}</div>`;
            targetButton.addEventListener('click', () => {
                selectCurrency(targetButton, 'target');
                targetDropdownButton.textContent = `${getCurrencyEmoji(currency[0])} ${currency[0]}`;
            });
            targetDropdown.appendChild(targetButton);
        });
    }

    function filterCurrencies(searchTerm, dropdown) {
        const buttons = dropdown.querySelectorAll('button');
        buttons.forEach(button => {
            if (button.textContent.toLowerCase().includes(searchTerm.toLowerCase())) {
                button.style.display = '';
            } else {
                button.style.display = 'none';
            }
        });
    }

    let selectedBaseCurrency = null;
    let selectedTargetCurrency = null;

    function selectCurrency(button, type) {
        const buttons = type === 'base' ? baseCurrencyContainer.querySelectorAll('button') : targetCurrencyContainer.querySelectorAll('button');
        buttons.forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        if (type === 'base') {
            selectedBaseCurrency = button.textContent.split(' ')[1];
        } else {
            selectedTargetCurrency = button.textContent.split(' ')[1];
        }
        updateTrackRateLink();
    }

    function updateTrackRateLink() {
        if (selectedBaseCurrency && selectedTargetCurrency) {
            trackRateLink.classList.add('enabled');
            trackRateLink.classList.remove('disabled');
            trackRateLink.setAttribute('href', `results.html?base=${selectedBaseCurrency}&target=${selectedTargetCurrency}`);
        } else {
            trackRateLink.classList.remove('enabled');
            trackRateLink.classList.add('disabled');
            trackRateLink.setAttribute('href', '#');
        }
    }
});
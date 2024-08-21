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

    fetch('./config.json')
        .then(response => response.json())
        .then(config => {
            const api = new FetchWrapper(`https://v6.exchangerate-api.com/v6/${config.apiKey}/`);
            let allCurrencies = [];
            let displayedBaseCurrencies = [];
            let displayedTargetCurrencies = [];

            api.get('codes').then(data => {
                if (data.result === 'success') {
                    allCurrencies = data.supported_codes;

                    localStorage.setItem('allCurrencies', JSON.stringify(allCurrencies));

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
                    baseButton.innerHTML = `<div class="currency-code">${getCurrencyEmoji(currency[0])} ${currency[0]}</div><div class="currency-name">${currency[1]}</div>`;
                    baseButton.addEventListener('click', () => selectCurrency(baseButton, 'base'));
                    baseCurrencyContainer.appendChild(baseButton);
                });

                displayedTargetCurrencies.forEach(currency => {
                    const targetButton = document.createElement('button');
                    targetButton.innerHTML = `<div class="currency-code">${getCurrencyEmoji(currency[0])} ${currency[0]}</div><div class="currency-name">${currency[1]}</div>`;
                    targetButton.addEventListener('click', () => selectCurrency(targetButton, 'target'));
                    targetCurrencyContainer.appendChild(targetButton);
                });

                const otherBaseCurrencies = allCurrencies.filter(currency => !displayedBaseCurrencies.some(displayed => displayed[0] === currency[0]));
                otherBaseCurrencies.forEach(currency => {
                    const baseButton = document.createElement('button');
                    baseButton.innerHTML = `<div class="currency-code">${getCurrencyEmoji(currency[0])} ${currency[0]}</div><div class="currency-name">${currency[1]}</div>`;
                    baseButton.addEventListener('click', () => {
                        selectCurrency(baseButton, 'base');
                        baseDropdownButton.innerHTML = `<div class="currency-code">${getCurrencyEmoji(currency[0])} ${currency[0]}</div><div class="currency-name">${currency[1]}</div>`;
                    });
                    baseDropdown.appendChild(baseButton);
                });

                const otherTargetCurrencies = allCurrencies.filter(currency => !displayedTargetCurrencies.some(displayed => displayed[0] === currency[0]));
                otherTargetCurrencies.forEach(currency => {
                    const targetButton = document.createElement('button');
                    targetButton.innerHTML = `<div class="currency-code">${getCurrencyEmoji(currency[0])} ${currency[0]}</div><div class="currency-name">${currency[1]}</div>`;
                    targetButton.addEventListener('click', () => {
                        selectCurrency(targetButton, 'target');
                        targetDropdownButton.innerHTML = `<div class="currency-code">${getCurrencyEmoji(currency[0])} ${currency[0]}</div><div class="currency-name">${currency[1]}</div>`;
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
                const buttons = type === 'base'
                    ? [...baseCurrencyContainer.querySelectorAll('button'), ...baseDropdown.querySelectorAll('button')]
                    : [...targetCurrencyContainer.querySelectorAll('button'), ...targetDropdown.querySelectorAll('button')];

                buttons.forEach(btn => btn.classList.remove('selected'));
                button.classList.add('selected');

                if (type === 'base') {
                    selectedBaseCurrency = button.querySelector('.currency-code').textContent.split(' ')[1].trim();

                    if (baseDropdown.contains(button)) {
                        baseDropdownButton.innerHTML = button.innerHTML;
                        baseDropdownButton.classList.add('selected');
                    } else {
                        baseDropdownButton.innerHTML = 'Other <span class="dropdown-icon">&#9662;</span>';
                        baseDropdownButton.classList.remove('selected');

                    }
                } else {
                    selectedTargetCurrency = button.querySelector('.currency-code').textContent.split(' ')[1].trim();

                    if (targetDropdown.contains(button)) {
                        targetDropdownButton.innerHTML = button.innerHTML;
                        targetDropdownButton.classList.add('selected');

                    } else {
                        targetDropdownButton.innerHTML = 'Other <span class="dropdown-icon">&#9662;</span>';
                        targetDropdownButton.classList.remove('selected');

                    }
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
        })
        .catch(error => console.error('Error loading config:', error));
});
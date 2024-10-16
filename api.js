const apiKey = '6141dd6d84dd40ee961131826241510';
        const baseUrl = 'https://api.weatherapi.com/v1';

        const locationInput = document.getElementById('locationInput');
        const searchBtn = document.getElementById('searchBtn');
        const weatherData = document.getElementById('weatherData');
        const forecastData = document.getElementById('forecastData');
        const sortOptions = document.getElementById('sortOptions');
        const filterOptions = document.getElementById('filterOptions');

        let lastLocation = ''; // Cache the last searched location
        let lastWeatherData = null; // Cache the last weather data
        let lastForecastData = null; // Cache the last forecast data
        const cacheDuration = 60 * 1000; // 1 minute cache duration

        searchBtn.addEventListener('click', () => {
            const location = locationInput.value.trim();
            if (location) {
                getWeatherData(location);
            } else {
                alert('Please enter a city name');
            }
        });

        // Debounce function to limit API calls
        function debounce(func, delay) {
            let timeout;
            return function(...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), delay);
            };
        }

        // Optimized getWeatherData function
        async function getWeatherData(location) {
            if (location === lastLocation && lastWeatherData && Date.now() - lastWeatherData.timestamp < cacheDuration) {
                // Use cached data if within cache duration
                displayWeather(lastWeatherData.data);
                displayForecast(lastForecastData.forecast.forecastday);
                return;
            }

            try {
                const weatherResponse = await fetch(`${baseUrl}/current.json?key=${apiKey}&q=${location}`);
                const forecastResponse = await fetch(`${baseUrl}/forecast.json?key=${apiKey}&q=${location}&days=4`);

                if (!weatherResponse.ok || !forecastResponse.ok) throw new Error('City not found');

                const weatherDataJson = await weatherResponse.json();
                const forecastDataJson = await forecastResponse.json();

                // Cache the data
                lastLocation = location;
                lastWeatherData = {
                    timestamp: Date.now(),
                    data: weatherDataJson
                };
                lastForecastData = forecastDataJson;

                displayWeather(weatherDataJson);
                displayForecast(forecastDataJson.forecast.forecastday);

                sortOptions.addEventListener('change', () => sortForecast(forecastDataJson.forecast.forecastday));
                filterOptions.addEventListener('change', () => filterForecast(forecastDataJson.forecast.forecastday));

            } catch (error) {
                weatherData.innerHTML = `<p style="color: red;">${error.message}</p>`;
                forecastData.innerHTML = '';
            }
        }

        function displayWeather(data) {
            const { location, current } = data;
            weatherData.innerHTML = `
                <h2>Weather in ${location.name}, ${location.country}</h2>
                <p><strong>Temperature:</strong> ${current.temp_c}°C</p>
                <p><strong>Condition:</strong> ${current.condition.text}</p>
                <p><strong>Humidity:</strong> ${current.humidity}% | <strong>Wind:</strong> ${current.wind_kph} km/h</p>
                <img loading="lazy" src="https:${data.current.condition.icon}" alt="Weather icon"> <!-- Lazy load image -->
            `;
        }

        function displayForecast(forecast) {
            let forecastHtml = `<h2>4-Day Forecast</h2>`;
            forecast.forEach(day => {
                forecastHtml += `
                    <div class="forecast-day" data-condition="${day.day.condition.text.toLowerCase()}">
                        <p>${day.date}</p>
                        <p>Max: ${day.day.maxtemp_c}°C | Min: ${day.day.mintemp_c}°C</p>
                        <p>Condition: ${day.day.condition.text}</p>
                        <img loading="lazy" src="https:${day.day.condition.icon}" alt="Forecast icon"> <!-- Lazy load image -->
                    </div>
                `;
            });
            forecastData.innerHTML = forecastHtml;
        }

        function sortForecast(forecast) {
            const sortOption = sortOptions.value;

            if (sortOption === 'lowToHigh') {
                forecast.sort((a, b) => a.day.maxtemp_c - b.day.maxtemp_c);
            } else if (sortOption === 'highToLow') {
                forecast.sort((a, b) => b.day.maxtemp_c - a.day.maxtemp_c);
            }

            displayForecast(forecast);
        }

        function filterForecast(forecast) {
            const filterOption = filterOptions.value;

            const filteredForecast = forecast.filter(day => {
                const condition = day.day.condition.text.toLowerCase();
                if (filterOption === 'all') return true;
                return condition.includes(filterOption.toLowerCase());
            });

            displayForecast(filteredForecast);
        }

        // Debounced input listener
        const debouncedSearch = debounce(() => {
            const location = locationInput.value.trim();
            if (location) {
                getWeatherData(location);
            }
        }, 300); // 300ms debounce time

        locationInput.addEventListener('input', debouncedSearch); // Attach debounced listener to input

const cityInput = document.getElementById("location");

// Create city suggestions container
const citySuggestions = document.createElement("ul");
citySuggestions.className = "autocomplete-city-results";
cityInput.parentElement.style.position = "relative";
cityInput.parentElement.appendChild(citySuggestions);

let cityDebounceTimer;
cityInput.addEventListener("input", (e) => {
    const query = e.target.value;
    clearTimeout(cityDebounceTimer);

    if (query.length < 2) {
        citySuggestions.innerHTML = "";
        return;
    }

    cityDebounceTimer = setTimeout(async () => {
        try {
            const res = await fetch(`${BASE_URL}job/city-suggestions?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            
            citySuggestions.innerHTML = data.data
                .map(city => `
          <li onclick="selectCitySuggestion('${city}')">
            <strong>${city}</strong>
          </li>
        `).join("");
        } catch (err) {
            console.error("City autocomplete error:", err);
        }
    }, 300);
});

function selectCitySuggestion(city) {
    cityInput.value = city;
    citySuggestions.innerHTML = "";
}

document.addEventListener("click", (e) => {
    if (!citySuggestions.contains(e.target) && e.target !== cityInput) {
        citySuggestions.innerHTML = "";
    }
});
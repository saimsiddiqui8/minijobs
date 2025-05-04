const selectedCity = document.body.dataset.city || "";

const keywordsInput = document.getElementById("keyword");

// Create suggestions container
const suggestions = document.createElement("ul");
suggestions.className = "autocomplete-city-results";
keywordsInput.parentElement.style.position = "relative";
keywordsInput.parentElement.appendChild(suggestions);

let debounceTimer;
keywordsInput.addEventListener("input", (e) => {
  const query = e.target.value;
  clearTimeout(debounceTimer);

  if (query.length < 2) {
    suggestions.innerHTML = "";
    return;
  }

  debounceTimer = setTimeout(async () => {
    try {
      const res = await fetch(`${BASE_URL}job/suggestions?q=${encodeURIComponent(query)}&city=${encodeURIComponent(selectedCity)}`);
      const data = await res.json();
      console.log(data)
      suggestions.innerHTML = data
        .map(item => `
          <li onclick="selectSuggestion('${item.value}', '${item.type}')">
            <strong>${item.value}</strong>
          </li>
        `).join("");
    } catch (err) {
      console.error("Autocomplete error:", err);
    }
  }, 300);
});

function selectSuggestion(value, type) {
  keywordsInput.value = value;
  suggestions.innerHTML = "";
  fetchJobs(1); // re-fetch jobs if needed
}

document.addEventListener("click", (e) => {
  if (!suggestions.contains(e.target) && e.target !== keywordsInput) {
    suggestions.innerHTML = "";
  }
});
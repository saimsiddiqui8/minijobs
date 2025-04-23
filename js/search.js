// suggestions 
const keywordInput = document.getElementById("keyword");
const locationInput = document.getElementById("location");
const suggestionsContainer = document.createElement("ul");
suggestionsContainer.classList.add("autocomplete-results");
document.querySelector(".search").appendChild(suggestionsContainer);

let debounceTimer;

function showSuggestions(query) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    if (query.length < 2) return suggestionsContainer.innerHTML = "";

    const res = await fetch(`${BASE_URL}job/suggestions?q=${encodeURIComponent(query)}`);
    const data = await res.json();

    suggestionsContainer.innerHTML = data.map(item => `
      <li onclick="applySuggestion('${item.value}', '${item.type}')">
        ${item.value} <small>(${item.type})</small>
      </li>
    `).join("");
  }, 300);
}

function applySuggestion(value, type) {
  if (type === "city") locationInput.value = value;
  else keywordInput.value = value;
  suggestionsContainer.innerHTML = "";
  fetchJobs(1); // re-fetch with filter
}

keywordInput.addEventListener("input", (e) => showSuggestions(e.target.value));
locationInput.addEventListener("input", (e) => showSuggestions(e.target.value));
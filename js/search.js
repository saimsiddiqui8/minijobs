// suggestions
const keywordInput = document.getElementById("keyword");
const locationInput = document.getElementById("location");

const keywordSuggestions = document.createElement("ul");
keywordSuggestions.classList.add("autocomplete-results");
keywordInput.parentElement.style.position = "relative";
keywordInput.parentElement.appendChild(keywordSuggestions);

const locationSuggestions = document.createElement("ul");
locationSuggestions.classList.add("autocomplete-results");
locationInput.parentElement.style.position = "relative";
locationInput.parentElement.appendChild(locationSuggestions);

let debounceTimer;

function showSuggestions(query, inputType) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    if (query.length < 2) {
      keywordSuggestions.innerHTML = "";
      locationSuggestions.innerHTML = "";
      return;
    }

    const res = await fetch(
      `${BASE_URL}job/suggestions?q=${encodeURIComponent(query)}`,
    );
    const data = await res.json();

    const targetContainer =
      inputType === "keyword" ? keywordSuggestions : locationSuggestions;
    targetContainer.innerHTML = data
      .map(
        (item) => `
      <li onclick="applySuggestion('${item.value}', '${item.type}')">
        ${item.value} <small>(${item.type})</small>
      </li>
    `,
      )
      .join("");
  }, 300);
}

function applySuggestion(value, type) {
  if (type === "city") locationInput.value = value;
  else keywordInput.value = value;
  suggestionsContainer.innerHTML = "";
  fetchJobs(1); // re-fetch with filter
}

keywordInput.addEventListener("input", (e) =>
  showSuggestions(e.target.value, "keyword"),
);
locationInput.addEventListener("input", (e) =>
  showSuggestions(e.target.value, "location"),
);



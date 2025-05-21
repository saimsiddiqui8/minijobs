const BASE_URL = "https://www.backend.parttimejobsinberlin.com/api/v1/";
// const BASE_URL = 'http://localhost:8000/api/v1/';

const urlParams = new URLSearchParams(window.location.search);
let currentPage = parseInt(urlParams.get("page")) || 1;
const keyword = urlParams.get("keyword") || "";
const types = urlParams.get("types") ? urlParams.get("types").split(",") : [];

const city = urlParams.get("city") || document.body.dataset.city || "";
const limit = 20;
let isLoading = false;
let userChangedJobType = false;

function updateUrlParams() {
  const keyword = document.getElementById("keyword").value.trim();
  const cityInput = document.getElementById("location").value.trim();
  const selectedTypes = getSelectedJobTypes(); // array

  const params = new URLSearchParams();
  if (keyword) params.set("keyword", keyword);
  if (cityInput) {
    params.set("city", cityInput);
  }

  if (userChangedJobType && selectedTypes.length > 0) {
    params.set("types", selectedTypes.join(","));
  }
  if (currentPage !== 1) {
    params.set("page", currentPage);
  }
  const queryString = params.toString();
  const newUrl = queryString
    ? `${window.location.pathname}?${queryString}`
    : window.location.pathname;
  window.history.pushState({}, "", newUrl);

  // Update canonical tag
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", window.location.origin + newUrl);
}

function scrollToJob() {
  document.querySelector(".container-xxl.pb-5.pt-2").scrollIntoView({ behavior: "smooth", block: "start" });

}

document.addEventListener("DOMContentLoaded", () => {
  // Fill search input
  const searchInput = document.getElementById("keyword");
  if (searchInput && keyword) {
    searchInput.value = keyword;
  }

  const locationInput = document.getElementById("location");
  if (locationInput && urlParams.get("city")) {
    locationInput.value = city;
  }

  // Check the checkboxes based on types from URL
  const checkboxes = document.querySelectorAll(".form-check-input");
  if (types.length > 0) {
    // Only override checkboxes if URL has types
    checkboxes.forEach((checkbox) => {
      checkbox.checked = types.includes(checkbox.value);
    });
  }

  // 3. Now fetch jobs AFTER restoring UI state
  // If a keyword is present, perform a keyword search
  if (keyword) {
    jobFilter(keyword, currentPage, limit);
  } else {
    fetchJobs(currentPage, limit);
  }
});

function updateJobInfo(totalJobs, currentPage, totalPages) {
  const jobsFoundElement = document.getElementById("jobs-found");

  const selectedJobTypes = getSelectedJobTypes(); // Already available
  const cityName = city.charAt(0).toUpperCase() + city.slice(1); // Capitalize first letter
  const desiredCity = cityName || "Germany";
  let jobTypesText =
    selectedJobTypes.length > 0 ? selectedJobTypes.join(", ") : "Jobs";

  jobsFoundElement.textContent = `Wir gefunden ${totalJobs} ${jobTypesText} Arbeitsplätze für Sie in ${desiredCity}`;

  document.getElementById("page-info").textContent =
    `Seite ${currentPage} von ${totalPages}`;
}

function getSelectedJobTypes() {
  const selected = [];
  const checkboxes = document.querySelectorAll(".form-check-input");

  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      selected.push(checkbox.value);
    }
  });

  return selected;
}

const checkboxes = document.querySelectorAll(".form-check-input");
checkboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    // Whenever a checkbox is changed, refetch jobs
    userChangedJobType = true;
    currentPage = 1;
    fetchJobs(currentPage, limit).then(() => scrollToJob());
  });
});

// Checkbox Job Count
function updateCheckboxLabels(counts) {
  const checkboxes = document.querySelectorAll(".form-check-input");

  checkboxes.forEach((checkbox) => {
    const label = checkbox.parentElement.querySelector("label");
    const type = checkbox.value;

    const count = counts[type] || 0;

    if (count > 0) {
      label.innerHTML = `${type} (${count})`;
      checkbox.parentElement.style.display = "inline-block"; // Show
      checkbox.disabled = false;
    } else {
      checkbox.parentElement.style.display = "none";

      // Option 2: (If you prefer greyed out instead of hiding)
      // checkbox.disabled = true;
      // label.innerHTML = `${type} (0)`;
    }
  });
}
async function fetchJobTypeCounts() {
  try {
    const response = await fetch(`${BASE_URL}job/job-type-counts?city=${city}`);
    if (!response.ok) throw new Error("Failed to fetch job type counts");

    const result = await response.json();
    updateCheckboxLabels(result.counts);
  } catch (error) {
    console.error("Error fetching job type counts:", error);
  }
}

fetchJobTypeCounts();

function updatePageInUrl(page) {
  const url = new URL(window.location);
  url.searchParams.set("page", page);
  window.history.pushState({}, "", url);
}

async function jobFilter(keyword, page = 1, limit = 15) {
  try {
    let URL = `${BASE_URL}job/search?page=${page}&limit=${limit}`;
    if (keyword) {
      URL += `&q=${encodeURIComponent(keyword)}`;
    }
    if (city) {
      URL += `&city=${encodeURIComponent(city)}`;
    }

    const response = await fetch(URL);
    if (!response.ok) throw new Error("Failed to fetch jobs");

    const result = await response.json();
    const jobs = result.data; // assume jobs come in data array

    // Normalize and filter client-side in case backend doesn't filter both title + description
    const filteredJobs = jobs.filter((job) => {
      const title = job.title?.toLowerCase() || "";
      const desc = job.description?.replace(/<[^>]*>/g, "").toLowerCase(); // strip HTML tags
      const kw = keyword.toLowerCase();
      return title.includes(kw) || desc.includes(kw);
    });
    updateUrlParams();
    updateJobInfo(result.total, page, result.totalPages);
    insertJobsinUi(filteredJobs, result.totalPages, page); // display results
  } catch (error) {
    console.error("Error filtering jobs:", error);
  } finally {
    isLoading = false;
    toggleLoader(false);
  }
}

document.getElementById("searchButton").addEventListener("click", () => {
  const keyword = document.getElementById("keyword").value.trim();
  const jobContainer = document.getElementById("job-container");
  const noJobsSection = document.getElementById("no-jobs");
  const paginationContainer = document.getElementById("pagination-container");

  // Reset UI
  jobContainer.innerHTML = "";
  noJobsSection.style.display = "none";
  paginationContainer.style.display = "none";

  if ((keyword.length < 2 && !city) || (city.length < 1 && keyword.length < 2)) {
    alert("Please enter at least 2 characters in keyword or a valid city");
    return;
  }


  jobFilter(keyword.toLowerCase(), 1, limit);
  scrollToJob();
});

function getInitialSelectedJobTypes() {
  if (types.length > 0) {
    return types; // Use types from URL
  } else {
    return getSelectedJobTypes(); // Fallback to default checked
  }
}

// Function to fetch paginated jobs
async function fetchJobs(page = 1, limit = 12) {
  if (isLoading) return;
  isLoading = true;
  toggleLoader(true);
  try {
    const selectedJobTypes = getInitialSelectedJobTypes();

    let url = `${BASE_URL}job/get-job-by-type?page=${page}&limit=${limit}`;

    if (selectedJobTypes.length > 0) {
      url += `&jobtype=${encodeURIComponent(selectedJobTypes.join(","))}`; // comma separated if needed
    }

    if (city) {
      url += `&city=${encodeURIComponent(city)}`;
    }

    const response = await fetch(url);

    if (!response.ok) throw new Error("Failed to fetch jobs");
    const res = await response.json();

    updateUrlParams();
    updateJobInfo(res.data.total, page, res.data.totalPages);
    insertJobsinUi(res.data.data, res.data.totalPages, page);
    return res.data.data;
  } catch (error) {
    console.error("Error fetching jobs:", error);
  } finally {
    isLoading = false;
    toggleLoader(false);
  }
}

function timeAgo(date) {
  const now = new Date();
  const postedDate = new Date(date);
  const diffInSeconds = Math.floor((now - postedDate) / 1000);

  if (diffInSeconds < 60) return `Posted just now`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `Posted ${diffInMinutes} minute(s) ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Posted ${diffInHours} hour(s) ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `Posted ${diffInDays} day(s) ago`;
}

// Function to parse XML and render jobs
function insertJobsinUi(jobs, totalPages, currentPage) {
  const jobContainer = document.getElementById("job-container");
  jobContainer.innerHTML = ""; // This clears the previous jobs
  const noJobsSection = document.getElementById("no-jobs");
  const cityNameDisplay = document.getElementById("city-name");
  generatePaginationButtons(totalPages, currentPage);
  const paginationContainer = document.getElementById("pagination-container");

  if (!jobs || jobs.length === 0) {
    noJobsSection.style.display = "block";
    paginationContainer.style.display = "none";
    cityNameDisplay.textContent = city || "this city";
  } else {
    noJobsSection.style.display = "none";
    paginationContainer.style.display = "block";
  }

  function truncateHTML(html, maxLength) {
    const div = document.createElement("div");
    div.innerHTML = html;
    const text = div.textContent || div.innerText || "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  }
  const allJobsSchema = [];

  jobs.forEach((job) => {
    const description = truncateHTML(job.description, 200);
    const location = `${job.city}, ${job.country} - (${job.jobtype})`;
    const companyLogo =
      job?.companyLogo ||
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSduZvFB87cOvLtQGxLzMnXVWZNOdgjCaPAOA&s"; // default image

    // Create the job item structure as per your HTML
    const jobItem = document.createElement("div");
    jobItem.classList.add("job-item", "mb-2");
    jobItem.innerHTML = `
            <div class="d-flex d-inline-flex">
                <span class="">
                    <img src="${companyLogo}" style="width:50px;" alt="Company Logo" class="company-logo">
                </span>
                <span class="text-start ps-2">
                    <div class="d-flex d-inline-flex">
                        <span id="jobLocation">
                            ${location}
                            <p><b>${job.company}</b></p>
                        </span>
                    </div>
                </span>
                </div>
                <h6 class="mb-2" id="jobTitle">${job.title}</h6>
            <div class="mt-2" id="jobDescription">
                ${description}
            </div>
            <div class="text-end" style="font-size: 11px; padding:0; margin: 0px" id="datePosted">${timeAgo(job.date_updated)}</div>
        `;

    // Append the job item to the job container
    jobContainer.appendChild(jobItem);

    const slug = job.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .trim();

    // jobItem.addEventListener('click', () => {
    //   const url = `job-detail/${slug}?guid=${encodeURIComponent(job.guid)}`;
    //   window.location.href = url;
    // });
    jobItem.addEventListener("click", () => {
      const url = `job-detail/${slug}?guid=${encodeURIComponent(job.guid)}`;
      window.open(url, "_blank");
    });

    allJobsSchema.push({
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: job.title,
      description: job.description,
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: job.city,
          addressRegion: job.state || "", // optional
          addressCountry: job.country || "DE", // Germany default
        },
      },
      baseSalary: {
        "@type": "MonetaryAmount",
        currency: job.currency || "EUR",
      },
      employmentType: job.jobtype,
      hiringOrganization: {
        "@type": "Organization",
        name: job.company,
      },
      datePosted: job.date_updated,
      url: `job-detail/${slug}?guid=${encodeURIComponent(job.guid)}`,
    });
  });

  // Append schema to the head
  const scriptTag = document.createElement("script");
  scriptTag.type = "application/ld+json";
  scriptTag.textContent = JSON.stringify(allJobsSchema, null, 2);
  document.head.appendChild(scriptTag);
  if (window.innerWidth <= 992) { // Desktop only
    const jobContainer = document.getElementById("job-container");
    const welcomeBox = document.getElementById("welcomeBoxWrapper");
    const newsletter = document.getElementById("newsletterWrapper");
    const jobItems = jobContainer.querySelectorAll(".job-item");
    welcomeBox.innerHTML = `
      <section id="about-our-web">
        <h2 style="font-size: 20px" class="mt-1 mb-2 text-white">
          Willkommen auf MinijobGermany.de
        </h2>
        <p style="font-size: 13.5px">
          Finden Sie die besten Karrierechancen und bewerben Sie sich auf Nebenjobs in Deutschland mit MinijobGermany.de.
          Wenn Sie als Student, Rentner oder Hausfrau Ihren finanziellen Lebensunterhalt sichern wollen, bewerben Sie sich
          auf unsere Angebote in Deutschland und starten Sie Ihre berufliche Karriere.
        </p>
      </section>
    `;
    if (jobItems.length >= 4 && welcomeBox) {
      jobItems[3].insertAdjacentElement("afterend", welcomeBox);
      welcomeBox.classList.remove("d-none"); // ensure it's visible
    }

    if (jobItems.length >= 8) {
      jobItems[7].insertAdjacentElement("afterend", newsletter);
      newsletter.classList.remove("d-none"); // ensure it's visible
    }
  }
}

function generatePaginationButtons(totalPages, currentPage) {
  const paginationContainer = document.getElementById("pagination-container");

  paginationContainer.innerHTML = ""; // Clear previous pagination buttons

  const maxVisiblePages = 5; // Show only 5 page numbers
  const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  // First button for page number 1
  if (currentPage > 1) {
    const prevButton = document.createElement("button");
    prevButton.textContent = "Previous";
    prevButton.classList.add("pagination-btn");
    prevButton.onclick = () => {
      updatePageInUrl(currentPage - 1);
      fetchJobs(currentPage - 1).then(() => {
        scrollToJob();
      });
    };
    paginationContainer.appendChild(prevButton);
  }

  // Generate buttons for each page within the limited range
  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement("button");
    pageButton.textContent = i;
    pageButton.classList.add("pagination-btn");
    pageButton.onclick = () => {
      updatePageInUrl(i);
      fetchJobs(i).then(() => {
        scrollToJob();
      });
    };
    if (i === currentPage) pageButton.classList.add("active");
    paginationContainer.appendChild(pageButton);
  }

  // Next button for the next page
  if (currentPage < totalPages) {
    const nextButton = document.createElement("button");
    nextButton.textContent = "Next";
    nextButton.classList.add("pagination-btn");
    nextButton.onclick = () => {
      updatePageInUrl(currentPage + 1);
      fetchJobs(currentPage + 1).then(() => {
        scrollToJob();
      });
    };
    paginationContainer.appendChild(nextButton);
  }
}

// Helper function to toggle loader
function toggleLoader(show) {
  const loader = document.getElementById("loader");
  if (show) {
    loader.classList.add("active");
  } else {
    loader.classList.remove("active");
  }
}

// Decode HTML entities
function decodeHtml(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

// Infinite scrolling
function getMoreJobs() {
  currentPage++;
  fetchJobs(currentPage, limit);
}

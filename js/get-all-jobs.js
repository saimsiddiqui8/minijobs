const BASE_URL = 'https://www.backend.parttimejobsinberlin.com/api/v1/';
const urlParams = new URLSearchParams(window.location.search);
let currentPage = parseInt(urlParams.get("page")) || 1
const city = document.body.dataset.city || "";
const limit = 12;
let isLoading = false;

function updateJobInfo(totalJobs, currentPage, totalPages) {
  // Update job count dynamically
  document.getElementById("jobs-found").textContent = `We found ${totalJobs} jobs for you!`;

  // Update page info dynamically
  document.getElementById("page-info").textContent = `Page ${currentPage} of ${totalPages}`;
}

function updatePageInUrl(page) {
  const url = new URL(window.location);
  url.searchParams.set("page", page);
  window.history.pushState({}, "", url);
}

async function jobFilter(keyword, page = 1, limit = 15) {
  try {
    const URL = `${BASE_URL}job/search?q=${encodeURIComponent(keyword)}&page=${page}&limit=${limit}`;
    const response = await fetch(URL);
    if (!response.ok) throw new Error("Failed to fetch jobs");

    const result = await response.json();
    const jobs = result.data; // assume jobs come in data array

    // Normalize and filter client-side in case backend doesn't filter both title + description
    const filteredJobs = jobs.filter(job => {
      const title = job.title?.toLowerCase() || "";
      const desc = job.description?.replace(/<[^>]*>/g, "").toLowerCase(); // strip HTML tags
      const kw = keyword.toLowerCase();
      return title.includes(kw) || desc.includes(kw);
    });

    updateJobInfo(result.data.total, page, result.data.totalPages);
    insertJobsinUi(filteredJobs, 1, 1); // display results
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

  if (keyword.length < 2) {
    alert("Please enter at least 2 characters");
    return;
  }

  jobFilter(keyword.toLowerCase(), 1, limit);
});

// Function to fetch paginated jobs
async function fetchJobs(page = 1, limit = 12) {
  if (isLoading) return;
  isLoading = true;
  toggleLoader(true);
  try {
    let url = `${BASE_URL}job/get-job-by-type?page=${page}&limit=${limit}&jobtype=Part-time`;

    if (city) {
      url += `&city=${encodeURIComponent(city)}`;
    }

    const response = await fetch(url);

    if (!response.ok) throw new Error("Failed to fetch jobs");
    const res = await response.json();

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
  jobContainer.innerHTML = "";  // This clears the previous jobs
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

  jobs.forEach((job) => {
    const description = truncateHTML(job.description, 200);
    const location = `${job.city}, ${job.country} - (${job.jobtype})`;
    const companyLogo = job?.companyLogo ||
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
      .replace(/\s+/g, "-")        // Replace spaces with hyphens
      .trim();

    // jobItem.addEventListener('click', () => {
    //   const url = `job-detail/${slug}?guid=${encodeURIComponent(job.guid)}`;
    //   window.location.href = url;
    // });
    jobItem.addEventListener('click', () => {
      const url = `job-detail/${slug}?guid=${encodeURIComponent(job.guid)}`;
      window.open(url, '_blank');
    });

    const jobSchema = {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": job.title,
      "description": job.description,
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": job.city,
          "addressRegion": job.state, // You can replace with the state if available
          "addressCountry": job.country
        }
      },
      "baseSalary": {
        "@type": "MonetaryAmount",
        "currency": job.currency || "EUR",
      },
      "employmentType": job.jobtype,
      "hiringOrganization": {
        "@type": "Organization",
        "name": job.company,
      },
      "datePosted": job.date_updated,
      "url": `job-detail/${slug}?guid=${encodeURIComponent(job.guid)}`
    };
    console.log(job.guid)
    // Append schema to the head
    const scriptTag = document.createElement("script");
    scriptTag.type = "application/ld+json";
    scriptTag.textContent = JSON.stringify(jobSchema);
    document.head.appendChild(scriptTag);

  });
}

function generatePaginationButtons(totalPages, currentPage) {
  const paginationContainer = document.getElementById("pagination-container");

  paginationContainer.innerHTML = ""; // Clear previous pagination buttons

  const maxVisiblePages = 5;  // Show only 5 page numbers
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
        const firstJob = document.querySelector("container-xxl pb-5 pt-2");
        if (firstJob) {
          firstJob.scrollIntoView({ behavior: "smooth", block: "start" });
        }
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
        const firstJob = document.querySelector("container-xxl pb-5 pt-2");
        if (firstJob) {
          firstJob.scrollIntoView({ behavior: "smooth", block: "start" });
        }
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
        const firstJob = document.querySelector("container-xxl pb-5 pt-2");
        if (firstJob) {
          firstJob.scrollIntoView({ behavior: "smooth", block: "start" });
        }
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

// Initial fetch
fetchJobs(currentPage, limit);



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


async function jobFilter(kw, page = 1, limit = 15) {
  try {
    const response = await fetch(
      `https://minijob-backend.vercel.app/api/v1/job/stepstone?page=${page}&limit=${limit}`,
    );
    if (!response.ok) throw new Error("Failed to fetch jobs");
    const xmlData = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, "application/xml");
    const jobs = xmlDoc.getElementsByTagName("job");
    const jobContainer = document.getElementById("job-container");

    Array.from(jobs).forEach((job) => {
      const title = job.getElementsByTagName("title")[0].textContent;
      let description = job.getElementsByTagName("description")[0].textContent;
      const location = job.getElementsByTagName("location")[0].textContent;
      const companyName =
        job.getElementsByTagName("companyName")[0].textContent;
      const jobUrl = job.getElementsByTagName("url")[0].textContent;
      const date = job.getElementsByTagName("date")[0].textContent;
      const companyLogo =
        job.getElementsByTagName("company_logo")[0]?.textContent ||
        "https://via.placeholder.com/150";

      if (title.includes(kw)) {
        const jobCard = document.createElement("div");
        jobCard.classList.add("job-card");
        description = decodeHtml(description).slice(0, 150) + "...";
        jobCard.innerHTML = `
                <div onClick="window.open('${jobUrl}', '_blank')">
                    <div class="text-end" id="datePosted">Date posted: ${date}</div>
                    <div class="d-flex">
                      <img src="${companyLogo}" alt="Company Logo" class="company-logo" />
                          <div>
                            <div class="job-company">Company: ${companyName}</div>
                            <div class="job-location">Location: ${location}</div>
                          </div>
                    </div>
                    <div class="job-title">${title}</div>
                    <div class="job-description">${description}</div>
                    <a  target="_blank" href="${jobUrl}" target="_blank" class="job-link">Apply Now</a>
                </div>
                `;
        jobContainer.appendChild(jobCard);

      }
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
  } finally {
    isLoading = false;
    toggleLoader(false);
  }
}

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
      fetchJobs(currentPage - 1);
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
      fetchJobs(i);
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
      fetchJobs(currentPage + 1);
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



const BASE_URL = "https://www.backend.parttimejobsinberlin.com/api/v1/";

function showJobExpiredMessage() {
  document.querySelector(".col-lg-8").innerHTML = `
        <div class="text-center py-5">
            <h2 class="text-danger mb-4">This job is expired or no longer available.</h2>
            <a href="/" class="btn btn-primary">Back to Homepage</a>
        </div>
    `;
  document.title = "Job Expired | MiniJobGermany.de";
  document
    .querySelector('meta[name="description"]')
    .setAttribute(
      "content",
      "This job listing has expired or is no longer available on MiniJobGermany.de.",
    );
}

async function loadJobDetail() {
  document.getElementById("job-loader").style.display = "block";
  document.getElementById("job-content").style.display = "none";

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("guid");
    if (!id) {
      console.error("No job ID found in URL");
      return;
    }

    const response = await fetch(`${BASE_URL}job/get-job/${id}`);
    if (!response.ok) {
      showJobExpiredMessage();
      return;
    }

    const job = await response.json();
    if (!job || !job.data) {
      showJobExpiredMessage();
      return;
    }

    // Set Meta title and desc
    document.title = `${job.data.title} | MiniJobGermany.de`;
    document
      .querySelector('meta[name="description"]')
      .setAttribute(
        "content",
        job.data.description.replace(/<[^>]*>?/gm, "").substring(0, 160),
      );

    //Fill content into the UI using IDs
    document.getElementById("job-title").textContent =
      job.data.title || "No Title";
    document.getElementById("job-location").textContent =
      `${job.data.city}, ${job.data.state}, ${job.data.country}`;
    document.getElementById("job-type").textContent = job.data.jobtype || "N/A";

    // Inject description HTML (with <p>, <ul>, etc.)
    document.getElementById("job-description").innerHTML =
      job.data.description || "No description available";
    document.getElementById("job-company").innerHTML =
      job.data.company || "No description available";

    //Nav (Breadcrums)
    document.getElementById("breadcrumb-title").textContent =
      job.data.title || "Job Detail";
    // const city = job.data.city || 'Unknown City';
    // const citySlug = `minijob-${city.toLowerCase().replace(/\s+/g, '-')}`;

    // const cityLink = document.getElementById('city-crumb-link');
    // cityLink.textContent = city;
    // cityLink.href = `/${citySlug}`;

    document.getElementById("job-apply").addEventListener("click", () => {
      const cleanUrl = job.data.url.replace(/^https?:\/\//, "");
      if (cleanUrl) {
        const encodedUrl = encodeURIComponent(cleanUrl);
        window.open(`/redirect/${cleanUrl}`, "_blank");
      } else {
        console.error("Job URL is not defined.");
      }
    });

    // Add JSON-LD Schema Markup for Jobs
    const jobSchema = {
      "@context": "https://schema.org/",
      "@type": "JobPosting",
      title: job.data.title,
      description: job.data.description.replace(/<[^>]*>?/gm, ""),
      datePosted: new Date(job.data.date_updated).toISOString(),
      employmentType: job.data.jobtype || "Part-time",
      hiringOrganization: {
        "@type": "Organization",
        name: job.data.company || "Unknown",
      },
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: job.data.city,
          addressRegion: job.data.state,
          addressCountry: "DE",
        },
      },
    };

    const schemaScript = document.createElement("script");
    schemaScript.type = "application/ld+json";
    schemaScript.text = JSON.stringify(jobSchema);
    document.head.appendChild(schemaScript);

    // After everything is loaded
    document.getElementById("job-loader").style.display = "none";
    document.getElementById("job-content").style.display = "block";

    return job;
  } catch (error) {
    console.error("Error loading job detail:", error);
  }
}

loadJobDetail().then((data) => {
  console.log(data.data)
  if (data) {
    loadRelatedJobs(data.data);
  }
});

document.getElementById("copy-link").addEventListener("click", () => {
  navigator.clipboard.writeText(window.location.href).then(() => {
    const icon = document.querySelector("#copy-link i");
    icon.classList.remove("fa-link");
    icon.classList.add("fa-check");

    setTimeout(() => {
      icon.classList.remove("fa-check");
      icon.classList.add("fa-link");
    }, 2000);
  });
});

// Related Jobs 
async function loadRelatedJobs(job) {
  const container = document.getElementById("related-jobs-container");
  container.innerHTML = `<div class="text-center w-100 py-5">Loading related jobs...</div>`;

  try {
    let URL = `${BASE_URL}job/search?page=1&limit=4`;

    if (job.city) {
      URL += `&city=${encodeURIComponent(job.city)}`;
    }
    if (job.jobtype) {
      URL += `&jobtype=${encodeURIComponent(job.jobtype)}`;
    }
    const response = await fetch(URL);
    if (!response.ok) return;

    const data = await response.json();
    const jobs = data?.data || [];

    const container = document.getElementById("related-jobs-container");
    container.innerHTML = "";

    if (!jobs.length) {
      container.innerHTML = `<p class="text-muted text-center w-100">No related jobs found.</p>`;
      return;
    }

    jobs.forEach((job) => {
      const jobCard = document.createElement("div");
      jobCard.className = "col";

      jobCard.innerHTML = `
        <div class="card h-100 border-0 shadow-sm rounded-4">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title mb-2 text-primary">${job.title}</h5>
            <p class="card-text text-muted mb-1"><i class="bi bi-geo-alt"></i> ${job.city}, ${job.state}</p>
            <p class="card-text mb-3"><span class="badge bg-secondary">${job.jobtype}</span></p>
            <div class="mt-auto">
              <a href="/job-detail.html?guid=${job.guid}" class="btn btn-outline-primary w-100 btn-sm">View Details</a>
            </div>
          </div>
        </div>
      `;

      container.appendChild(jobCard);
    });
  } catch (error) {
    console.error("Error loading related jobs:", error);
  }
}

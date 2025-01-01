let currentPage = 1;
const limit = 15;
let isLoading = false;
async function jobFilter(kw, page = 1, limit = 15) {
    try {
        const response = await fetch(`https://in-backend.vercel.app/api/v1/job/stepstone?page=${page}&limit=${limit}`);
        if (!response.ok) throw new Error('Failed to fetch jobs');
        const xmlData = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlData, 'application/xml');
        const jobs = xmlDoc.getElementsByTagName('job');
        const jobContainer = document.getElementById('job-container');

        Array.from(jobs).forEach(job => {
            const title = job.getElementsByTagName('title')[0].textContent;
            let description = job.getElementsByTagName('description')[0].textContent;
            const location = job.getElementsByTagName('location')[0].textContent;
            const companyName = job.getElementsByTagName('companyName')[0].textContent;
            const jobUrl = job.getElementsByTagName('url')[0].textContent;
            const date = job.getElementsByTagName('date')[0].textContent;
            const companyLogo = job.getElementsByTagName('company_logo')[0]?.textContent || 'https://via.placeholder.com/150';

            if (title.includes(kw)) {
                const jobCard = document.createElement('div');
                jobCard.classList.add('job-card');
                description = decodeHtml(description).slice(0, 150) + '...';
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
                    <a href="${jobUrl}" target="_blank" class="job-link">Apply Now</a>
                </div>
                `;
                jobContainer.appendChild(jobCard);
            }
        });
    } catch (error) {
        console.error('Error fetching jobs:', error);
    } finally {
        isLoading = false;
        toggleLoader(false);
    }
}
// Function to fetch paginated jobs
async function fetchJobs(page = 1, limit = 15) {
    if (isLoading) return;
    isLoading = true;
    toggleLoader(true);
    try {
        const response = await fetch(`https://in-backend.vercel.app/api/v1/job/stepstone?page=${page}&limit=${limit}`);
        if (!response.ok) throw new Error('Failed to fetch jobs');
        const xmlData = await response.text();
        parseAndRenderJobs(xmlData);
    } catch (error) {
        console.error('Error fetching jobs:', error);
    } finally {
        isLoading = false;
        toggleLoader(false);
    }
}


// Function to parse XML and render jobs
function parseAndRenderJobs(xmlData) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, 'application/xml');
    const jobs = xmlDoc.getElementsByTagName('job');
    const jobContainer = document.getElementById('job-container');

    Array.from(jobs).forEach(job => {
        const title = job.getElementsByTagName('title')[0].textContent;
        let description = job.getElementsByTagName('description')[0].textContent.slice(0, 200) + '...';
        const location = job.getElementsByTagName('location')[0].textContent;
        const companyName = job.getElementsByTagName('companyName')[0].textContent;
        const jobUrl = job.getElementsByTagName('url')[0].textContent;
        const date = job.getElementsByTagName('date')[0].textContent;
        const companyLogo = job.getElementsByTagName('company_logo')[0]?.textContent || './img/search icon.png';  // default image

        // Create the job item structure as per your HTML
        const jobItem = document.createElement('div');
        jobItem.classList.add('job-item', 'mb-2');
        jobItem.innerHTML = `
            <div class="d-flex d-inline-flex">
                <span class="">
                    <img src="${companyLogo}" style="width:75px;" alt="Company Logo" class="company-logo">
                </span>
                <span class="text-start ps-2">
                    <div class="d-flex d-inline-flex">
                        <span id="jobLocation">
                           <i class="fa fa-map-marker-alt secondary-color-blue fs-5 me-2"></i>${location}
                            <p>Company: ${companyName}</p>
                        </span>
                    </div>
                </span>
                </div>
                <h6 class="mb-2" id="jobTitle">${title}</h6>
            <div class="mt-2" id="jobDescription">
                ${description}
            </div>
        `;

        // Append the job item to the job container
        jobContainer.appendChild(jobItem);
    });

}

// Helper function to toggle loader
function toggleLoader(show) {
    const loader = document.getElementById('loader');
    if (show) {
        loader.classList.add('active');
    } else {
        loader.classList.remove('active');
    }
}

// Decode HTML entities
function decodeHtml(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

// Infinite scrolling
function getMoreJobs() {
    currentPage++;
    fetchJobs(currentPage, limit);
};

// Initial fetch
fetchJobs(currentPage, limit);


async function subscribeToEmail() {
    const email = document.getElementById('newsletter-input').value;

    if (!email) {
        Toastify({
            text: "Please enter a valid email address",
            backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
            duration: 3000
        }).showToast();
        return;
    }

    try {
        const response = await fetch('https://in-backend.vercel.app/api/v1/email-subscribe/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.status === 201) {
            Toastify({
                text: "Subscribed to email successfully!",
                backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
                duration: 3000
            }).showToast();
        } else {
            Toastify({
                text: `Error: ${data.message}`,
                backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
                duration: 3000
            }).showToast();
        }
    } catch (error) {
        Toastify({
            text: "Something went wrong. Please try again later.",
            backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
            duration: 3000
        }).showToast();
    }
}

async function subscribeToEmailBox() {
    const email = document.getElementById('newsletter-email').value;

    if (!email) {
        Toastify({
            text: "Please enter a valid email address",
            backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
            duration: 3000
        }).showToast();
        return;
    }

    try {
        const response = await fetch('https://in-backend.vercel.app/api/v1/email-subscribe/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.status === 201) {
            Toastify({
                text: "Subscribed to email successfully!",
                backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
                duration: 3000
            }).showToast();
        } else {
            Toastify({
                text: `Error: ${data.message}`,
                backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
                duration: 3000
            }).showToast();
        }
    } catch (error) {
        Toastify({
            text: "Something went wrong. Please try again later.",
            backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
            duration: 3000
        }).showToast();
    }
}
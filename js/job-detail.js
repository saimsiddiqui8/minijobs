let currentPage = 1;
const limit = 15;
let isLoading = false;
async function jobFilter(kw, page = 1, limit = 15) {
    try {
        const response = await fetch(`https://minijob-backend.vercel.app/api/v1/job/stepstone?page=${page}&limit=${limit}`);
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
document.getElementById('searchButton').addEventListener('click', function () {
    console.log("CLICKKK")
    const keyword = document.getElementById('keyword').value;
    const location = "falkensee";
    const buttonText = document.getElementById('buttonText');
    const buttonLoader = document.getElementById('buttonLoader');

    buttonText.classList.add('d-none');
    buttonLoader.classList.remove('d-none');
    this.disabled = true;

    jobFilter(keyword).finally(() => {
        // Hide loader and enable button
        buttonText.classList.remove('d-none');
        buttonLoader.classList.add('d-none');
        this.disabled = false;
    });
});
// Function to fetch paginated jobs
async function fetchJobs(page = 1, limit = 15) {
    if (isLoading) return;
    isLoading = true;
    toggleLoader(true);
    try {
        const response = await fetch(`https://api.connectcareeronline.com/api/v1/job/stepstone?page=${page}&limit=${limit}`);
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

function openJobModal(job) {
    const modal = document.getElementById('job-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalLogo = document.getElementById('modal-logo');
    const modalDescription = document.getElementById('modal-description');
    const modalDate = document.getElementById('modal-date');
    const modalUrl = document.getElementById('modal-url');
    const modalLocation = document.getElementById('modal-location');
    const modalWorkType = document.getElementById('modal-work-type');
    const modalAddress = document.getElementById('modal-address');
    const modalCategory = document.getElementById('modal-category');
    const modalSector = document.getElementById('modal-sector');

    modalTitle.textContent = job.title;
    modalLogo.src = job.companyLogo;
    modalDescription.innerHTML = job.fullDescription;
    modalDate.textContent = `Date posted: ${job.date}`;
    modalUrl.href = job.jobUrl;

    // Additional information
    modalLocation.textContent = `Location: ${job.location}`;
    modalWorkType.textContent = `Work Type: ${job.workType}`;
    modalAddress.textContent = `Address: ${job.address}`;
    modalCategory.textContent = `Category: ${job.category}`;
    modalSector.textContent = `Sector: ${job.sector}`;

    modal.style.display = 'block';
}

// Function to handle modal close
function closeModal() {
    const modal = document.getElementById('job-modal');
    modal.style.display = 'none';
}

// Add event listener for modal close button
document.getElementById('modal-close').addEventListener('click', closeModal);


// Function to parse XML and render jobs
function parseAndRenderJobs(xmlData) {
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

        if (true) {
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

            jobCard.addEventListener('click', (event) => {
                if (event.target.id !== "viewJobLink") {
                    clickFunc();
                }
            });
            function clickFunc() {
                openJobModal({
                    title,
                    companyLogo,
                    fullDescription,
                    date,
                    jobUrl,
                    location,
                    workType,
                    address: jobAddress,
                    category: jobCategory,
                    sector: jobSector
                });
            }

            jobContainer.appendChild(jobCard);
        }
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
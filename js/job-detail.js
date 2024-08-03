document.addEventListener("DOMContentLoaded", function () {
    // Function to get the job ID from the URL parameters
    function getJobIdFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get("id");
    }

    // Function to fetch job details from the API
    async function fetchJobDetails(jobId) {
        try {
            const response = await fetch(`https://api.minijobsgermany/api/v1/job/get-job/${jobId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch job details");
            }
            const job = await response.json();
            return job.data;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    // Function to update the page content with the fetched job details
    function updateJobDetails(job) {
        if (!job) return;
        document.getElementById("job-titles").textContent = job.title;
        document.getElementById("job-location").textContent = `${job.location.city}, ${job.location.country}`;
        document.getElementById("job-type").textContent = job.jobType;
        document.getElementById("job-salary").textContent = job.wages;
        document.getElementById("job-description").textContent = job.description;
        document.getElementById("job-summary").textContent = `Published On: ${new Date(job.createdAt).toLocaleDateString()}`;
        document.getElementById("job-nature").textContent = `Job Nature: ${job.jobType}`;
        document.getElementById("job-salary-summary").textContent = `Salary: ${job.wages}`;
        // document.getElementById("job-location-summary").textContent = `Location: ${job.location.city}, ${job.location.country}`;
        const applyNowButton = document.getElementById("applyNow");
        applyNowButton.href = job.applyNow;
    }

    // Function to initialize the page
    async function initializeJobDetailPage() {
        const jobId = getJobIdFromURL();
        if (!jobId) {
            console.error("Job ID not found in the URL");
            return;
        }

        const job = await fetchJobDetails(jobId);
        updateJobDetails(job);
    }

    // Initialize the job detail page
    initializeJobDetailPage();
});

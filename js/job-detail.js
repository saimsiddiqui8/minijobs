const BASE_URL = 'https://www.backend.parttimejobsinberlin.com/api/v1/';

const currentUrl = encodeURIComponent(window.location.href);

document.getElementById('share-fb').href = `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`;
document.getElementById('share-tw').href = `https://twitter.com/intent/tweet?url=${currentUrl}&text=Check%20out%20this%20job!`;
document.getElementById('share-li').href = `https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}`;
document.getElementById('share-wa').href = `https://api.whatsapp.com/send?text=Check%20out%20this%20job:%20${currentUrl}`;
document.getElementById('share-mail').href = `mailto:?subject=Check%20out%20this%20job&body=${currentUrl}`;

async function loadJobDetail() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('guid');
        if (!id) {
            console.error("No job ID found in URL");
            return;
        }

        const response = await fetch(`${BASE_URL}job/get-job/${id}`);
        if (!response.ok) throw new Error("Failed to fetch job");

        const job = await response.json();

        // Set Meta title and desc
        document.title = `${job.data.title} | MiniJobGermany.de`;
        document.querySelector('meta[name="description"]').setAttribute(
            'content',
            job.data.description.replace(/<[^>]*>?/gm, '').substring(0, 160)
        );


        //Fill content into the UI using IDs
        document.getElementById('job-title').textContent = job.data.title || 'No Title';
        document.getElementById('job-location').textContent = `${job.data.city}, ${job.data.state}, ${job.data.country}`;
        document.getElementById('job-type').textContent = job.data.jobtype || 'N/A';

        // Inject description HTML (with <p>, <ul>, etc.)
        document.getElementById('job-description').innerHTML = job.data.description || 'No description available';
        document.getElementById('job-company').innerHTML = job.data.company || 'No description available';

        //Nav (Breadcrums)
        document.getElementById('breadcrumb-title').textContent = job.data.title || 'Job Detail';
        // const city = job.data.city || 'Unknown City';
        // const citySlug = `minijob-${city.toLowerCase().replace(/\s+/g, '-')}`;

        // const cityLink = document.getElementById('city-crumb-link');
        // cityLink.textContent = city;
        // cityLink.href = `/${citySlug}`;

        
        document.getElementById('job-apply').addEventListener('click', () => {
            const cleanUrl = job.data.url.replace(/^https?:\/\//, '').replace(/^de\.jooble\.org\/external\//, '');
            if (cleanUrl) {
                const encodedUrl = encodeURIComponent(cleanUrl);
                window.open(`/redirect/${cleanUrl}`, '_blank');
            } else {
                console.error('Job URL is not defined.');
            }
        });

        // Add JSON-LD Schema Markup for Jobs
        const jobSchema = {
            "@context": "https://schema.org/",
            "@type": "JobPosting",
            "title": job.data.title,
            "description": job.data.description.replace(/<[^>]*>?/gm, ''),
            "datePosted": new Date(job.data.date_updated).toISOString(),
            "employmentType": job.data.jobtype || "Part-time",
            "hiringOrganization": {
                "@type": "Organization",
                "name": job.data.company || "Unknown"
            },
            "jobLocation": {
                "@type": "Place",
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": job.data.city,
                    "addressRegion": job.data.state,
                    "addressCountry": "DE"
                }
            }
        };

        const schemaScript = document.createElement('script');
        schemaScript.type = 'application/ld+json';
        schemaScript.text = JSON.stringify(jobSchema);
        document.head.appendChild(schemaScript);


    } catch (error) {
        console.error('Error loading job detail:', error);
    }
}

loadJobDetail();

document.getElementById('copy-link').addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
        const icon = document.querySelector('#copy-link i');
        icon.classList.remove('fa-link');
        icon.classList.add('fa-check');

        setTimeout(() => {
            icon.classList.remove('fa-check');
            icon.classList.add('fa-link');
        }, 2000);
    });
});

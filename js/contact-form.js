const BASE_URL = 'https://www.backend.parttimejobsinberlin.com/api/v1/';


document.getElementById('contactForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const whatsapp = document.getElementById('whatsapp number').value.trim();
    const city = document.getElementById('city').value.trim();
    const jobType = document.getElementById('job-type').value;
    const message = document.getElementById('message').value.trim();
    const recaptchaToken = grecaptcha.getResponse();

    if (!recaptchaToken) {
        Toastify({
            text: "Please verify reCAPTCHA",
            backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
            duration: 3000,
        }).showToast();
        return;
    }

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
        Toastify({
            text: "Please enter a valid email address",
            backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
            duration: 3000,
        }).showToast();
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/contact`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                whatsapp,
                city,
                jobType,
                message,
                recaptchaToken
            })
        });

        const result = await res.json();

        if (res.ok) {
            Toastify({
                text: "Message sent successfully!",
                backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
                duration: 3000,
            }).showToast();

            document.getElementById('contactForm').reset();
            grecaptcha.reset(); // reset captcha
        } else {
            Toastify({
                text: result.message || "Failed to send message.",
                backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
                duration: 3000,
            }).showToast();
        }
    } catch (error) {
        Toastify({
            text: "Something went wrong. Please try again.",
            backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
            duration: 3000,
        }).showToast();
    }
});
fetch("https://ipwho.is/")
    .then(res => res.json())
    .then(data => {
        const country = data.country;
        const button = document.getElementById("job-apply");
        const message = document.getElementById("apply-msg");

        if (country === "Germany") {
            button.disabled = false;
            message.textContent = ""; // No error message
        } else {
            button.disabled = false;
            message.textContent = "Sorry, you cannot apply from outside Germany.";
        }
    })
    .catch(error => {
        console.error("Geo check failed:", error);
        document.getElementById("apply-msg").textContent = "Unable to verify your location.";
    });
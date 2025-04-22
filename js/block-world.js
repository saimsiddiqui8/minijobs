fetch("https://ipwho.is/")
    .then(res => res.json())
    .then(data => {
        const country = data.country;
        const button = document.getElementById("job-apply");
        const message = document.getElementById("apply-msg");

        if (country === "Germany") {
            button.disabled = false;
            message.textContent = "";
        } else {
            button.disabled = true;
            message.textContent = "Sorry, you can only apply from Germany.";
        }
    })
    .catch(error => {
        console.error("Geo check failed:", error);
        document.getElementById("apply-msg").textContent = "Unable to verify your location.";
    });
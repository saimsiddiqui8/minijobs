async function subscribeToEmail() {
  const email = document.getElementById("newsletter-input").value;

  if (!email) {
    Toastify({
      text: "Please enter a valid email address",
      backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
      duration: 3000,
    }).showToast();
    return;
  }

  try {
    const response = await fetch(
      "https://minijob-backend.vercel.app/api/v1/email-subscribe/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      },
    );

    const data = await response.json();

    if (response.status === 201) {
      Toastify({
        text: "Subscribed to email successfully!",
        backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
        duration: 3000,
      }).showToast();
    } else {
      Toastify({
        text: `Error: ${data.message}`,
        backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
        duration: 3000,
      }).showToast();
    }
  } catch (error) {
    Toastify({
      text: "Something went wrong. Please try again later.",
      backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
      duration: 3000,
    }).showToast();
  }
}

async function subscribeToEmailBox() {
  const email = document.getElementById("newsletter-email").value;

  if (!email) {
    Toastify({
      text: "Please enter a valid email address",
      backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
      duration: 3000,
    }).showToast();
    return;
  }

  try {
    const response = await fetch(
      "https://minijob-backend.vercel.app/api/v1/email-subscribe/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      },
    );

    const data = await response.json();

    if (response.status === 201) {
      Toastify({
        text: "Subscribed to email successfully!",
        backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
        duration: 3000,
      }).showToast();
    } else {
      Toastify({
        text: `Error: ${data.message}`,
        backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
        duration: 3000,
      }).showToast();
    }
  } catch (error) {
    Toastify({
      text: "Something went wrong. Please try again later.",
      backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
      duration: 3000,
    }).showToast();
  }
}

document.addEventListener("DOMContentLoaded", async () => {
    const profileCard = document.getElementById("profile-card");
    const profileForm = document.getElementById("profile-form-container");
    const editProfileBtn = document.getElementById("edit-profile-btn");
    const cancelBtn = document.getElementById("cancel-btn");
    const profilePicInput = document.getElementById("profile-pic");
    const profilePicImg = document.getElementById("profile-pic-img");
    const profileFormEl = document.getElementById("profile-form");

    // Fetch user profile on page load
    async function fetchUserProfile() {
        try {
            const response = await fetch('/api/profile', { credentials: 'include' });
            const data = await response.json();

            if (data.success) {
                document.getElementById("profile-name").textContent = data.user.name;
                document.getElementById("profile-email").textContent = data.user.email;
                profilePicImg.src = data.user.profile_image_url || "./assets/images/default-profile.jpg";

                // Populate the form with user data
                document.getElementById("name").value = data.user.name;
                document.getElementById("email").value = data.user.email;
            } else {
                console.error("Error fetching user data:", data.error);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        }
    }

    // Show profile card, hide form initially
    function showProfileCard() {
        profileCard.style.display = "block";
        profileForm.style.display = "none";
    }

    function showProfileForm() {
        profileCard.style.display = "none";
        profileForm.style.display = "block";
    }

    // Toggle between profile card and form
    editProfileBtn.addEventListener("click", showProfileForm);
    cancelBtn.addEventListener("click", showProfileCard);

    // Handle profile picture upload
    profilePicInput.addEventListener("change", async function () {
        const file = this.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("profilePic", file);

        try {
            const response = await fetch("/api/profile/upload-profile-pic", {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            const data = await response.json();
            if (data.success) {
                profilePicImg.src = data.imageUrl; // Update profile image in UI
            } else {
                alert("Error uploading image");
            }
        } catch (error) {
            console.error("Upload error:", error);
        }
    });

    // Handle profile update form submission
    profileFormEl.addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        const updatedData = { name, email };
        if (password) updatedData.password = password; // Only update password if provided

        try {
            const response = await fetch("/api/profile/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData),
                credentials: "include",
            });

            const data = await response.json();
            if (data.success) {
                alert("Profile updated successfully!");
                showProfileCard(); // Return to profile card view
                fetchUserProfile(); // Refresh displayed info
            } else {
                alert("Error updating profile: " + data.error);
            }
        } catch (error) {
            console.error("Update error:", error);
        }
    });

    // Fetch user profile data on page load
    fetchUserProfile();
});

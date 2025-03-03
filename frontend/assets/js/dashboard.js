document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");

    // Redirect only if the user is on a protected page (not login/signup)
    if (!token && !window.location.href.includes("login.html")) {
        window.location.href = "login.html";
        return;
    }

    try {
        // Fetch user data only if we're on the dashboard
        if (window.location.href.includes("dashboard.html")) {
            const userResponse = await fetch("http://localhost:5000/dashboard", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (userResponse.ok) {
                const userData = await userResponse.json();
                document.getElementById("user-name").textContent = userData.name;
                document.getElementById("user-email").textContent = userData.email;
            } else {
                localStorage.removeItem("token");
                window.location.href = "login.html";
            }
        }

        // Fetch and display tasks only if on tasks.html
        if (window.location.href.includes("tasks.html")) {
            await loadTasks();
        }

    } catch (error) {
        console.error("Error fetching data:", error);
    }

    // ✅ Fix: Burger Menu Code Inside the First DOMContentLoaded
    const burgerMenu = document.getElementById("burger-menu");
    const sidebar = document.getElementById("sidebar");

    if (burgerMenu && sidebar) {
        burgerMenu.addEventListener("click", function () {
            console.log("Burger menu clicked!"); // Debugging
            sidebar.classList.toggle("active");
        });

        document.addEventListener("click", function (event) {
            if (!sidebar.contains(event.target) && !burgerMenu.contains(event.target)) {
                console.log("Clicked outside, closing sidebar."); // Debugging
                sidebar.classList.remove("active");
            }
        });
    } else {
        console.log("Burger menu or sidebar not found!"); // Debugging
    }

    // Sidebar Navigation Links - Open new pages
    document.querySelectorAll(".sidebar ul li a").forEach(link => {
        link.addEventListener("click", function (event) {
            const targetPage = this.getAttribute("href");

            // Prevent logout link from interfering
            if (targetPage !== "#") {
                event.preventDefault();
                window.location.href = targetPage;
            }
        });
    });

    // Logout functionality
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function (event) {
            event.preventDefault();
            localStorage.removeItem("token");
            window.location.href = "login.html";
        });
    }
});

// Function to fetch and display tasks
async function loadTasks() {
    const token = localStorage.getItem("token");
    try {
        const taskResponse = await fetch("http://localhost:5000/tasks", {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (taskResponse.ok) {
            const tasks = await taskResponse.json();
            document.getElementById("pending-tasks").textContent = tasks.filter(t => !t.completed).length;
            document.getElementById("completed-tasks").textContent = tasks.filter(t => t.completed).length;
        }
    } catch (error) {
        console.error("Error fetching tasks:", error);
    }
}

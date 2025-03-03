document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        // Decode JWT to get user ID
        const payload = JSON.parse(atob(token.split(".")[1]));
        localStorage.setItem("userId", payload.userId); // Store user ID locally

        await loadTasks();
    } catch (error) {
        console.error("Error fetching tasks:", error);
    }

    // Logout functionality
    document.getElementById("logout-btn").addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        window.location.href = "login.html";
    });
});

// ✅ Add Task Function
document.getElementById("add-task-btn").addEventListener("click", async () => {
    const title = document.getElementById("task-title").value.trim();
    const description = document.getElementById("task-desc").value.trim();
    const deadline = document.getElementById("task-deadline").value;
    const token = localStorage.getItem("token");

    if (!title || !deadline) {
        alert("Task title and deadline are required!");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/tasks/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ title, description, deadline })
        });

        if (response.ok) {
            alert("Task added successfully!");
            document.getElementById("task-title").value = "";
            document.getElementById("task-desc").value = "";
            document.getElementById("task-deadline").value = "";
            loadTasks();
        } else {
            alert("Failed to add task.");
        }
    } catch (error) {
        console.error("Error adding task:", error);
    }
});

// ✅ Fetch and Display Tasks
async function loadTasks() {
    const token = localStorage.getItem("token");

    if (!token) {
        console.error("No token found, redirecting to login.");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/tasks", {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
            const tasks = await response.json();
            const pendingTasksList = document.getElementById("pending-tasks");
            const completedTasksList = document.getElementById("completed-tasks");

            pendingTasksList.innerHTML = "";
            completedTasksList.innerHTML = "";

            tasks.forEach(task => {
                let li = document.createElement("li");
                li.textContent = `${task.title} (Due: ${task.deadline})`;

                let completeBtn = document.createElement("button");
                completeBtn.textContent = "Complete";
                completeBtn.onclick = () => completeTask(task.id);

                let deleteBtn = document.createElement("button");
                deleteBtn.textContent = "Delete";
                deleteBtn.onclick = () => deleteTask(task.id);

                li.appendChild(completeBtn);
                li.appendChild(deleteBtn);

                if (task.completed) {
                    completedTasksList.appendChild(li);
                } else {
                    pendingTasksList.appendChild(li);
                }
            });
        } else {
            console.error("Failed to fetch tasks from the server.");
        }
    } catch (error) {
        console.error("Error fetching tasks:", error);
    }
}

// ✅ Complete a Task
async function completeTask(taskId) {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`http://localhost:5000/tasks/${taskId}/complete`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            alert("Task marked as completed!");
            loadTasks();
        } else {
            alert("Failed to complete task.");
        }
    } catch (error) {
        console.error("Error completing task:", error);
    }
}

// ✅ Delete a Task
async function deleteTask(taskId) {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`http://localhost:5000/tasks/${taskId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            alert("Task deleted successfully!");
            loadTasks();
        } else {
            alert("Failed to delete task.");
        }
    } catch (error) {
        console.error("Error deleting task:", error);
    }
}

// ✅ Burger Menu Functionality
document.addEventListener("DOMContentLoaded", function () {
    const burgerMenu = document.getElementById("burger-menu");
    const sidebar = document.getElementById("sidebar");

    burgerMenu.addEventListener("click", function () {
        sidebar.classList.toggle("active");
    });

    document.addEventListener("click", function (event) {
        if (!sidebar.contains(event.target) && !burgerMenu.contains(event.target)) {
            sidebar.classList.remove("active");
        }
    });
});

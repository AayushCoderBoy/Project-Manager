document.addEventListener("DOMContentLoaded", () => {
    loadProjects();
});

// ✅ Add a New Project
document.getElementById("add-project-btn").addEventListener("click", async () => {
    const title = document.getElementById("project-title").value.trim();
    const description = document.getElementById("project-desc").value.trim();
    const start_date = document.getElementById("start-date").value;
    const deadline = document.getElementById("project-deadline").value;
    const project_owner = document.getElementById("project-owner").value.trim();
    
    // ✅ Fix: Ensure status is correctly formatted
    const status = document.getElementById("project-status").value.trim();
    const validStatuses = ["Not Started", "In Progress", "Completed", "On Hold"];
    const formattedStatus = validStatuses.find(s => s.toLowerCase() === status.toLowerCase()) || "In Progress";

    // ✅ Fix: Ensure priority is correctly formatted
    const priority = document.getElementById("priority-level").value.trim();
    const validPriorities = ["Low", "Medium", "High", "Urgent"];
    const formattedPriority = validPriorities.find(p => p.toLowerCase() === priority.toLowerCase()) || "Medium";

    const completion_percentage = document.getElementById("completion-percentage").value || 0;
    const budget = document.getElementById("budget").value || null;
    
    let assigned_members = [];
    const assignedMembersInput = document.getElementById("assigned-members");
    if (assignedMembersInput) {
        assigned_members = assignedMembersInput.value.split(",").map(member => member.trim());
    }

    const newProject = {
        title, description, start_date, deadline, assigned_members,
        project_owner, status: formattedStatus,
        priority: formattedPriority,
        completion_percentage, budget,
        attachments: []
    };

    try {
        const response = await fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newProject)
        });

        if (!response.ok) throw new Error("Failed to add project");

        const data = await response.json();
        appendProjectToUI(data);
        clearForm();
    } catch (error) {
        console.error("Error adding project:", error);
    }
});

// ✅ Load & Display Projects
async function loadProjects() {
    try {
        const response = await fetch("/api/projects");
        if (!response.ok) throw new Error("Failed to fetch projects");

        const projects = await response.json();
        document.getElementById("pending-projects-container").innerHTML = "";
        document.getElementById("completed-projects-container").innerHTML = "";

        projects.forEach(appendProjectToUI);
    } catch (error) {
        console.error("Error loading projects:", error);
    }
}

// ✅ Append Project to UI (Modern Card Design)
function appendProjectToUI(project) {
    const container = project.status === "Completed"
        ? document.getElementById("completed-projects-container")
        : document.getElementById("pending-projects-container");

    const projectCard = document.createElement("div");
    projectCard.classList.add("project-card");
    projectCard.dataset.id = project.id;

    // Define colors for status
    const statusColors = {
        "Not Started": "#007bff", // Blue
        "In Progress": "#ffc107", // Yellow
        "Completed": "#28a745", // Green
        "On Hold": "#dc3545" // Red
    };
    const statusColor = statusColors[project.status] || "#6c757d"; // Default gray

    // Define colors for priority
    const priorityColors = {
        "Low": "#28a745", // Green
        "Medium": "#ffc107", // Yellow
        "High": "#fd7e14", // Orange
        "Urgent": "#dc3545" // Red
    };
    const priorityColor = priorityColors[project.priority] || "#6c757d"; // Default gray

    // ✅ Project Card Layout
    projectCard.innerHTML = `
    <div id="box" style="border: 1px solid black ; border-radius: 10px; padding: 10px; margin: 10px; background-color: #f8f9fa; width: 300px; height: 400px; display: inline-block; text-align: left; box-shadow: 5px 5px 5px #888888;">
        <div >
            <h3>Project: ${project.title}</h3>
        </div>
        <div class="project-body">
            <p><strong>Description:</strong>${project.description || "No description provided."}</p>
            <p><strong>Owner:</strong> ${project.project_owner || "N/A"}</p>
            <p><strong>Start Date:</strong> ${project.start_date} </p>
            <p><strong>Deadline:</strong> ${project.deadline}</p>
            <p><strong>Status:</strong> <span class="status" style="color: ${statusColor};">${project.status}</span></p>
            <p><strong>Priority:</strong> <span class="priority" style="color: ${priorityColor};">${project.priority}</span></p>
            <p><strong>Completion:</strong> ${project.completion_percentage}%</p>

            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${project.completion_percentage}%; background: ${priorityColor};"></div>
            </div>
            
            <div class="project-actions">
                <button class="edit-btn" style="width:60px; height:28px; background-color:#32de84; border-radius:5px; border:none">Edit</button>
                <button class="delete-btn" style="width:60px; height:28px; background-color:#EF0107; border-radius:5px; border:none">Delete</button>
            </div>
        </div>
       </div> 
    `;

    container.appendChild(projectCard);
}

// ✅ Delete a Project
document.addEventListener("click", async (event) => {
    if (event.target.classList.contains("delete-btn")) {
        const projectCard = event.target.closest(".project-card");
        const projectId = projectCard.dataset.id;

        if (confirm("Are you sure you want to delete this project?")) {
            try {
                const response = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
                if (!response.ok) throw new Error("Failed to delete project");

                projectCard.remove();
            } catch (error) {
                console.error("Error deleting project:", error);
            }
        }
    }
});

// ✅ Edit a Project
document.addEventListener("click", async (event) => {
    if (event.target.classList.contains("edit-btn")) {
        const projectCard = event.target.closest(".project-card");
        const projectId = projectCard.dataset.id;
        
        const newTitle = prompt("Edit Project Title:", projectCard.querySelector("h3").textContent);
        if (newTitle === null) return; // If user cancels, do nothing

        const updatedProject = { title: newTitle };

        try {
            const response = await fetch(`/api/projects/${projectId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedProject)
            });

            if (!response.ok) throw new Error("Failed to update project");

            loadProjects(); // Reload projects after edit
        } catch (error) {
            console.error("Error updating project:", error);
        }
    }
});

// ✅ Burger Menu Functionality
document.addEventListener("DOMContentLoaded", function () {
    const burgerMenu = document.querySelector(".burger-menu");
    const sidebar = document.querySelector(".sidebar");

    if (burgerMenu && sidebar) {
        burgerMenu.addEventListener("click", function () {
            sidebar.classList.toggle("active");
        });
    }
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



// ✅ Clear Form Fields
function clearForm() {
    document.getElementById("project-title").value = "";
    document.getElementById("project-desc").value = "";
    document.getElementById("start-date").value = "";
    document.getElementById("project-deadline").value = "";
    document.getElementById("project-owner").value = "";
    document.getElementById("project-status").value = "Not Started"; // Default
    document.getElementById("priority-level").value = "Medium"; // Default
    document.getElementById("completion-percentage").value = "";
    document.getElementById("budget").value = "";
    document.getElementById("assigned-members").value = "";
}

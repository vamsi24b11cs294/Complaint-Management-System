// Data Storage
let complaints = JSON.parse(localStorage.getItem("complaints")) || [];
let feedbackCount = parseInt(localStorage.getItem("feedbackCount")) || 0;

// Initialize
document.addEventListener("DOMContentLoaded", function () {
    updateStats();
    renderAllComplaints();
});

// Tab Navigation
function showTab(tabName) {
    // Hide all sections
    document.querySelectorAll(".content-section").forEach((sec) => {
        sec.classList.remove("active");
    });
    // Show selected section
    document.getElementById(tabName).classList.add("active");

    // Update active tab button
    document.querySelectorAll(".tab-btn").forEach((btn) => {
        if (btn.textContent.toLowerCase().includes(tabName)) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
}

// Submit Complaint
document.getElementById("complaintForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const studentId = document.getElementById("studentId").value;
    const studentName = document.getElementById("studentName").value;
    const department = document.getElementById("department").value;
    const categorySelect = document.getElementById("category").value.split("|")[1] || "facility";
    const subCategorySelect = document.getElementById("subCategory").value.split("|")[0] || "unknown";
    const priority = document.getElementById("priority").value;
    const subject = document.getElementById("subject").value;
    const description = document.getElementById("description").value;

    const newComplaint = {
        id: "CMP" + (complaints.length + 1),
        studentId,
        studentName,
        department,
        category: categorySelect,
        subCategory: subCategorySelect,
        priority,
        subject,
        description,
        status: "pending",
        submittedAt: new Date().toISOString(),
        remarks: "",
    };

    complaints.push(newComplaint);
    saveComplaints();
    updateStats();
    renderAllComplaints();

    // Reset form
    this.reset();
    alert("Complaint submitted successfully!");
});

// Save to localStorage
function saveComplaints() {
    localStorage.setItem("complaints", JSON.stringify(complaints));
    localStorage.setItem("feedbackCount", feedbackCount.toString());
}

// Update Stats Cards
function updateStats() {
    const total = complaints.length;
    const pending = complaints.filter((c) => c.status === "pending").length;
    const resolved = complaints.filter((c) => c.status === "resolved").length;

    document.getElementById("totalComplaints").textContent = total;
    document.getElementById("pendingComplaints").textContent = pending;
    document.getElementById("resolvedComplaints").textContent = resolved;
    document.getElementById("feedbackCount").textContent = feedbackCount;
}

// Track Complaints by Student ID
function trackComplaints() {
    const trackStudentId = document.getElementById("trackStudentId").value.trim();
    const resultsContainer = document.getElementById("trackResults");
    resultsContainer.innerHTML = "";

    if (!trackStudentId) {
        resultsContainer.innerHTML = `<p>Please enter a Student ID.</p>`;
        return;
    }

    const userComplaints = complaints.filter((c) => c.studentId === trackStudentId);

    if (userComplaints.length === 0) {
        resultsContainer.innerHTML = `<div class="empty-state">
            <i class="fas fa-search empty-icon"></i>
            <p>No complaints found for this Student ID.</p>
        </div>`;
        return;
    }

    userComplaints.forEach((complaint) => {
        const card = createComplaintCard(complaint, true);
        resultsContainer.appendChild(card);
    });
}

// Admin Panel: Render all complaints
function renderAllComplaints() {
    const container = document.getElementById("allComplaints");
    if (!container) return;

    container.innerHTML = "";

    if (complaints.length === 0) {
        container.innerHTML = `<div class="empty-state">
            <i class="fas fa-clipboard empty-icon"></i>
            <p>No complaints submitted yet.</p>
        </div>`;
        return;
    }

    complaints.forEach((complaint) => {
        const card = createComplaintCard(complaint, false, true); // isUserView=false, isAdmin=true
        container.appendChild(card);
    });
}

// Create a complaint card (reusable for both user and admin)
function createComplaintCard(complaint, isUserView = false, isAdmin = false) {
    const card = document.createElement("div");
    card.className = `complaint-card ${complaint.category} ${complaint.status}`;

    const statusColor =
        complaint.status === "resolved" ? "status-resolved" : "status-pending";

    let adminActionsHTML = "";

    if (!isUserView && isAdmin) {
        adminActionsHTML = `
            <div class="admin-actions">
                <button class="action-btn btn-progress" onclick="markProgress('${complaint.id}')">
                    Mark In Progress
                </button>
                <button class="action-btn btn-resolve" onclick="markResolved('${complaint.id}')">
                    Mark Resolved
                </button>
                <button class="action-btn btn-feedback" onclick="toggleFeedbackForm('${complaint.id}')">
                    Add Feedback
                </button>
            </div>
            <div id="feedback-${complaint.id}" class="feedback-form"></div>
        `;
    }

    card.innerHTML = `
        <div class="complaint-header">
            <div class="complaint-id">${complaint.id}</div>
            <div class="status-badge ${statusColor}">${complaint.status}</div>
        </div>

        <div class="complaint-meta">
            <div class="meta-tag">
                <i class="fas fa-user"></i> ${complaint.studentName}
            </div>
            <div class="meta-tag">
                <i class="fas fa-building"></i> ${complaint.department}
            </div>
            <div class="meta-tag">
                <i class="fas fa-tags"></i> ${capitalize(complaint.category)}
            </div>
            <div class="meta-tag">
                <i class="fas fa-exclamation-triangle"></i> ${capitalize(
                    complaint.subCategory
                )}
            </div>
            <div class="meta-tag">
                <i class="fas fa-fire"></i> ${capitalize(
                    complaint.priority
                )}
            </div>
            <div class="meta-tag">
                <i class="fas fa-calendar"></i> ${formatDate(
                    complaint.submittedAt
                )}
            </div>
        </div>

        <div class="complaint-details">
            <strong>${complaint.subject}</strong>
            <p>${complaint.description}</p>
            ${complaint.remarks ? `<p><strong>Remarks:</strong> ${complaint.remarks}</p>` : ""}
        </div>

        ${adminActionsHTML}
    `;

    return card;
}

// Helper: capitalize first letter
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Helper: format ISO date to readable string
function formatDate(isoStr) {
    const d = new Date(isoStr);
    return d.toLocaleString();
}

// Admin actions
function markProgress(id) {
    const complaint = complaints.find((c) => c.id === id);
    if (complaint && complaint.status !== "resolved") {
        complaint.status = "in-progress";
        saveComplaints();
        updateStats();
        renderAllComplaints();
    }
}

function markResolved(id) {
    const complaint = complaints.find((c) => c.id === id);
    if (complaint) {
        complaint.status = "resolved";
        saveComplaints();
        updateStats();
        renderAllComplaints();
    }
}

// Feedback form (only for resolved complaints)
function toggleFeedbackForm(id) {
    const complaint = complaints.find((c) => c.id === id);
    if (!complaint) return;

    const feedbackDiv = document.getElementById(`feedback-${id}`);
    if (!feedbackDiv) return;

    if (feedbackDiv.style.display === "block") {
        feedbackDiv.style.display = "none";
        return;
    }

    feedbackDiv.style.display = "block";
    feedbackDiv.innerHTML = `
        <label>Rate this complaint resolution:</label>
        <div class="feedback-stars" id="stars-${id}">
            <span class="star" data-rating="1">★</span>
            <span class="star" data-rating="2">★</span>
            <span class="star" data-rating="3">★</span>
            <span class="star" data-rating="4">★</span>
            <span class="star" data-rating="5">★</span>
        </div>
        <textarea placeholder="Your feedback (optional)" rows="3" id="feedback-input-${id}"></textarea>
        <button class="submit-btn" style="margin-top: 10px;" onclick="submitFeedback('${id}')">
            Submit Feedback
        </button>
    `;

    // Stars hover/click
    const stars = feedbackDiv.querySelectorAll(`.star`);
    let rating = 0;

    stars.forEach((star) => {
        star.addEventListener("click", () => {
            rating = star.getAttribute("data-rating");
            highlightStars(stars, rating);
        });
        star.addEventListener("mouseover", () => {
            highlightStars(stars, star.getAttribute("data-rating"));
        });
        star.addEventListener("mouseout", () => {
            highlightStars(stars, rating);
        });
    });

    function highlightStars(starList, limit) {
        starList.forEach((s) => {
            s.classList.toggle("active", s.getAttribute("data-rating") <= limit);
        });
    }
}

function submitFeedback(id) {
    const complaint = complaints.find((c) => c.id === id);
    if (!complaint) return;

    const input = document.getElementById(`feedback-input-${id}`);
    const comment = input ? input.value.trim() : "";

    // You can log or store feedback; for example:
    if (comment) {
        feedbackCount++;
    }

    // Save
    saveComplaints();
    updateStats();

    // Close feedback form
    const feedbackDiv = document.getElementById(`feedback-${id}`);
    if (feedbackDiv) {
        feedbackDiv.style.display = "none";
    }

     alert("Thank you for your feedback!");

}
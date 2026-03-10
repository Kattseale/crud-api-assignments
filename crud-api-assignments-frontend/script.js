const API_URL = "http://localhost:3000/assignments"; // backend

const assignmentsList = document.getElementById("assignmentsList");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const formTitle = document.getElementById("formTitle");

let editId = null;

// Fetch and display assignments
async function fetchAssignments() {
  const res = await fetch(API_URL);
  const data = await res.json();
  assignmentsList.innerHTML = "";

  data.forEach(a => {
    const div = document.createElement("div");
    div.className = "p-4 bg-white shadow rounded flex flex-col md:flex-row md:justify-between md:items-center";

    div.innerHTML = `
      <div>
        <p class="font-semibold">${a.studentname} - ${a.title}</p>
        <p>${a.content}</p>
        <p class="text-sm text-gray-500">
Created: ${a.createdat ? new Date(a.createdat).toLocaleString() : ""}
</p>
      </div>
      <div class="flex space-x-2 mt-2 md:mt-0">
        <button class="bg-green-500 text-white px-2 py-1 rounded" onclick="editAssignment('${a.id}')">Edit</button>
        <button class="bg-red-500 text-white px-2 py-1 rounded" onclick="deleteAssignment('${a.id}')">Delete</button>
      </div>
    `;

    assignmentsList.appendChild(div);
  });
}

// Save or update assignment
async function saveAssignment() {
  const studentname = document.getElementById("studentname").value;
  const title = document.getElementById("title").value;
  const content = document.getElementById("content").value;

  if (!studentname || !title || !content) return alert("Please fill all fields");

  if (editId) {
    await fetch(`${API_URL}/${editId}`, {
      method: "PUT",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({studentname, title, content})
    });
    editId = null;
    saveBtn.textContent = "Save";
    cancelBtn.classList.add("hidden");
    formTitle.textContent = "Add New Assignment";
  } else {
    await fetch(API_URL, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({studentname, title, content})
    });
  }

  clearForm();
  fetchAssignments();
}

// Delete assignment
async function deleteAssignment(id) {
  if (!confirm("Are you sure you want to delete this assignment?")) return;
  await fetch(`${API_URL}/${id}`, {method: "DELETE"});
  fetchAssignments();
}

// Edit assignment
async function editAssignment(id) {
  const res = await fetch(`${API_URL}/${id}`);
  const data = await res.json();

  document.getElementById("studentname").value = data.studentname;
  document.getElementById("title").value = data.title;
  document.getElementById("content").value = data.content;

  editId = id;
  saveBtn.textContent = "Update";
  cancelBtn.classList.remove("hidden");
  formTitle.textContent = "Edit Assignment";
}

// Cancel edit
cancelBtn.addEventListener("click", () => {
  editId = null;
  clearForm();
  saveBtn.textContent = "Save";
  cancelBtn.classList.add("hidden");
  formTitle.textContent = "Add New Assignment";
});

// Clear form fields
function clearForm() {
  document.getElementById("studentname").value = "";
  document.getElementById("title").value = "";
  document.getElementById("content").value = "";
}

// Event listener
saveBtn.addEventListener("click", saveAssignment);

// Load assignments on page load
fetchAssignments();
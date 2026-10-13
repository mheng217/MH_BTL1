"use strict";

// Dữ liệu khởi tạo
const items = [
  {
    id: 1,
    title: "Viết báo cáo HTML",
    dueDate: "2026-10-20",
    priority: "Cao",
    status: "pending",
  },
  {
    id: 2,
    title: "Ôn Flexbox",
    dueDate: "2026-10-23",
    priority: "Trung bình",
    status: "pending",
  },
  {
    id: 3,
    title: "Làm bài DOM",
    dueDate: "2026-10-19",
    priority: "Cao",
    status: "done",
  },
  {
    id: 4,
    title: "Đọc tài liệu CSS",
    dueDate: "2026-10-25",
    priority: "Thấp",
    status: "pending",
  },
  {
    id: 5,
    title: "Thiết kế trang cá nhân",
    dueDate: "2026-10-21",
    priority: "Trung bình",
    status: "done",
  },
];

// Lấy tham chiếu các phần tử DOM
const taskForm = document.getElementById("task-form");
const taskTitleInput = document.getElementById("task-title");
const taskDateInput = document.getElementById("task-date");
const taskPrioritySelect = document.getElementById("task-priority");
const titleError = document.getElementById("title-error");

const searchInput = document.getElementById("search-input");
const statusSelect = document.getElementById("status-select");
const taskListContainer = document.getElementById("task-list");

// Lấy chuỗi ngày hôm nay dạng YYYY-MM-DD theo giờ địa phương
function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// C1: Hàm hiển thị dữ liệu từ mảng lên DOM
function renderTasks() {
  const keyword = searchInput.value.trim().toLowerCase();
  const filterStatus = statusSelect.value;
  const todayStr = getTodayString();

  // Lọc dữ liệu dựa theo từ khóa và trạng thái
  const filteredItems = items.filter((item) => {
    const matchTitle = item.title.toLowerCase().includes(keyword);
    const matchStatus = filterStatus === "all" || item.status === filterStatus;
    return matchTitle && matchStatus;
  });

  // Xóa danh sách cũ
  taskListContainer.innerHTML = "";

  if (filteredItems.length === 0) {
    taskListContainer.innerHTML = `<p class="empty-message">Không tìm thấy công việc nào phù hợp.</p>`;
    return;
  }

  // Render danh sách công việc
  filteredItems.forEach((item) => {
    const taskCard = document.createElement("div");

    // Class theo mức độ ưu tiên
    const priorityClass =
      item.priority === "Cao"
        ? "priority-cao"
        : item.priority === "Trung bình"
          ? "priority-trung-binh"
          : "priority-thap";
    const badgePriorityClass =
      item.priority === "Cao"
        ? "badge-cao"
        : item.priority === "Trung bình"
          ? "badge-trung-binh"
          : "badge-thap";

    // Xử lý logic trạng thái: Quá hạn / Đã hoàn thành / Chưa hoàn thành
    const isDone = item.status === "done";
    const isOverdue = item.dueDate && item.dueDate < todayStr && !isDone;

    let statusText = "Chưa hoàn thành";
    let badgeStatusClass = "badge-pending";

    if (isDone) {
      statusText = "Đã hoàn thành";
      badgeStatusClass = "badge-done";
    } else if (isOverdue) {
      statusText = "Quá hạn";
      badgeStatusClass = "badge-overdue";
    }

    taskCard.className = `task-item ${priorityClass} ${isDone ? "done" : ""}`;

    taskCard.innerHTML = `
      <div class="task-info">
        <div class="task-title">${escapeHTML(item.title)}</div>
        <div class="task-meta">
          <span>Hạn: <strong>${item.dueDate || "Không có"}</strong></span>
          <span>Ưu tiên: <span class="badge ${badgePriorityClass}">${item.priority}</span></span>
          <span>Trạng thái: <span class="badge ${badgeStatusClass}">${statusText}</span></span>
        </div>
      </div>
      <div class="task-actions">
        <button class="btn btn-sm ${isDone ? "btn-primary" : "btn-success"}" onclick="toggleStatus(${item.id})">
          ${isDone ? "Hoàn tác" : "Hoàn thành"}
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteTask(${item.id})">Xóa</button>
      </div>
    `;

    taskListContainer.appendChild(taskCard);
  });
}

// Hàm hỗ trợ chống lỗi XSS khi chèn text
function escapeHTML(str) {
  return str.replace(
    /[&<>'"]/g,
    (tag) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        tag
      ] || tag,
  );
}

// C2: Đọc form, kiểm tra dữ liệu và thêm bản ghi mới
taskForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const titleValue = taskTitleInput.value.trim();
  const dateValue = taskDateInput.value;
  const priorityValue = taskPrioritySelect.value;

  // Kiểm tra tên công việc không được để trống
  if (!titleValue) {
    titleError.textContent = "Vui lòng nhập tên công việc!";
    taskTitleInput.focus();
    return;
  }

  titleError.textContent = "";

  // Tạo id mới tự tăng
  const newId =
    items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1;

  const newTask = {
    id: newId,
    title: titleValue,
    dueDate: dateValue,
    priority: priorityValue,
    status: "pending",
  };

  // Thêm vào mảng
  items.unshift(newTask);

  // Reset form
  taskForm.reset();

  // Hiển thị lại danh sách
  renderTasks();

  // Thông báo đơn giản khi thêm thành công
  alert("Thêm công việc mới thành công!");
});

// C3: Tìm kiếm theo tên & Lọc theo trạng thái
searchInput.addEventListener("input", renderTasks);
statusSelect.addEventListener("change", renderTasks);

// C4: Cập nhật trạng thái công việc
window.toggleStatus = function (id) {
  const task = items.find((item) => item.id === id);
  if (task) {
    task.status = task.status === "pending" ? "done" : "pending";
    renderTasks();
  }
};

// C4: Xóa công việc theo ID - Có hỏi confirm trước khi xóa
window.deleteTask = function (id) {
  const isConfirm = confirm("Bạn có chắc chắn muốn xóa công việc này không?");
  if (isConfirm) {
    const index = items.findIndex((item) => item.id === id);
    if (index !== -1) {
      items.splice(index, 1);
      renderTasks();
      alert("Đã xóa công việc thành công!");
    }
  }
};

// Hiển thị danh sách ban đầu khi load trang
document.addEventListener("DOMContentLoaded", renderTasks);

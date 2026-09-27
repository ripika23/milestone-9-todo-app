document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".complete-btn");

    buttons.forEach((button) => {
        button.addEventListener("click", async () => {
            const id = button.dataset.id;
            const completed = button.dataset.completed === "true";
            const csrfToken = button.dataset.csrf;

            try {
                const response = await fetch(`/todos/${id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-Token": csrfToken
                    },
                    body: JSON.stringify({
                        completed: completed
                    })
                });

                if (!response.ok) {
                    throw new Error("Failed to update Todo");
                }

                window.location.reload();
            } catch (error) {
                console.error(error);
                alert("Unable to update Todo.");
            }
        });
    });

    const todoForm = document.getElementById("todoForm");

    if (todoForm) {
        todoForm.addEventListener("submit", (event) => {
            const title = document.getElementById("title").value.trim();
            const dueDate = document.getElementById("dueDate").value;

            if (!title) {
                event.preventDefault();
                alert("Todo title cannot be empty.");
                return;
            }

            if (!dueDate) {
                event.preventDefault();
                alert("Due date cannot be empty.");
            }
        });
    }
});
const API = import.meta.env.VITE_API_URL;

export async function createTask(data) {
    const res = await fetch(`${API}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    return res.json();
}

export async function getComments(taskId) {
    const res = await fetch(`${API}/tasks/${taskId}/comments`);
    return res.json();
}

export async function addComment(taskId, comment) {
    const res = await fetch(`${API}/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(comment)
    });
    return res.json();
}

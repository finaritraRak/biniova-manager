const API = import.meta.env.VITE_API_URL;

export async function createProject(data) {
    const res = await fetch(`${API}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    return res.json();
}

export async function updateProject(id, data) {
    const res = await fetch(`${API}/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    return res.json();
}

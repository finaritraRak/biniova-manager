const API = import.meta.env.VITE_API_URL;

export async function getWorkspace(workspaceId) {
    const res = await fetch(`${API}/workspaces/${workspaceId}`);
    return res.json();
}

export async function getAllWorkspaces() {
    const res = await fetch(`${API}/workspaces`);
    return res.json();
}

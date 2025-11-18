// api/index.js
import express from "express";
import cors from "cors";
import { sql } from "./db.js";

const app = express();

app.use(express.json());
app.use(cors({
  origin: "*"
}));

// ----------------------------------------------------------
// GET ALL WORKSPACES
// ----------------------------------------------------------
app.get("/api/workspaces", async (req, res) => {
  try {
    const rows = await sql`
      SELECT id, name, slug, description, image_url, created_at, updated_at
      FROM workspaces
      ORDER BY created_at ASC;
    `;
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------------
// GET FULL WORKSPACE (projects + tasks + members)
// ----------------------------------------------------------
app.get("/api/workspaces/:id", async (req, res) => {
  try {
    const workspaceId = req.params.id;

    // Workspace
    const [workspace] = await sql`
      SELECT id, name, slug, description, image_url, owner_id
      FROM workspaces
      WHERE id = ${workspaceId};
    `;
    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    // Members
    const members = await sql`
      SELECT wm.id, wm.role, u.id AS user_id, u.name, u.email, u.image_url
      FROM workspace_members wm
      JOIN users u ON wm.user_id = u.id
      WHERE wm.workspace_id = ${workspaceId};
    `;

    // Projects
    const projects = await sql`
      SELECT *
      FROM projects
      WHERE workspace_id = ${workspaceId};
    `;

    // Tasks
    const tasks = await sql`
      SELECT *
      FROM tasks
      WHERE project_id IN (SELECT id FROM projects WHERE workspace_id = ${workspaceId});
    `;

    // Regroupement tasks → projet
    const projectMap = {};
    projects.forEach(p => projectMap[p.id] = { ...p, tasks: [] });
    tasks.forEach(t => projectMap[t.project_id].tasks.push(t));

    res.json({
      ...workspace,
      members,
      projects: Object.values(projectMap)
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------------------------------------------
// CREATE PROJECT
// ----------------------------------------------------------
app.post("/api/projects", async (req, res) => {
  try {
    const {
      workspaceId, name, description, priority, status,
      startDate, endDate, teamLeadId
    } = req.body;

    const [project] = await sql`
      INSERT INTO projects (
        workspace_id, name, description, priority, status,
        start_date, end_date, team_lead_id
      )
      VALUES (
        ${workspaceId}, ${name}, ${description},
        ${priority}::project_priority, ${status}::project_status,
        ${startDate}, ${endDate}, ${teamLeadId}
      )
      RETURNING *;
    `;

    res.status(201).json(project);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------------------------------------------
// UPDATE PROJECT
// ----------------------------------------------------------
app.put("/api/projects/:id", async (req, res) => {
  try {
    const projectId = req.params.id;

    const {
      name, description, priority, status,
      startDate, endDate, teamLeadId, progress
    } = req.body;

    const [project] = await sql`
      UPDATE projects SET
        name = COALESCE(${name}, name),
        description = COALESCE(${description}, description),
        priority = COALESCE(${priority}::project_priority, priority),
        status = COALESCE(${status}::project_status, status),
        start_date = COALESCE(${startDate}, start_date),
        end_date = COALESCE(${endDate}, end_date),
        team_lead_id = COALESCE(${teamLeadId}, team_lead_id),
        progress = COALESCE(${progress}, progress),
        updated_at = NOW()
      WHERE id = ${projectId}
      RETURNING *;
    `;

    if (!project) return res.status(404).json({ message: "Project not found" });

    res.json(project);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------------------------------------------
// CREATE TASK
// ----------------------------------------------------------
app.post("/api/tasks", async (req, res) => {
  try {
    const {
      projectId, title, description, status,
      type, priority, assigneeId, dueDate
    } = req.body;

    const [task] = await sql`
      INSERT INTO tasks (
        project_id, title, description, status, type,
        priority, assignee_id, due_date
      )
      VALUES (
        ${projectId}, ${title}, ${description},
        ${status}::task_status, ${type}::task_type,
        ${priority}::task_priority, ${assigneeId}, ${dueDate}
      )
      RETURNING *;
    `;

    res.status(201).json(task);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------------------------------------------
// GET COMMENTS
// ----------------------------------------------------------
app.get("/api/tasks/:id/comments", async (req, res) => {
  try {
    const taskId = req.params.id;

    const rows = await sql`
      SELECT c.id, c.content, c.created_at,
        u.id AS user_id, u.name, u.image_url
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE task_id = ${taskId}
      ORDER BY created_at ASC;
    `;
    res.json(rows);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------------------------------------------
// ADD COMMENT
// ----------------------------------------------------------
app.post("/api/tasks/:id/comments", async (req, res) => {
  try {
    const taskId = req.params.id;
    const { userId, content } = req.body;

    const [comment] = await sql`
      INSERT INTO comments (task_id, user_id, content)
      VALUES (${taskId}, ${userId}, ${content})
      RETURNING *;
    `;

    res.status(201).json(comment);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Export pour Vercel
export default app;

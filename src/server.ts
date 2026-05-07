import express, { type Response, type Request } from "express";
import fs from "fs";
import path from "path";

const app = express();
const PORT = 8000;
const DATA_FILE = "./tasks.json";

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

app.use(express.json());
app.use(express.static("public"));

const loadTasks = (): Task[] => {
  if (!fs.existsSync(DATA_FILE)) return [];
  const data = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(data);
};

const saveTasks = (tasks: Task[]): void => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
};

app.get("/api/tasks", (req: Request, res: Response) => {
  res.json(loadTasks());
});

app.post("/api/tasks", (req: Request, res: Response) => {
  const tasks = loadTasks();
  const newTask: Task = {
    id: Date.now(),
    text: req.body.text,
    completed: false,
  };
  tasks.push(newTask);
  saveTasks(tasks);
  res.status(201).json(newTask);
});

app.patch("/api/tasks/:id", (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string, 10);
  const tasks = loadTasks();
  const updatedTasks = tasks.map((t) =>
    t.id === id ? { ...t, completed: !t.completed } : t,
  );

  saveTasks(updatedTasks);

  res.json(updatedTasks);
});

app.delete("/api/tasks/:id", (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string, 10);
  const tasks = loadTasks();

  const updatedTasks = tasks.filter((t) => t.id !== id);

  saveTasks(updatedTasks);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

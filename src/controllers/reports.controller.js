const Task = require("../models/Task");
const Project = require("../models/Project");
const { buildTasksFilter, normalizeFiltersForView } = require("../utils/taskFilter");
const { generateTasksPdf, generateProjectPdf } = require("../utils/pdf");


function mapTaskToView(t) {
  return {
    title: t.title || "—",
    status: t.status || "—",
    description: t.description || "—",
    deadlineText: t.dueDate ? new Date(t.dueDate).toISOString().slice(0, 10) : "—",
    assigneeName: t.assignedTo?.name || "Unassigned",
    assigneeEmail: t.assignedTo?.email || "",
    projectName: t.project?.name || "—",
  };
}

function computeStats(viewTasks) {
  const stats = { total: viewTasks.length, done: 0, inProgress: 0, todo: 0, overdue: 0 };
  const now = new Date();

  for (const t of viewTasks) {
    const s = String(t.status || "").toLowerCase();

    if (s === "done" || s === "completed") stats.done++;
    else if (s === "in progress" || s === "inprogress") stats.inProgress++;
    else stats.todo++;

  
    if (t.deadlineText !== "—") {
      const d = new Date(t.deadlineText);
      if (d < now && s !== "done" && s !== "completed") stats.overdue++;
    }
  }

  return stats;
}

exports.exportTasksPdf = async (req, res) => {
  try {
   
    const fields = {
      projectField: "project",
      assigneeField: "assignedTo",
      deadlineField: "dueDate",
    };

    const filter = buildTasksFilter(req.query, fields);

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email")
      .populate("project", "name")
      .sort({ dueDate: 1 });

    const viewTasks = tasks.map(mapTaskToView);
    const stats = computeStats(viewTasks);

    const pdfBuffer = await generateTasksPdf({
      title: "Tasks Report",
      tasks: viewTasks,
      stats,
      generatedBy: req.user?.email || req.user?.name || "Manager",
      generatedAt: new Date(),
      filters: normalizeFiltersForView(req.query),
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="tasks-report.pdf"');
    return res.send(pdfBuffer);
  } catch (error) {
    console.error("Export Tasks PDF Error:", error);
    return res.status(500).json({ message: "Failed to export tasks PDF" });
  }
};

exports.exportProjectPdf = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const tasks = await Task.find({ project: project._id })
      .populate("assignedTo", "name email")
      .sort({ dueDate: 1 });

    const viewTasks = tasks.map(mapTaskToView);
    const stats = computeStats(viewTasks);

    const pdfBuffer = await generateProjectPdf({
      title: "Project Report",
      project,
      tasks: viewTasks,
      stats,
      generatedBy: req.user?.email || req.user?.name || "Manager",
      generatedAt: new Date(),
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="project-report.pdf"');
    return res.send(pdfBuffer);
  } catch (error) {
    console.error("Export Project PDF Error:", error);
    return res.status(500).json({ message: "Failed to export project PDF" });
  }
};

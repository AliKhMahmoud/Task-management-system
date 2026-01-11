function buildTasksFilter(query, fields = {}) {
  const filter = {};

  const projectField = fields.projectField || "project";
  const assigneeField = fields.assigneeField || "assignee";
  const deadlineField = fields.deadlineField || "deadline";

  if (query.status) filter.status = query.status;

  if (query.projectId) filter[projectField] = query.projectId;
  if (query.assigneeId) filter[assigneeField] = query.assigneeId;

  if (query.deadlineFrom || query.deadlineTo) {
    filter[deadlineField] = {};
    if (query.deadlineFrom) filter[deadlineField].$gte = new Date(query.deadlineFrom);
    if (query.deadlineTo) filter[deadlineField].$lte = new Date(query.deadlineTo);
  }

  if (query.q) {
    const q = String(query.q).trim();
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }
  }

  return filter;
}

function normalizeFiltersForView(query) {
  return {
    status: query.status || "All",
    projectId: query.projectId || "All",
    assigneeId: query.assigneeId || "All",
    deadlineFrom: query.deadlineFrom || "—",
    deadlineTo: query.deadlineTo || "—",
    q: query.q || "—",
  };
}

module.exports = { buildTasksFilter, normalizeFiltersForView };

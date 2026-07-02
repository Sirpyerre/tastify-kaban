export const SEED_DATA = {
  users: [
    { id: 'user-pm-1',  name: 'Alex Chen',      role: 'product_manager', initials: 'AC' },
    { id: 'user-eng-1', name: 'Jordan Rivera',   role: 'engineer',        initials: 'JR' },
    { id: 'user-eng-2', name: 'Sam Park',        role: 'engineer',        initials: 'SP' },
    { id: 'user-eng-3', name: 'Taylor Kim',      role: 'engineer',        initials: 'TK' },
    { id: 'user-eng-4', name: 'Morgan Lee',      role: 'engineer',        initials: 'ML' },
  ],

  projects: [
    { id: 'proj-1', name: 'Mobile App Redesign',    created_at: 1719360000 },
    { id: 'proj-2', name: 'API Integration Sprint', created_at: 1719446400 },
    { id: 'proj-3', name: 'Q3 Platform Release',    created_at: 1719532800 },
  ],

  tasks: [
    // ── Project 1: Mobile App Redesign (10 tasks) ──────────────────────────
    { id: 'task-1-01', project_id: 'proj-1', title: 'Define new color palette',      column_key: 'done',        assignee_id: 'user-pm-1',  sort_order: 1, created_at: 1719360100 },
    { id: 'task-1-02', project_id: 'proj-1', title: 'User research interviews',       column_key: 'done',        assignee_id: 'user-eng-1', sort_order: 2, created_at: 1719360200 },
    { id: 'task-1-03', project_id: 'proj-1', title: 'Wireframe home screen',          column_key: 'done',        assignee_id: 'user-eng-2', sort_order: 3, created_at: 1719360300 },
    { id: 'task-1-04', project_id: 'proj-1', title: 'Prototype onboarding flow',      column_key: 'in_review',   assignee_id: 'user-eng-3', sort_order: 1, created_at: 1719360400 },
    { id: 'task-1-05', project_id: 'proj-1', title: 'Accessibility audit',            column_key: 'in_review',   assignee_id: 'user-eng-4', sort_order: 2, created_at: 1719360500 },
    { id: 'task-1-06', project_id: 'proj-1', title: 'Implement new navigation bar',   column_key: 'in_progress', assignee_id: 'user-eng-1', sort_order: 1, created_at: 1719360600 },
    { id: 'task-1-07', project_id: 'proj-1', title: 'Update typography system',       column_key: 'in_progress', assignee_id: 'user-eng-2', sort_order: 2, created_at: 1719360700 },
    { id: 'task-1-08', project_id: 'proj-1', title: 'Revise icon set',                column_key: 'in_progress', assignee_id: 'user-eng-3', sort_order: 3, created_at: 1719360800 },
    { id: 'task-1-09', project_id: 'proj-1', title: 'Write design handoff docs',      column_key: 'todo',        assignee_id: 'user-eng-4', sort_order: 1, created_at: 1719360900 },
    { id: 'task-1-10', project_id: 'proj-1', title: 'QA visual regression tests',     column_key: 'todo',        assignee_id: 'user-pm-1',  sort_order: 2, created_at: 1719361000 },

    // ── Project 2: API Integration Sprint (8 tasks) ────────────────────────
    { id: 'task-2-01', project_id: 'proj-2', title: 'Document third-party API specs', column_key: 'done',        assignee_id: 'user-pm-1',  sort_order: 1, created_at: 1719446500 },
    { id: 'task-2-02', project_id: 'proj-2', title: 'Set up sandbox environment',     column_key: 'done',        assignee_id: 'user-eng-1', sort_order: 2, created_at: 1719446600 },
    { id: 'task-2-03', project_id: 'proj-2', title: 'Implement authentication flow',  column_key: 'in_review',   assignee_id: 'user-eng-2', sort_order: 1, created_at: 1719446700 },
    { id: 'task-2-04', project_id: 'proj-2', title: 'Write contract tests for endpoints', column_key: 'in_review', assignee_id: 'user-eng-3', sort_order: 2, created_at: 1719446800 },
    { id: 'task-2-05', project_id: 'proj-2', title: 'Build data transformation layer', column_key: 'in_progress', assignee_id: 'user-eng-4', sort_order: 1, created_at: 1719446900 },
    { id: 'task-2-06', project_id: 'proj-2', title: 'Handle rate-limit retry logic',  column_key: 'in_progress', assignee_id: 'user-eng-1', sort_order: 2, created_at: 1719447000 },
    { id: 'task-2-07', project_id: 'proj-2', title: 'Error mapping and user messages', column_key: 'todo',       assignee_id: 'user-eng-2', sort_order: 1, created_at: 1719447100 },
    { id: 'task-2-08', project_id: 'proj-2', title: 'Integration smoke test suite',   column_key: 'todo',        assignee_id: 'user-eng-3', sort_order: 2, created_at: 1719447200 },

    // ── Project 3: Q3 Platform Release (12 tasks) ──────────────────────────
    { id: 'task-3-01', project_id: 'proj-3', title: 'Release planning kickoff',           column_key: 'done',        assignee_id: 'user-pm-1',  sort_order: 1, created_at: 1719532900 },
    { id: 'task-3-02', project_id: 'proj-3', title: 'Feature freeze confirmed',           column_key: 'done',        assignee_id: 'user-pm-1',  sort_order: 2, created_at: 1719533000 },
    { id: 'task-3-03', project_id: 'proj-3', title: 'Performance baseline captured',      column_key: 'done',        assignee_id: 'user-eng-4', sort_order: 3, created_at: 1719533100 },
    { id: 'task-3-04', project_id: 'proj-3', title: 'Staging environment validated',      column_key: 'done',        assignee_id: 'user-eng-1', sort_order: 4, created_at: 1719533200 },
    { id: 'task-3-05', project_id: 'proj-3', title: 'Fix memory leak in task list',       column_key: 'in_review',   assignee_id: 'user-eng-2', sort_order: 1, created_at: 1719533300 },
    { id: 'task-3-06', project_id: 'proj-3', title: 'Update changelog for v3.0',          column_key: 'in_review',   assignee_id: 'user-eng-3', sort_order: 2, created_at: 1719533400 },
    { id: 'task-3-07', project_id: 'proj-3', title: 'Load testing under peak traffic',    column_key: 'in_progress', assignee_id: 'user-eng-4', sort_order: 1, created_at: 1719533500 },
    { id: 'task-3-08', project_id: 'proj-3', title: 'Database migration dry run',         column_key: 'in_progress', assignee_id: 'user-eng-1', sort_order: 2, created_at: 1719533600 },
    { id: 'task-3-09', project_id: 'proj-3', title: 'Rollback procedure documented',      column_key: 'in_progress', assignee_id: 'user-eng-2', sort_order: 3, created_at: 1719533700 },
    { id: 'task-3-10', project_id: 'proj-3', title: 'Security scan on new endpoints',     column_key: 'todo',        assignee_id: 'user-eng-3', sort_order: 1, created_at: 1719533800 },
    { id: 'task-3-11', project_id: 'proj-3', title: 'Deploy to production',               column_key: 'todo',        assignee_id: 'user-pm-1',  sort_order: 2, created_at: 1719533900 },
    { id: 'task-3-12', project_id: 'proj-3', title: 'Post-release monitoring checklist',  column_key: 'todo',        assignee_id: 'user-eng-4', sort_order: 3, created_at: 1719534000 },
  ],

  members: [
    // All 5 users are members of all 3 projects
    { project_id: 'proj-1', user_id: 'user-pm-1'  },
    { project_id: 'proj-1', user_id: 'user-eng-1' },
    { project_id: 'proj-1', user_id: 'user-eng-2' },
    { project_id: 'proj-1', user_id: 'user-eng-3' },
    { project_id: 'proj-1', user_id: 'user-eng-4' },

    { project_id: 'proj-2', user_id: 'user-pm-1'  },
    { project_id: 'proj-2', user_id: 'user-eng-1' },
    { project_id: 'proj-2', user_id: 'user-eng-2' },
    { project_id: 'proj-2', user_id: 'user-eng-3' },
    { project_id: 'proj-2', user_id: 'user-eng-4' },

    { project_id: 'proj-3', user_id: 'user-pm-1'  },
    { project_id: 'proj-3', user_id: 'user-eng-1' },
    { project_id: 'proj-3', user_id: 'user-eng-2' },
    { project_id: 'proj-3', user_id: 'user-eng-3' },
    { project_id: 'proj-3', user_id: 'user-eng-4' },
  ],
}

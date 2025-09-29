# Entity Refactoring Migration Plan

## 🎯 **Migration Strategy: Old → New Entity Mapping**

### **Phase 1: Parallel Implementation**
Keep both old and new entities temporarily to enable gradual migration.

### **Entity Mapping:**

#### **OLD → NEW Structure:**
```
OLD: Workspace → Team → Project → Board → Column → Task → Subtask
NEW: Workspace → Board → Group → Item → Subitem
              └→ Team (parallel for people management)
```

#### **Specific Mappings:**

**1. Project + Board → Board (v2)**
```sql
-- Migrate Project data into new Board structure
INSERT INTO boards (id, name, description, workspace_id, owner_id, assigned_team_id, color, created_at, updated_at)
SELECT 
  p.id as id,
  p.name as name,
  p.description as description,
  p.workspace_id as workspace_id,
  p.owner_id as owner_id,
  pt.team_id as assigned_team_id, -- from project_teams
  '#0073EA' as color,
  p.created_at,
  p.updated_at
FROM projects p
LEFT JOIN project_teams pt ON p.id = pt.project_id;
```

**2. Column → BoardGroup**
```sql
-- Migrate Column to BoardGroup
INSERT INTO board_groups (id, name, group_type, color, board_id, position, created_at, updated_at)
SELECT 
  c.id as id,
  c.name as name,
  'status' as group_type, -- default to status grouping
  c.color as color,
  c.board_id as board_id, -- from old board relationship
  c.position as position,
  c.created_at,
  c.updated_at
FROM columns c;
```

**3. Task → BoardItem**
```sql
-- Migrate Task to BoardItem
INSERT INTO board_items (id, name, description, status, priority, due_date, group_id, created_by_id, assignee_id, position, estimated_hours, actual_hours, created_at, updated_at)
SELECT 
  t.id as id,
  t.title as name, -- rename title to name
  t.description as description,
  t.status as status,
  t.priority as priority,
  t.due_date as due_date,
  t.column_id as group_id, -- column becomes group
  t.created_by_id as created_by_id,
  ta.user_id as assignee_id, -- from task_assignees (take first assignee)
  t.position as position,
  t.estimated_hours,
  t.actual_hours,
  t.created_at,
  t.updated_at
FROM tasks t
LEFT JOIN task_assignees ta ON t.id = ta.task_id;
```

**4. Subtask → BoardSubitem**
```sql
-- Migrate Subtask to BoardSubitem
INSERT INTO board_subitems (id, name, description, completed, item_id, created_by_id, assignee_id, position, created_at, updated_at)
SELECT 
  s.id as id,
  s.title as name,
  s.description as description,
  s.completed as completed,
  s.task_id as item_id, -- task becomes item
  s.created_by_id as created_by_id,
  s.assigned_to_id as assignee_id,
  s.position as position,
  s.created_at,
  s.updated_at
FROM subtasks s;
```

## 📋 **Phase 2: Create Default Views**

```sql
-- Create default table view for each board
INSERT INTO board_views (id, name, view_type, board_id, created_by_id, configuration, is_default)
SELECT 
  gen_random_uuid() as id,
  'Main Table' as name,
  'table' as view_type,
  b.id as board_id,
  b.owner_id as created_by_id,
  '{"columns": ["name", "status", "assignee", "due_date", "priority"]}' as configuration,
  true as is_default
FROM boards b;

-- Create default kanban view for each board
INSERT INTO board_views (id, name, view_type, board_id, created_by_id, configuration, is_default)
SELECT 
  gen_random_uuid() as id,
  'Kanban' as name,
  'kanban' as view_type,
  b.id as board_id,
  b.owner_id as created_by_id,
  '{"kanbanGroupBy": "status"}' as configuration,
  false as is_default
FROM boards b;
```

## 🗂️ **Phase 3: Update Module Structure**

### **New Module Organization:**
```
board/
├── entities/
│   ├── board.entity.v2.ts        (replaces project + board)
│   ├── board-group.entity.ts     (replaces column)
│   ├── board-item.entity.ts      (replaces task)
│   ├── board-subitem.entity.ts   (replaces subtask)
│   └── board-view.entity.ts      (new for multi-view support)
├── services/
│   ├── board.service.ts
│   ├── board-view.service.ts
│   └── board-item.service.ts
└── controllers/
    ├── board.controller.ts
    └── board-view.controller.ts
```

## 🎯 **Phase 4: API Endpoint Updates**

### **Old Endpoints → New Endpoints:**

**Projects & Boards:**
```
OLD: GET /workspaces/:id/projects
NEW: GET /workspaces/:id/boards

OLD: GET /projects/:id/boards
NEW: GET /boards/:id (board is now the primary unit)

OLD: POST /projects/:id/boards
NEW: POST /workspaces/:id/boards
```

**Columns & Groups:**
```
OLD: GET /boards/:id/columns
NEW: GET /boards/:id/groups

OLD: POST /boards/:id/columns
NEW: POST /boards/:id/groups
```

**Tasks & Items:**
```
OLD: GET /columns/:id/tasks
NEW: GET /groups/:id/items

OLD: POST /columns/:id/tasks
NEW: POST /groups/:id/items
```

**Views (New):**
```
NEW: GET /boards/:id/views
NEW: POST /boards/:id/views
NEW: GET /boards/:id/views/:viewId
NEW: PUT /boards/:id/views/:viewId
```

## 🔄 **Phase 5: Frontend Migration**

### **Route Updates:**
```typescript
// OLD Routes
/workspaces/:id/projects/:projectId/boards/:boardId

// NEW Routes  
/workspaces/:id/boards/:boardId
/workspaces/:id/boards/:boardId/table
/workspaces/:id/boards/:boardId/kanban
/workspaces/:id/boards/:boardId/chart
```

### **Component Hierarchy:**
```typescript
// OLD Component Structure
WorkspacePage
├── ProjectList
    └── ProjectPage
        └── BoardList
            └── BoardPage (Kanban only)

// NEW Component Structure  
WorkspacePage
├── BoardList
    └── BoardPage
        ├── TableView
        ├── KanbanView  
        ├── ChartView
        └── CalendarView
```

## ⚠️ **Migration Risks & Mitigation**

### **Data Loss Prevention:**
1. **Full backup** before migration
2. **Parallel testing** with both systems
3. **Rollback scripts** for each phase
4. **Data validation** after each migration step

### **Downtime Minimization:**
1. **Blue-green deployment** 
2. **Feature flags** for gradual rollout
3. **Database migrations** during low-traffic periods
4. **API versioning** for backward compatibility

## 🎯 **Success Metrics**

### **Performance:**
- Board load time < 500ms
- View switching < 200ms
- Real-time updates working

### **Functionality:**
- All data migrated successfully
- Both table and kanban views working
- Filtering, sorting, grouping functional
- User permissions maintained

### **User Experience:**
- Familiar Monday.com-like interface
- Smooth view transitions
- No data loss or corruption
- Team workflow continuity
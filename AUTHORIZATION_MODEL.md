# Project Management System - Authorization & Membership Model

## 🏗️ **Hierarchy Overview**

```
User
├── Global Roles (Role) - System-wide permissions
└── Workspace Memberships (WorkspaceMember)
    ├── Workspace-level roles (OWNER, ADMIN, MEMBER, VIEWER)
    └── Team Memberships (UserTeamRole)
        ├── Team-level roles (TEAM_ADMIN, TEAM_MEMBER)
        └── Project Access (via teams or direct assignment)
```

## 🔐 **Authorization Levels**

### **1. Global Level (Role Entity)**
- **Purpose:** System-wide administrative roles
- **Examples:** `SUPER_ADMIN`, `SYSTEM_ADMIN`, `SUPPORT`
- **Scope:** Entire application
- **Usage:** Platform management, billing, system configuration

### **2. Workspace Level (WorkspaceMember)**
- **Purpose:** Workspace-scoped permissions
- **Roles:** 
  - `OWNER` - Full workspace control
  - `ADMIN` - Manage members, teams, settings
  - `MEMBER` - Create/edit projects, join teams
  - `VIEWER` - Read-only access
- **Scope:** Single workspace
- **Inheritance:** Determines baseline permissions for teams within workspace

### **3. Team Level (UserTeamRole)**
- **Purpose:** Team-specific collaboration
- **Roles:**
  - `TEAM_ADMIN` - Manage team members, team projects
  - `TEAM_MEMBER` - Collaborate on team projects
- **Scope:** Single team
- **Prerequisite:** Must be workspace member first

## 📊 **Project Membership Model**

### **Current Implementation: Dual Membership**
Projects have TWO membership mechanisms:

#### **1. Team-Based Access (`Project.teams`)**
```typescript
// Projects assigned to teams
Project.teams: Team[] // Many-to-many relationship
```
- **Purpose:** Group-based project access
- **Logic:** All team members automatically get project access
- **Use Case:** Department/squad-based projects

#### **2. Direct Member Access (`Project.members`)**
```typescript
// Users directly invited to projects
Project.members: User[] // Many-to-many relationship
```
- **Purpose:** Ad-hoc project collaboration
- **Logic:** Specific users invited regardless of team membership
- **Use Case:** Cross-team initiatives, external consultants

### **Business Rules**
1. **Team Assignment:** When a team is assigned to a project, ALL active team members get access
2. **Direct Assignment:** Individual users can be added for specific projects
3. **Precedence:** Direct membership overrides team-based access levels
4. **Workspace Constraint:** Only workspace members can be assigned to projects

## 🎯 **Permission Flow**

### **Task Assignment Logic**
```typescript
// Valid task assignees must be:
1. Workspace members (WorkspaceMember.isActive = true)
2. AND one of:
   - Project team members (via Project.teams → UserTeamRole)
   - Direct project members (via Project.members)
   - Workspace admins/owners (elevated permissions)
```

### **Access Validation Hierarchy**
```typescript
function canAccessProject(user: User, project: Project): boolean {
  // 1. Must be workspace member
  const workspaceMember = getWorkspaceMember(user.id, project.workspaceId);
  if (!workspaceMember?.isActive) return false;
  
  // 2. Workspace owners/admins have access to all projects
  if (workspaceMember.role === 'OWNER' || workspaceMember.role === 'ADMIN') {
    return true;
  }
  
  // 3. Check direct project membership
  if (project.members.some(member => member.id === user.id)) {
    return true;
  }
  
  // 4. Check team-based access
  const userTeams = getUserTeamsByWorkspace(user.id, project.workspaceId);
  const projectTeamIds = project.teams.map(team => team.id);
  return userTeams.some(team => projectTeamIds.includes(team.id));
}
```

## 🔧 **Implementation Guidelines**

### **Service Layer Validation**
Always validate in this order:
1. **Authentication** - Valid JWT token
2. **Workspace Membership** - User is workspace member
3. **Resource Access** - User can access specific resource
4. **Action Permission** - User can perform the action

### **Database Constraints**
- Unique constraints on membership tables prevent duplicates
- Composite indexes optimize permission queries
- Soft deletes maintain audit trail
- Foreign key cascades ensure data integrity

## 🚀 **Future Enhancements**

### **Role Hierarchy Table**
```sql
CREATE TABLE role_hierarchy (
  parent_role VARCHAR(50),
  child_role VARCHAR(50),
  level INTEGER,
  PRIMARY KEY (parent_role, child_role)
);
```

### **Permission Matrix**
```sql
CREATE TABLE permission_matrix (
  role VARCHAR(50),
  resource VARCHAR(50),
  action VARCHAR(50),
  allowed BOOLEAN,
  PRIMARY KEY (role, resource, action)
);
```

### **Advanced Features**
- Time-based role assignments
- Project-specific role overrides
- Guest user temporary access
- API key-based service accounts

## ✅ **Best Practices**

1. **Always validate workspace membership first**
2. **Use service layer for complex permission logic**
3. **Log sensitive permission changes in ActivityLog**
4. **Cache permission checks for performance**
5. **Regular permission audits via activity logs**
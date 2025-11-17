# Municipality Details Page

## Overview
A comprehensive municipality details page that displays organization information, users, assistants, and settings in a tabbed interface.

## Features

### 📊 Dashboard Overview
- **Quick Stats Cards**: Active users, pending invitations, and assigned assistants count
- **Organization Header**: Name, ID, and image with navigation controls
- **Action Buttons**: Invite users and manage assistants

### 👥 Users Management
- **Active Users Tab**: Lists all organization members with roles and join dates
- **User Profiles**: Avatar, name, email, and role badges
- **Role Indicators**: Visual badges for admin/member roles

### 📧 Invitations Management
- **Pending Invitations**: Shows all outstanding invitations
- **Status Tracking**: Invitation status (pending, accepted, revoked)
- **Expiry Dates**: Shows when invitations expire
- **Invite Modal**: Easy user invitation with role selection

### 🤖 AI Assistants
- **Assigned Assistants**: Lists all AI assistants configured for the municipality
- **Assistant Details**: Name, model, type, and status
- **Assignment Management**: Assign/unassign assistants via dialog
- **Status Indicators**: Active/inactive badges

### ⚙️ Settings
- **Organization Information**: Complete org details including ID and slug
- **Statistics Summary**: Visual stats cards
- **Configuration Options**: Future extensibility for settings

## Components Used

### Main Component
- `MunicipalityDetailsView` - Main container component

### Backend Integration
- `api.superadmin.organization.getOrganizationDetails` - Fetch org details
- `api.superadmin.users.getUsersByOrganization` - Get org users
- `api.superadmin.users.getInvitedUsersByOrganization` - Get pending invites
- `api.superadmin.municipalityAssistants.getAssistantsByMunicipality` - Get assigned assistants

### UI Components
- `Tabs` - Main navigation between sections
- `Card` - Content containers
- `Badge` - Status and role indicators
- `Avatar` - User profile images
- `Dialog` - Modals for actions
- `Button` - Interactive elements

### Modals
- `InviteMunicipalityUserModal` - User invitation form
- `AssignAssistantDialog` - Assistant management interface

## File Structure
```
apps/admin/
├── app/[locale]/(main)/municipalities/[id]/
│   └── page.tsx                           # Route page
├── modules/municipality/
│   ├── ui/
│   │   └── municipalityDetailsView.tsx    # Main component
│   └── modals/
│       └── InviteMunicipalityUserModal.tsx # Invite modal
└── components/
    └── assign-assistant-dialog.tsx        # Assistant dialog
```

## Backend Functions

### Organization API
- `getOrganizationDetails(organizationId)` - Get org info from Clerk
- `getUsersByOrganization(organizationId)` - Get org members
- `getInvitedUsersByOrganization(organizationId)` - Get pending invites
- `inviteUserToOrganization(organizationId, email, role)` - Send invitation

### Assistant API
- `getAssistantsByMunicipality(municipalityId)` - Get assigned assistants
- `assignAssistantToMunicipality(municipalityId, assistantId)` - Assign assistant
- `removeAssignment(assignmentId)` - Remove assignment

## Error Handling
- Loading states with spinners
- Error states with retry options
- Empty states with helpful messages
- Form validation for user inputs

## Responsive Design
- Mobile-friendly tabs and cards
- Responsive grid layouts
- Proper spacing and typography
- Touch-friendly interactive elements

## Usage

### Navigation
```typescript
// Navigate to municipality details
router.push(`/municipalities/${organizationId}`)
```

### Props
```typescript
interface MunicipalityDetailsViewProps {
  municipalityId: string; // Organization ID from Clerk
}
```

## Future Enhancements
- User role management
- Bulk user operations
- Assistant configuration settings
- Organization settings editing
- Activity logs and audit trails
- Export functionality
- Advanced filtering and search
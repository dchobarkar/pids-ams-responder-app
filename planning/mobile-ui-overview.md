# Mobile UI Overview for Responder and Supervisor Roles

This document summarizes the current web UI for the roles targeted by the Expo app:

- `SUPERVISOR`
- `RMP`
- `QRV`
- `NPV`
- `ER`

The goal is UI parity where it helps user familiarity, while still allowing mobile-friendly navigation and native background tracking.

## Core principle

The current web app already has a clear responder and supervisor workflow split. The mobile app should keep the same information architecture, action names, and field order as much as possible.

Good parity targets:

- same main sections per role
- same action labels
- same alarm and task status vocabulary
- same details shown before a user acts
- same acknowledgement and verification inputs

Things that should adapt for mobile:

- sidebar becomes bottom tabs or a drawer
- modal-heavy flows can become bottom sheets or full-screen pages
- web push browser controls should not be copied directly
- RMP page-bound patrol tracking should become native app tracking status

## Shared shell in the web app

All targeted roles currently sit inside the same dashboard shell.

Common shell elements:

- fixed top navbar
- role-aware sidebar navigation
- notification bell in the navbar
- profile menu in the navbar
- route-loading indicator near the top edge
- profile page available from the user menu

Shared shell behavior:

- on desktop, the sidebar stays visible
- on mobile-width web screens, the sidebar becomes a toggle drawer
- notifications open as a dropdown panel on larger screens
- notifications open as a full-height sheet on smaller screens

Current shell references:

- `components/layout/DashboardShell.tsx`
- `components/layout/DashboardNavbar.tsx`
- `constants/app/navigation.ts`

## Role navigation overview

### Supervisor

Current primary sections:

- Dashboard
- Alarms
- Consolidated Alarms
- Tasks
- Assignments

Dashboard quick links:

- Alarms
- Consolidated alarms
- Tasks
- Assignments

### Responder roles

Responder roles share the same structure today:

- `RMP`
- `QRV`
- `NPV`
- `ER`

Current primary sections:

- Dashboard
- Alarms
- Consolidated Alarms
- Tasks

Dashboard quick links:

- Alarms
- Consolidated alarms
- Tasks

Important note:

- the responder UI is intentionally uniform across `RMP`, `QRV`, `NPV`, and `ER`
- only the route prefix and role label change

Current navigation references:

- `constants/app/navigation.ts`
- `constants/app/routes.ts`

## Dashboard home

The dashboard home is not a dense operational screen. It acts as a clean entry page with:

- breadcrumb using the role name
- short role-specific description
- quick-link cards for the main work areas

For mobile, this should remain a simple launcher screen, not a data-heavy dashboard.

Recommended mobile parity:

- keep the same section names and ordering
- keep a lightweight home screen with tappable cards
- do not add extra analytics cards unless the mobile workflow truly needs them

## Notifications

The current notification experience is global and lightweight.

What users see:

- bell icon in the top bar
- unread badge count
- latest unread items
- "Mark all as read"
- "View all alarms"

What happens on tap:

- the notification is marked as read
- the user is redirected to the relevant alarms page with the alarm highlighted

Current interaction pattern:

- notifications are treated as workflow shortcuts into alarms, not as a separate heavy workspace

Recommended mobile parity:

- keep notifications global
- keep unread count visible
- tapping a notification should deep-link to the relevant alarm details or alarm list state
- keep "mark all as read"

Current references:

- `components/push/NavbarNotificationBell.tsx`

## Profile

The current profile page is simple and operational.

It shows:

- name
- email
- role
- phone

It also includes:

- profile form/editing area
- browser-specific push notification device settings when applicable

Recommended mobile parity:

- show the same identity fields first
- keep profile editing lightweight
- do not copy the web-only browser push settings directly
- if mobile push is added later, use a native app notification settings section instead

Current references:

- `app/(dashboard)/profile/page.tsx`
- `app/(dashboard)/profile/_components/ProfileDetailsContent.tsx`
- `app/(dashboard)/profile/_components/PushNotificationDeviceSettings.tsx`

## Responder alarms UI

The responder alarms screen is a table-first list with lightweight actions.

Current responder alarm behaviors:

- optional filter panel toggled by a Filters button
- alarm list shown in a table
- notification-linked alarms can be auto-highlighted in the list
- row actions include viewing details
- responders can self-assign where allowed
- responders can open the acknowledge flow

Current responder alarm detail pattern:

- details open in a modal
- important fields are shown in a compact vertical detail layout
- acknowledgement history is visible when present
- directions button opens external maps

Recommended mobile parity:

- use a list screen instead of a data table layout
- keep filter access lightweight, likely via a sheet
- keep the same actions: view details, self-assign, acknowledge
- keep the same field order inside alarm details
- keep directions as a first-class CTA

Current references:

- `app/(dashboard)/_components/alarms/ResponderAlarmsClient.tsx`
- `app/(dashboard)/_components/alarms/ResponderAlarmDetailsModal.tsx`
- `app/(dashboard)/_components/alarms/AlarmDetailsModal.tsx`

## Responder acknowledgement flow

The current acknowledgement flow is a modal.

Inputs:

- remarks
- optional image evidence

Important behavior:

- empty acknowledgements are not allowed
- evidence capture uses camera-friendly file input
- multiple images are allowed up to the configured cap
- responder comment fields now support speech-to-text

UX cues already present:

- acknowledgement does not change final alarm ownership by itself
- the form clearly explains that it captures early field input

Recommended mobile parity:

- keep this as a focused form screen or bottom sheet
- keep the same field order: remarks first, evidence second
- keep speech-to-text for remarks
- keep camera capture primary

Current reference:

- `app/(dashboard)/_components/alarms/ResponderAcknowledgeAlarmModal.tsx`

## Responder tasks UI

The responder tasks page is the user's actionable worklist.

Current behavior:

- assignments are shown in a table
- empty state appears when there is no work
- row actions include viewing task details
- assignments can be accepted
- after verification submission, the page shows a success banner and the task drops from the actionable list

Current task detail pattern:

- opens in a modal
- shows alarm code, chainage, km value, type, criticality, status, incident time, coordinates, creator, acknowledger, assignee, accepted time, attempts, and SLA
- includes earlier acknowledgements if available
- includes a directions CTA

Recommended mobile parity:

- treat Tasks as the primary responder work surface
- use a card/list view rather than a table
- keep Accept as a primary visible action
- keep Details and Verify easily reachable from each task
- preserve the current detail field sequence

Current references:

- `app/(dashboard)/_components/worklists/ResponderTasksPage.tsx`
- `app/(dashboard)/_components/worklists/ResponderTasksClient.tsx`
- `app/(dashboard)/_components/worklists/ResponderTaskDetailsModal.tsx`

## Responder verification flow

Verification is currently a dedicated page, not just a modal.

Current steps:

- capture current location
- add remarks
- add image evidence
- submit verification

Current UX details:

- the page explains that an operator will review the submission
- earlier acknowledgements are shown above the form when available
- speech-to-text is enabled for remarks
- evidence capture is camera-first
- on success, the user is taken back to Tasks with a confirmation banner

Recommended mobile parity:

- keep verification as a dedicated screen
- keep location capture at the top
- keep remarks and evidence below it
- keep earlier acknowledgements visible for context
- keep the same success flow back to Tasks

Current references:

- `app/(dashboard)/_components/worklists/ResponderTaskVerifyPage.tsx`
- `app/(dashboard)/_components/worklists/ResponderVerifyAlarmForm.tsx`

## Supervisor alarms UI

Supervisor alarms are broader than responder alarms because the supervisor can both monitor and take action.

Current supervisor alarm screen includes:

- summary cards at the top
  - visible alarms
  - needs assignment
  - assigned to me
- always-visible filters
- alarms table
- details modal
- assign/reassign flow
- acknowledge flow
- self-assign flow

Recommended mobile parity:

- keep the screen broader than responder alarms
- preserve assignment-focused actions
- keep top summary context, but compress it into small KPI cards or chips
- keep alarm details and assignment actions close to each alarm item

Current references:

- `app/(dashboard)/_components/alarms/SupervisorAlarmsClient.tsx`
- `app/(dashboard)/_components/alarms/SupervisorAssignAlarmModal.tsx`
- `app/(dashboard)/_components/alarms/AlarmDetailsModal.tsx`

## Supervisor assignment flow

The current supervisor assign modal supports both delegation and self-ownership.

Current capabilities:

- fetch eligible assignees for the alarm
- assign to a selected responder
- reassign accepted or false-verified work back into the assignment flow
- quick action to assign the alarm to self

Recommended mobile parity:

- keep both actions visible:
  - choose assignee
  - assign to me
- preserve the distinction between first-time assignment and reassignment
- keep assignee selection as a simple searchable or selectable list

Current reference:

- `app/(dashboard)/_components/alarms/SupervisorAssignAlarmModal.tsx`

## Supervisor tasks and assignments

Supervisor work is split across two pages today.

### Supervisor Tasks

Purpose:

- tasks directly assigned to the supervisor for action

Current behavior:

- table of actionable assignments
- accept action
- details modal
- same verification success banner pattern used for responders

### Supervisor Assignments

Purpose:

- monitor all assignments inside the supervisor's chainages

Current behavior:

- top summary cards
  - assigned to me
  - need action
  - pending review
- table for all assignments in coverage area
- "Open my tasks" shortcut when relevant
- details modal for the linked alarm

Recommended mobile parity:

- keep Tasks and Assignments as separate supervisor sections
- Tasks should stay action-first
- Assignments should stay monitoring-first
- the app should not merge these unless there is a very strong UX reason

Current references:

- `app/(dashboard)/_components/worklists/SupervisorTasksClient.tsx`
- `app/(dashboard)/_components/worklists/SupervisorAssignmentsPage.tsx`
- `app/(dashboard)/supervisor/assignments/_components/SupervisorAssignmentsClient.tsx`
- `app/(dashboard)/_components/worklists/SupervisorTaskVerifyPage.tsx`

## Consolidated alarms

Both supervisors and responders currently have a Consolidated Alarms section.

Operational meaning:

- this is history-oriented
- it is broader than the main active alarms view

Responder intent:

- alarms the responder has personally touched

Supervisor intent:

- alarms in the supervisor's chainages across statuses

Recommended mobile parity:

- keep this as a separate history-style tab or page
- do not merge it into active alarms

## Patrol tracking

The current web shell includes a patrol tracker component, but it is only active for `RMP`.

Important current behavior:

- this is session-based
- it starts and stops tracking
- it syncs queued points while the web app is open
- it is tied to browser/geolocation constraints

For the mobile app:

- this should become a native tracking status surface
- it should not be copied literally from the web
- the app should still preserve the same mental model:
  - active session
  - current tracking state
  - pending/offline point awareness
  - start and stop controls

Current reference:

- `components/tracking/RmpPatrolTracker.tsx`

## Recommended mobile parity checklist

These should stay the same if possible:

- section names: Alarms, Consolidated Alarms, Tasks, Assignments
- action names: Assign, Assign to me, Self-assign, Acknowledge, Accept, Verify
- alarm detail field order
- task detail field order
- acknowledgement inputs
- verification inputs
- notification deep-link behavior
- directions action

These should adapt for mobile:

- sidebar into tabs or a drawer
- modals into sheets or full pages
- browser push settings into native notification settings later
- RMP web patrol tracker into native background-tracking status UI
- table-heavy screens into list/card views

## Suggested first mobile navigation shape

### Responder roles

- Home
- Alarms
- Tasks
- Consolidated
- Profile

### Supervisor

- Home
- Alarms
- Tasks
- Assignments
- Consolidated
- Profile

Notifications should stay global rather than becoming a full primary tab unless product direction changes later.

## Source references

Main sources used for this overview:

- `constants/app/navigation.ts`
- `constants/app/routes.ts`
- `components/layout/DashboardShell.tsx`
- `components/layout/DashboardNavbar.tsx`
- `components/push/NavbarNotificationBell.tsx`
- `components/tracking/RmpPatrolTracker.tsx`
- `app/(dashboard)/_components/alarms/TierAlarmsPage.tsx`
- `app/(dashboard)/_components/alarms/ResponderAlarmsClient.tsx`
- `app/(dashboard)/_components/alarms/SupervisorAlarmsClient.tsx`
- `app/(dashboard)/_components/alarms/ResponderAcknowledgeAlarmModal.tsx`
- `app/(dashboard)/_components/alarms/SupervisorAssignAlarmModal.tsx`
- `app/(dashboard)/_components/worklists/ResponderTasksClient.tsx`
- `app/(dashboard)/_components/worklists/ResponderTaskDetailsModal.tsx`
- `app/(dashboard)/_components/worklists/ResponderTaskVerifyPage.tsx`
- `app/(dashboard)/_components/worklists/ResponderVerifyAlarmForm.tsx`
- `app/(dashboard)/_components/worklists/SupervisorTasksClient.tsx`
- `app/(dashboard)/_components/worklists/SupervisorAssignmentsPage.tsx`
- `app/(dashboard)/supervisor/assignments/_components/SupervisorAssignmentsClient.tsx`
- `app/(dashboard)/_components/worklists/SupervisorTaskVerifyPage.tsx`
- `app/(dashboard)/profile/_components/ProfileDetailsContent.tsx`

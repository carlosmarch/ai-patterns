"use client";

import { InviteMembers } from "./component";

const ROLES = [
  { id: "viewer", label: "Viewer" },
  { id: "editor", label: "Editor" },
  { id: "admin", label: "Admin" },
];

const ORG_MEMBERS = [
  { id: "u1", name: "Alex Rivera", email: "alex.rivera@acme.com" },
  { id: "u2", name: "Jamie Chen", email: "jamie.chen@acme.com" },
  { id: "u3", name: "Morgan Patel", email: "morgan.patel@acme.com" },
  { id: "u4", name: "Sam Torres", email: "sam.torres@acme.com" },
  { id: "u5", name: "Taylor Kim", email: "taylor.kim@acme.com" },
];

const INITIAL_ASSIGNEES = [
  {
    id: "u1",
    name: "Alex Rivera",
    email: "alex.rivera@acme.com",
    status: "confirmed" as const,
    roleId: "editor",
  },
  {
    id: "u2",
    name: "Jamie Chen",
    email: "jamie.chen@acme.com",
    status: "awaiting" as const,
    roleId: "viewer",
  },
  {
    id: "ext1",
    name: "consultant@partner.com",
    email: "consultant@partner.com",
    status: "invited" as const,
    roleId: "viewer",
  },
];

export default function InviteMembersDemo() {
  return (
    <InviteMembers
      roles={ROLES}
      orgMembers={ORG_MEMBERS}
      initialAssignees={INITIAL_ASSIGNEES}
      defaultMessage="I'd like you to collaborate on this project."
    />
  );
}

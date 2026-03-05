import { NavLink } from "react-router-dom";

const menu = [
  { label: "Dashboard", to: "/citizen" },
  { label: "File Complaint", to: "/citizen/file-complaint" },
  { label: "My Complaints", to: "/citizen/my-complaints" },
  { label: "Upvoted Issues", to: "/citizen/upvoted-issues" },
  { label: "Profile Settings", to: "/citizen/profile" }
];

export default function CitizenSidebar() {
  return (
    <aside className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-civic md:w-64">
      <div className="mb-4 text-sm font-bold text-civic-navy">Citizen Workspace</div>
      <div className="space-y-1">
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/citizen"}
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 text-sm ${isActive ? "bg-civic-blue text-white" : "text-slate-700 hover:bg-slate-100"}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}

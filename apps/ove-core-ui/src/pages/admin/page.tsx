import { SidebarProvider } from "@ove/ui-base-components";
import AdminSidebar from "./sidebar";
import { type AdminView, useAdminStore } from "./store";
import CreateUser from "./users/create";
import UserOverview from "./users/overview";
import GeneralOverview from "./general/overview";
import TaskDashboard from "./formatter/task-dashboard";

const getContent = (view: AdminView)=> {
  switch (view) {
    case "overview":
      return <GeneralOverview />;
    case "create-user":
      return <CreateUser />;
    case "user-overview":
      return <UserOverview />;
    case "data-formatter":
      return <TaskDashboard />;
  }
};

const AdminPage = () => {
  const view = useAdminStore((store) => store.view);
  return (
      <SidebarProvider className="flex flex-row">
        <AdminSidebar />
        {getContent(view)}
      </SidebarProvider>
  );
};

export default AdminPage;

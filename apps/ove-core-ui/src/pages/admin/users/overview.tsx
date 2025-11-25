import { api } from "../../../utils/api";

const UserOverview = () => {
  const getUsers = api.admin.getUsers.useQuery();
  return <main>
    <h1>Users</h1>
    <div className="grid grid-cols-4">
      {getUsers.status === "success" && getUsers.data.map(user => (
        <div key={user.id} className="border border-gray-300 p-2">
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
        </div>
      ))}
    </div>
  </main>;
};

export default UserOverview;

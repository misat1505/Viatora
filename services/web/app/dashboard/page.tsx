import { getCurrentUser } from '@/actions/get-current-user';

const DashboardPage = async () => {
  const user = await getCurrentUser();

  return (
    <div>
      {JSON.stringify(user, null, 2)}
      <div>Name: {user.displayName}</div>
    </div>
  );
};

export default DashboardPage;

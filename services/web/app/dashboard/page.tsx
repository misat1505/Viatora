import { getCurrentUser } from '@/actions/get-current-user';
import GoogleOAuthLink from '@/components/google-oauth-link';
import LogoutButton from '@/components/logout-button';
import { UnauthorizedError } from '@/utils/error';

export const dynamic = 'force-dynamic';

const DashboardPage = async () => {
  const [error, userData] = await getCurrentUser();

  if (error instanceof UnauthorizedError) {
    return (
      <div>
        <p>Login to use this feature.</p>
        <GoogleOAuthLink>Login with Google</GoogleOAuthLink>
      </div>
    );
  }

  if (error) {
    throw error;
  }

  return (
    <div>
      {JSON.stringify(userData.user, null, 2)}
      <div>Name: {userData.user.displayName}</div>

      <LogoutButton>Log out</LogoutButton>
    </div>
  );
};

export default DashboardPage;

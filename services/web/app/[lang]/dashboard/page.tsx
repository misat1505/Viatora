import { getCurrentUser } from '@/actions/get-current-user';
import GoogleOAuthLink from '@/components/google-oauth-link';
import LogoutButton from '@/components/logout-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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

  const user = userData.user;

  return (
    <Card className="mx-auto w-full max-w-xl">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="size-16">
          <AvatarImage src={user.avatarUrl} />
          <AvatarFallback>{user.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <CardTitle className="text-2xl">{user.displayName}</CardTitle>

          <CardDescription>{user.email}</CardDescription>
        </div>

        <Badge variant={user.isActive ? 'default' : 'secondary'}>
          {user.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </CardHeader>

      <Separator />

      <CardContent className="space-y-6 pt-6">
        <dl className="grid grid-cols-[140px_1fr] gap-x-4 gap-y-3 text-sm">
          <dt className="text-muted-foreground">User ID</dt>
          <dd className="font-mono break-all">{user.userId}</dd>

          <dt className="text-muted-foreground">Email</dt>
          <dd>{user.email}</dd>

          <dt className="text-muted-foreground">Created</dt>
          <dd>{new Date(user.createdAt).toLocaleString()}</dd>

          <dt className="text-muted-foreground">Last login</dt>
          <dd>{new Date(user.lastLoginAt).toLocaleString()}</dd>
        </dl>

        <Separator />

        <div className="flex justify-end">
          <LogoutButton>Log out</LogoutButton>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardPage;

import GoogleOAuthLink from '@/components/google-oauth-link';
import LocaleText from '@/components/locale-text';

const RegisterPage = async () => {
  return (
    <GoogleOAuthLink redirect="/dashboard">
      <LocaleText k="register.register-with-google" />
    </GoogleOAuthLink>
  );
};

export default RegisterPage;

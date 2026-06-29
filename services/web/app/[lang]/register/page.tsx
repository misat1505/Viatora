import GoogleOAuthLink from '@/components/google-oauth-link';
import LocaleText from '@/components/locale-text';

const RegisterPage = async () => {
  return (
    <GoogleOAuthLink redirect="/dashboard">
      <LocaleText k="translations.register.register-with-google" />
    </GoogleOAuthLink>
  );
};

export default RegisterPage;

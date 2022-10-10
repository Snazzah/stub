import { default as LoginLinkEmail } from '../LoginLink';

export function LoginLink() {
  return (
    <LoginLinkEmail url="http://app.localhost:3000/api/auth/callback/email?callbackUrl=http%3A%2F%2Fapp.localhost%3A3000%2Flogin&token=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx&email=youremail@gmail.com" />
  );
}

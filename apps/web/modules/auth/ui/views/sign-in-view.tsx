import { SignIn } from "@clerk/nextjs";

export const SignInView = () => {
  return (  
    <SignIn 
      routing="hash" 
      withSignUp={false}
      signUpUrl=""
    />
  );
};
import LoginCard from "@/components/LoginCards";
import GoogleButton from "@/components/SignIn";

export default function LoginPage() {


  return (
    <div className="flex items-center justify-center min-h-screen bg-cream">

        <LoginCard >
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Login
          </h2>
          <GoogleButton />
        </LoginCard>
        
        


    </div>
  );
}

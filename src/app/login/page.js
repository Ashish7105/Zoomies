import LoginCard from "@/components/LoginCards";
import HeroLogin from "@/components/HeroLogin";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-cream">
      <LoginCard>
        <HeroLogin />
      </LoginCard>
    </div>
  );
}

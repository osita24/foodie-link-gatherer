import { Loader2 } from "lucide-react";

interface UserGreetingProps {
  userName: string;
  isLoadingProfile: boolean;
}

const UserGreeting = ({ userName, isLoadingProfile }: UserGreetingProps) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-secondary font-serif animate-fade-up">
      {isLoadingProfile ? (
        <span className="flex items-center justify-center gap-3">
          Loading... <Loader2 className="w-8 h-8 animate-spin" />
        </span>
      ) : (
        `${getGreeting()}, ${userName}! 👋`
      )}
    </h1>
  );
};

export default UserGreeting;
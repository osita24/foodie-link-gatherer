interface AuthHeaderProps {
  isSignUp: boolean;
}

const AuthHeader = ({ isSignUp }: AuthHeaderProps) => {
  return (
    <div className="text-center">
      <div className="inline-block p-3 bg-primary/10 rounded-full mb-3">
        <svg 
          className="w-6 h-6 text-primary"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-secondary">
        {isSignUp ? "Create your account" : "Welcome back"}
      </h2>
      <p className="text-sm text-muted-foreground mt-2">
        {isSignUp 
          ? "Join Cilantro to discover and save your favorite restaurants" 
          : "Sign in to continue your culinary journey"}
      </p>
    </div>
  );
};

export default AuthHeader;
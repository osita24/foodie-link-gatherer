import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface AuthFormProps {
  isSignUp: boolean;
  isLoading: boolean;
  onSubmit: (email: string, password: string) => void;
  onToggleMode: () => void;
}

const AuthForm = ({ isSignUp, isLoading, onSubmit, onToggleMode }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder={isSignUp ? "Create a secure password" : "Enter your password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full"
          minLength={6}
        />
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </span>
        ) : (
          isSignUp ? "Create account" : "Sign in"
        )}
      </Button>

      <div className="text-center text-sm">
        <button
          type="button"
          onClick={onToggleMode}
          className="text-primary hover:text-primary/80 transition-colors"
        >
          {isSignUp 
            ? "Already have an account? Sign in" 
            : "New to Cilantro? Create an account"}
        </button>
      </div>
    </form>
  );
};

export default AuthForm;
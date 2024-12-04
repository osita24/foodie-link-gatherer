import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed w-full top-0 bg-white/80 backdrop-blur-sm z-50 border-b border-gray-100">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-primary">FindDine</span>
          </div>
          
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-text-primary hover:text-primary transition-colors">Features</a>
            <a href="#testimonials" className="text-text-primary hover:text-primary transition-colors">Testimonials</a>
            <a href="#faq" className="text-text-primary hover:text-primary transition-colors">FAQ</a>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              Try for free
            </Button>
          </nav>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 md:hidden">
              <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
                <a href="#features" className="text-text-primary hover:text-primary transition-colors py-2">Features</a>
                <a href="#testimonials" className="text-text-primary hover:text-primary transition-colors py-2">Testimonials</a>
                <a href="#faq" className="text-text-primary hover:text-primary transition-colors py-2">FAQ</a>
                <Button className="bg-primary hover:bg-primary/90 text-white w-full">
                  Try for free
                </Button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
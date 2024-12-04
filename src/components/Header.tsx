import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="fixed w-full top-0 bg-white/80 backdrop-blur-sm z-50 border-b border-gray-100">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-2xl font-bold text-primary">FindDine</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-text-primary hover:text-primary transition-colors">Features</a>
          <a href="#testimonials" className="text-text-primary hover:text-primary transition-colors">Testimonials</a>
          <a href="#faq" className="text-text-primary hover:text-primary transition-colors">FAQ</a>
        </nav>
        <Button className="bg-primary hover:bg-primary/90 text-white">
          Try for free
        </Button>
      </div>
    </header>
  );
};

export default Header;
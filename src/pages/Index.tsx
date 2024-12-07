import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import FAQ from "@/components/FAQ";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16"> {/* Reduced padding-top for mobile */}
        <Hero />
        <Features />
        <FAQ />
      </main>
      <footer className="bg-secondary text-white py-8 md:py-12 mt-12 md:mt-20">
        <div className="container mx-auto px-4 md:px-6">
          <p className="text-center text-white/80">© 2024 FindDine. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
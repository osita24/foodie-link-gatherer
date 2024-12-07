import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import FAQ from "@/components/FAQ";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20"> {/* Added padding-top to account for fixed header */}
        <Hero />
        <Features />
        <FAQ />
      </main>
      <footer className="bg-secondary text-white py-12 mt-20"> {/* Increased padding and margin */}
        <div className="container mx-auto px-6"> {/* Increased horizontal padding */}
          <p className="text-center text-white/80">© 2024 FindDine. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
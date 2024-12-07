import { Smartphone, Utensils, Target, Star, Clock, Leaf } from "lucide-react";

const Features = () => {
  return (
    <section id="features" className="py-12 md:py-20 bg-gradient-to-b from-accent/30 to-background overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-secondary mb-8 md:mb-12 animate-fade-up">
          Why You'll Love FindDine
        </h2>
        <div className="grid md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          {[
            {
              icon: <Smartphone className="w-5 h-5 md:w-6 md:h-6 text-white" />,
              title: "Quick Import",
              description: "Just paste a Google Maps link and we'll do the rest",
              gradient: "from-primary/80 to-primary"
            },
            {
              icon: <Star className="w-5 h-5 md:w-6 md:h-6 text-white" />,
              title: "Smart Match",
              description: "Get personalized scores based on your preferences",
              gradient: "from-secondary/90 to-secondary"
            },
            {
              icon: <Utensils className="w-5 h-5 md:w-6 md:h-6 text-white" />,
              title: "Menu Analysis",
              description: "AI highlights dishes you're most likely to enjoy",
              gradient: "from-primary/80 to-secondary"
            },
            {
              icon: <Leaf className="w-5 h-5 md:w-6 md:h-6 text-white" />,
              title: "Dietary Aware",
              description: "Considers your restrictions and preferences",
              gradient: "from-secondary/90 to-primary"
            },
            {
              icon: <Target className="w-5 h-5 md:w-6 md:h-6 text-white" />,
              title: "Perfect Picks",
              description: "Find dishes that match your taste profile",
              gradient: "from-primary/80 to-secondary"
            },
            {
              icon: <Clock className="w-5 h-5 md:w-6 md:h-6 text-white" />,
              title: "Save Time",
              description: "Skip the menu browsing, we'll highlight the best picks",
              gradient: "from-secondary/90 to-primary"
            }
          ].map((feature, index) => (
            <div 
              key={index} 
              className="relative group animate-fade-up"
              style={{ 
                animationDelay: `${index * 100}ms`,
                transform: "translateY(0px)",
                transition: "all 0.3s ease-out"
              }}
            >
              <div 
                className={`relative h-full bg-gradient-to-br ${feature.gradient} rounded-xl p-4 md:p-6 shadow-md 
                  hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1`}
              >
                <div 
                  className="w-10 h-10 md:w-12 md:h-12 mb-4 bg-white/10 rounded-full flex items-center justify-center 
                    backdrop-blur-sm transform group-hover:scale-110 transition-transform duration-300"
                >
                  {feature.icon}
                </div>
                <h3 className="text-base md:text-lg font-semibold mb-2 text-white">
                  {feature.title}
                </h3>
                <p className="text-sm text-white/90">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
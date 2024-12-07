import { Smartphone, Utensils, Target } from "lucide-react";

const Features = () => {
  return (
    <section id="features" className="py-12 md:py-24 bg-gradient-to-b from-accent/30 to-background overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-secondary mb-10 md:mb-16 animate-fade-up">
          Smart Dining Decisions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: <Smartphone className="w-6 h-6 md:w-8 md:h-8 text-white" />,
              title: "Easy Import",
              description: "Simply paste the Google Maps link and we'll automatically analyze the restaurant's complete profile.",
              gradient: "from-primary/80 to-primary"
            },
            {
              icon: <Utensils className="w-6 h-6 md:w-8 md:h-8 text-white" />,
              title: "Menu Highlights",
              description: "Our AI analyzes menus to highlight dishes that match your taste preferences and dietary requirements.",
              gradient: "from-secondary/90 to-secondary"
            },
            {
              icon: <Target className="w-6 h-6 md:w-8 md:h-8 text-white" />,
              title: "Perfect Match Score",
              description: "Get a personalized compatibility score based on your preferences, previous likes, and dining style.",
              gradient: "from-primary/80 to-secondary"
            }
          ].map((feature, index) => (
            <div 
              key={index} 
              className="relative group animate-fade-up"
              style={{ 
                animationDelay: `${index * 150}ms`,
                transform: "translateY(0px)",
                transition: "all 0.5s ease-out"
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-90 rounded-xl shadow-lg transform group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-300"></div>
              <div 
                className={`relative h-full bg-gradient-to-br ${feature.gradient} rounded-xl p-6 md:p-8 shadow-lg 
                  hover:shadow-2xl transition-all duration-300`}
              >
                <div 
                  className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center 
                    backdrop-blur-sm transform group-hover:rotate-12 transition-transform duration-300"
                >
                  {feature.icon}
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-3 text-white text-center">
                  {feature.title}
                </h3>
                <p className="text-sm md:text-base text-white/90 text-center">
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
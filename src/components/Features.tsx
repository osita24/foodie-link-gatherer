import { Smartphone, List, Calendar } from "lucide-react";

const Features = () => {
  return (
    <section id="features" className="py-24 bg-gradient-to-b from-accent/30 to-background">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-secondary mb-16 animate-fade-up">
          Discover Amazing Features
        </h2>
        <div className="grid md:grid-cols-3 gap-12">
          {[
            {
              icon: <Smartphone className="w-8 h-8 text-white" />,
              title: "Easy Import",
              description: "Simply paste the Google Maps link and we'll automatically import all restaurant details instantly.",
              gradient: "from-primary/80 to-primary"
            },
            {
              icon: <List className="w-8 h-8 text-white" />,
              title: "Smart Collections",
              description: "Organize your favorite spots by cuisine, location, or occasion with intelligent categorization.",
              gradient: "from-secondary/90 to-secondary"
            },
            {
              icon: <Calendar className="w-8 h-8 text-white" />,
              title: "Visit Planning",
              description: "Schedule your dining adventures and never miss a reservation with smart reminders.",
              gradient: "from-primary/80 to-secondary"
            }
          ].map((feature, index) => (
            <div 
              key={index} 
              className="relative group hover:-translate-y-2 transition-transform duration-300 animate-fade-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-90 rounded-xl shadow-lg transform group-hover:scale-105 transition-transform duration-300"></div>
              <div className={`relative h-full bg-gradient-to-br ${feature.gradient} rounded-xl p-8 shadow-lg`}>
                <div className="w-16 h-16 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                <p className="text-white/90">
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
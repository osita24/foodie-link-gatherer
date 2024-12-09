import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-20 bg-accent/20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-secondary mb-16 animate-fade-up">
          Trusted by food lovers everywhere
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "Sarah Chen",
              role: "Food Blogger",
              image: "https://i.pravatar.cc/150?img=1",
              text: "This app has completely changed how I organize my restaurant wishlist. So simple yet so powerful!"
            },
            {
              name: "Mike Johnson",
              role: "Food Enthusiast",
              image: "https://i.pravatar.cc/150?img=2",
              text: "I love how easy it is to import restaurants. No more screenshots or forgotten bookmarks!"
            },
            {
              name: "Lisa Rodriguez",
              role: "Restaurant Critic",
              image: "https://i.pravatar.cc/150?img=3",
              text: "The best tool I've found for keeping track of restaurants I want to visit. Highly recommended!"
            }
          ].map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 animate-fade-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="relative">
                <p className="text-gray-600 mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback className="bg-primary/5">{testimonial.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
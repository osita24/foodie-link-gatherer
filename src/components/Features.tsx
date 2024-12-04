import { Smartphone, List, Calendar } from "lucide-react";

const Features = () => {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-secondary mb-16">
          Everything you need to manage your dining experiences
        </h2>
        <div className="grid md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-accent rounded-full flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-4">Easy Import</h3>
            <p className="text-gray-600">
              Simply paste the Google Maps link and we'll automatically import all restaurant details.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-accent rounded-full flex items-center justify-center">
              <List className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-4">Organize Collections</h3>
            <p className="text-gray-600">
              Create custom lists to organize your favorite spots by cuisine, location, or occasion.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-accent rounded-full flex items-center justify-center">
              <Calendar className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-4">Plan Visits</h3>
            <p className="text-gray-600">
              Schedule your visits and get reminders about your upcoming restaurant plans.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
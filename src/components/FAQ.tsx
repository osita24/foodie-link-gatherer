import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  return (
    <section id="faq" className="py-12 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-secondary mb-8 md:mb-12">
          Frequently Asked Questions
        </h2>
        <Accordion type="single" collapsible className="space-y-3">
          <AccordionItem value="item-1" className="border rounded-lg px-3 md:px-4">
            <AccordionTrigger className="text-base md:text-lg hover:text-primary transition-colors py-4 md:py-5">
              How do I import a restaurant?
            </AccordionTrigger>
            <AccordionContent className="text-sm md:text-base text-muted-foreground pb-4">
              Simply copy the Google Maps link of the restaurant you want to import and paste it into the import field. We'll automatically extract all the relevant information.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2" className="border rounded-lg px-3 md:px-4">
            <AccordionTrigger className="text-base md:text-lg hover:text-primary transition-colors py-4 md:py-5">
              What information is imported?
            </AccordionTrigger>
            <AccordionContent className="text-sm md:text-base text-muted-foreground pb-4">
              We import the restaurant's name, address, phone number, website, photos, reviews, and more - everything you need to keep track of your dining options.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3" className="border rounded-lg px-3 md:px-4">
            <AccordionTrigger className="text-base md:text-lg hover:text-primary transition-colors py-4 md:py-5">
              Is this service free?
            </AccordionTrigger>
            <AccordionContent className="text-sm md:text-base text-muted-foreground pb-4">
              Yes! The basic features are completely free to use. We also offer a premium plan with additional features for power users.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
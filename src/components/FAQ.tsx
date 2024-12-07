import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  return (
    <section id="faq" className="py-20 md:py-32 bg-white px-4"> {/* Increased padding */}
      <div className="container mx-auto max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-secondary mb-12 md:mb-16 px-4"> {/* Adjusted spacing */}
          Frequently Asked Questions
        </h2>
        <Accordion type="single" collapsible className="space-y-4"> {/* Added vertical spacing between items */}
          <AccordionItem value="item-1" className="border rounded-xl px-2"> {/* Added rounded corners and padding */}
            <AccordionTrigger className="text-lg hover:text-primary transition-colors py-6">How do I import a restaurant?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-6">
              Simply copy the Google Maps link of the restaurant you want to import and paste it into the import field. We'll automatically extract all the relevant information.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2" className="border rounded-xl px-2">
            <AccordionTrigger className="text-lg hover:text-primary transition-colors py-6">What information is imported?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-6">
              We import the restaurant's name, address, phone number, website, photos, reviews, and more - everything you need to keep track of your dining options.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3" className="border rounded-xl px-2">
            <AccordionTrigger className="text-lg hover:text-primary transition-colors py-6">Is this service free?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-6">
              Yes! The basic features are completely free to use. We also offer a premium plan with additional features for power users.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
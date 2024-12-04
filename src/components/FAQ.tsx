import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  return (
    <section id="faq" className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-secondary mb-16">
          Frequently Asked Questions
        </h2>
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>How do I import a restaurant?</AccordionTrigger>
            <AccordionContent>
              Simply copy the Google Maps link of the restaurant you want to import and paste it into the import field. We'll automatically extract all the relevant information.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>What information is imported?</AccordionTrigger>
            <AccordionContent>
              We import the restaurant's name, address, phone number, website, photos, reviews, and more - everything you need to keep track of your dining options.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Is this service free?</AccordionTrigger>
            <AccordionContent>
              Yes! The basic features are completely free to use. We also offer a premium plan with additional features for power users.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
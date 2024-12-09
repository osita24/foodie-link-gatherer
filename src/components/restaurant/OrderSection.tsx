import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const OrderSection = () => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 mt-6">
      <CardHeader>
        <CardTitle>Order Now</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {[
          { name: "OpenTable", link: "#" },
          { name: "DoorDash", link: "#" },
          { name: "Uber Eats", link: "#" }
        ].map((platform) => (
          <Button
            key={platform.name}
            variant="outline"
            className="w-full justify-between hover:bg-primary/5"
            asChild
          >
            <a href={platform.link} target="_blank" rel="noopener noreferrer">
              {platform.name}
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default OrderSection;
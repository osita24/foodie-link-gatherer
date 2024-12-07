import { ExternalLink, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface OrderSectionProps {
  website?: string;
}

const OrderSection = ({ website }: OrderSectionProps) => {
  const platforms = [
    { name: "OpenTable", link: "#" },
    { name: "DoorDash", link: "#" },
    { name: "Uber Eats", link: "#" }
  ];

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Order & Contact</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {platforms.map((platform) => (
          <Button
            key={platform.name}
            variant="outline"
            className={cn(
              "w-full justify-between group transition-colors",
              "hover:bg-primary/5 hover:border-primary/20"
            )}
            asChild
          >
            <a href={platform.link} target="_blank" rel="noopener noreferrer">
              {platform.name}
              <ExternalLink className="w-4 h-4 group-hover:text-primary" />
            </a>
          </Button>
        ))}
        
        {website && (
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between group transition-colors mt-2",
              "hover:bg-primary/5 hover:border-primary/20"
            )}
            asChild
          >
            <a href={website} target="_blank" rel="noopener noreferrer">
              Visit Website
              <Globe className="w-4 h-4 group-hover:text-primary" />
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderSection;
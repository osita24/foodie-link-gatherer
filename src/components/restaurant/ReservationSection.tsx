import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ReservationSectionProps {
  website?: string;
}

const ReservationSection = ({ website }: ReservationSectionProps) => {
  if (!website) return null;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-4">
        <Button
          variant="outline"
          className="w-full justify-between hover:bg-primary/5"
          asChild
        >
          <a href={website} target="_blank" rel="noopener noreferrer">
            Book a Table
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ReservationSection;
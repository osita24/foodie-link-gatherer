import { Clock, UtensilsCrossed } from "lucide-react";

interface ServiceOptionsProps {
  delivery?: boolean;
  takeout?: boolean;
  dineIn?: boolean;
  reservable?: boolean;
}

const ServiceOptions = ({ delivery, takeout, dineIn, reservable }: ServiceOptionsProps) => {
  console.log("Service options:", { delivery, takeout, dineIn, reservable });
  
  const hasAnyOption = delivery || takeout || dineIn || reservable;
  
  if (!hasAnyOption) return null;

  return (
    <div className="flex flex-wrap gap-2 text-sm text-gray-600">
      {delivery && (
        <span className="inline-flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          Delivery
        </span>
      )}
      {takeout && (
        <span className="inline-flex items-center gap-1.5">
          <UtensilsCrossed className="w-4 h-4" />
          Takeout
        </span>
      )}
      {dineIn && (
        <span className="inline-flex items-center gap-1.5">
          <UtensilsCrossed className="w-4 h-4" />
          Dine-in
        </span>
      )}
      {reservable && (
        <span className="inline-flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          Reservations
        </span>
      )}
    </div>
  );
};

export default ServiceOptions;
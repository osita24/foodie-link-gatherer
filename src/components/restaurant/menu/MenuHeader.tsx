import { Link } from "lucide-react";

interface MenuHeaderProps {
  menuUrl?: string;
}

const MenuHeader = ({ menuUrl }: MenuHeaderProps) => {
  if (!menuUrl) return null;

  return (
    <div className="flex items-center justify-end gap-2 p-4 border-b">
      <Link className="w-4 h-4" />
      <a
        href={menuUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        View Original Menu
      </a>
    </div>
  );
};

export default MenuHeader;
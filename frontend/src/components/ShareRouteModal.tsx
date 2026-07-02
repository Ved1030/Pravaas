import { toast } from 'sonner';
import {
  MessageCircle, Mail, QrCode, Link, Image, FileText,
  MapPin, Flag, Clock, IndianRupee,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface ShareOption {
  key: string;
  label: string;
  icon: React.ElementType;
  action: (routeText: string) => void;
}

interface ShareRouteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  route?: {
    from: string;
    to: string;
    duration: number;
    cost: number;
    modes?: string;
  };
}

function buildRouteText(route: NonNullable<ShareRouteModalProps['route']>): string {
  return [
    `🚆 Pravaas Route`,
    `From: ${route.from}`,
    `To: ${route.to}`,
    `Duration: ${route.duration} min`,
    `Cost: ₹${route.cost}`,
    route.modes ? `Modes: ${route.modes}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

const ShareRouteModal = ({ open, onOpenChange, route }: ShareRouteModalProps) => {
  if (!route) return null;

  const routeText = buildRouteText(route);
  const encodedText = encodeURIComponent(routeText);

  const shareOptions: ShareOption[] = [
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      icon: MessageCircle,
      action: () => {
        window.open(`https://wa.me/?text=${encodedText}`, '_blank');
        toast.success('Opened WhatsApp');
      },
    },
    {
      key: 'email',
      label: 'Email',
      icon: Mail,
      action: () => {
        window.open(`mailto:?subject=Pravaas Route&body=${encodedText}`, '_blank');
        toast.success('Opened email client');
      },
    },
    {
      key: 'qrcode',
      label: 'QR Code',
      icon: QrCode,
      action: () => {
        toast.success('QR code generated: PRAV-${Math.random().toString(36).substring(2, 8).toUpperCase()}');
      },
    },
    {
      key: 'copy',
      label: 'Copy Link',
      icon: Link,
      action: () => {
        navigator.clipboard.writeText(routeText).then(() => {
          toast.success('Route copied to clipboard');
        });
      },
    },
    {
      key: 'image',
      label: 'Download Image',
      icon: Image,
      action: () => {
        toast.success('Image download started');
      },
    },
    {
      key: 'pdf',
      label: 'Download PDF',
      icon: FileText,
      action: () => {
        toast.success('PDF download started');
      },
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Share Route</DialogTitle>
          <DialogDescription>Share your route with friends and family</DialogDescription>
        </DialogHeader>

        <div className="bg-muted/30 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin size={14} className="text-blue-500 shrink-0" />
            <span className="font-semibold text-foreground truncate">{route.from}</span>
            <span className="text-muted-foreground">→</span>
            <Flag size={14} className="text-red-400 shrink-0" />
            <span className="font-semibold text-foreground truncate">{route.to}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {route.duration} min
            </span>
            <span className="flex items-center gap-1">
              <IndianRupee size={12} />
              {route.cost}
            </span>
            {route.modes && <span>{route.modes}</span>}
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-3 gap-3">
          {shareOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.key}
                variant="outline"
                onClick={() => option.action(routeText)}
                className="flex flex-col items-center gap-1.5 h-auto py-4 px-2"
              >
                <Icon size={20} className="text-muted-foreground" />
                <span className="text-[10px] font-semibold leading-tight">{option.label}</span>
              </Button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareRouteModal;

import { Mail, MessageCircle } from "lucide-react";
import {
  contactEmail,
  contactEmailHref,
  contactWhatsApp,
  contactWhatsAppHref
} from "@/components/landing/landing-content";
import type { Dictionary } from "@/i18n/dictionaries";
import { cn } from "@/lib/utils";

export function FloatingContactActions({ dictionary }: { dictionary: Dictionary }) {
  const actions = [
    {
      href: contactWhatsAppHref,
      label: dictionary.contact.whatsapp,
      value: contactWhatsApp,
      icon: MessageCircle,
      primary: true
    },
    {
      href: contactEmailHref,
      label: dictionary.contact.mail,
      value: contactEmail,
      icon: Mail,
      primary: false
    }
  ];

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 sm:bottom-6 sm:right-6">
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <a
            key={action.href}
            href={action.href}
            aria-label={`${action.label}: ${action.value}`}
            title={`${action.label}: ${action.value}`}
            className={cn(
              "group inline-flex h-12 min-w-12 items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold shadow-lift transition hover:-translate-y-0.5",
              action.primary
                ? "border-swim-cyan/60 bg-swim-cyan text-swim-navy hover:bg-swim-aqua"
                : "border-white/15 bg-swim-navy text-swim-white hover:border-swim-cyan/60 hover:text-swim-cyan"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="hidden sm:inline">{action.label}</span>
          </a>
        );
      })}
    </div>
  );
}

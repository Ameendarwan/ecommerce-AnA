"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { questionService } from "@/services/question/questionService";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Clock, MapPin, Loader2 } from "lucide-react";

interface ContactFormProps {
  storePhone?: string;
  storeEmail?: string;
  storeAddress?: string;
  storeHours?: string;
}

export function ContactForm({
  storePhone,
  storeEmail,
  storeAddress,
  storeHours,
}: ContactFormProps) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!message.trim()) {
      toast.error("Please enter your message");
      return;
    }

    try {
      setIsSubmitting(true);
      await questionService.createQuestion({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        question: message.trim(),
        userId: user?.id ?? null,
      });

      toast.success("Thank you! Your message has been sent successfully.");
      setName("");
      if (!user) setEmail("");
      setPhone("");
      setMessage("");
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast.error("Failed to send message. Please try again or reach us via email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-foreground mb-8 text-3xl font-bold tracking-tight sm:text-4xl">
        Contact Us
      </h1>

      {/* Form matching screenshot */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contact-name" className="text-foreground/90 text-sm font-medium">
              Name
            </Label>
            <Input
              id="contact-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="border-input bg-background text-foreground placeholder:text-muted-foreground/60 h-11 w-full rounded-md border px-3 text-sm focus-visible:ring-1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-email" className="text-foreground/90 text-sm font-medium">
              Email
            </Label>
            <Input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              className="border-input bg-background text-foreground placeholder:text-muted-foreground/60 h-11 w-full rounded-md border px-3 text-sm focus-visible:ring-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-phone" className="text-foreground/90 text-sm font-medium">
            Phone
          </Label>
          <Input
            id="contact-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Your phone number"
            className="border-input bg-background text-foreground placeholder:text-muted-foreground/60 h-11 w-full rounded-md border px-3 text-sm focus-visible:ring-1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-message" className="text-foreground/90 text-sm font-medium">
            Message
          </Label>
          <Textarea
            id="contact-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message here..."
            required
            rows={5}
            className="border-input bg-background text-foreground placeholder:text-muted-foreground/60 min-h-35 w-full rounded-md border p-3 text-sm focus-visible:ring-1"
          />
        </div>

        <div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 min-w-25 rounded-md px-6 py-2.5 text-sm font-medium shadow-xs transition-colors"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Sending...
              </span>
            ) : (
              "Send"
            )}
          </Button>
        </div>
      </form>

      {/* Direct Contact Info */}
      {(storePhone || storeEmail || storeAddress || storeHours) && (
        <div className="border-border/60 mt-14 border-t pt-10">
          <h2 className="text-foreground mb-6 text-lg font-semibold tracking-tight">
            Other ways to reach us
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {storePhone && (
              <div className="bg-muted/40 flex items-start gap-3 rounded-lg border p-4">
                <Phone className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="text-muted-foreground text-xs font-medium uppercase">Phone</p>
                  <a
                    href={`tel:${storePhone.replace(/-/g, "")}`}
                    className="text-foreground text-sm font-medium hover:underline"
                  >
                    {storePhone}
                  </a>
                </div>
              </div>
            )}

            {storeEmail && (
              <div className="bg-muted/40 flex items-start gap-3 rounded-lg border p-4">
                <Mail className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="text-muted-foreground text-xs font-medium uppercase">Email</p>
                  <a
                    href={`mailto:${storeEmail}`}
                    className="text-foreground text-sm font-medium hover:underline"
                  >
                    {storeEmail}
                  </a>
                </div>
              </div>
            )}

            {storeHours && (
              <div className="bg-muted/40 flex items-start gap-3 rounded-lg border p-4">
                <Clock className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="text-muted-foreground text-xs font-medium uppercase">Hours</p>
                  <p className="text-foreground text-sm font-medium">{storeHours}</p>
                </div>
              </div>
            )}

            {storeAddress && (
              <div className="bg-muted/40 flex items-start gap-3 rounded-lg border p-4">
                <MapPin className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="text-muted-foreground text-xs font-medium uppercase">Location</p>
                  <p className="text-foreground text-sm font-medium">{storeAddress}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

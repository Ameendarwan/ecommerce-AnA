"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Truck, Phone, Clock, Share2 } from "lucide-react";
import {
  adminSettingsService,
  UpdateStoreSettingsData,
} from "@/services/admin/adminSettingsService";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { storeSettingsKeys } from "@/hooks/queries/use-store-settings";

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shippingPrice, setShippingPrice] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [hours, setHours] = useState("");
  const [socialTiktok, setSocialTiktok] = useState("");
  const [socialYoutube, setSocialYoutube] = useState("");
  const [socialFacebook, setSocialFacebook] = useState("");
  const [socialInstagram, setSocialInstagram] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    void fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setInitialLoading(true);
      const data = await adminSettingsService.getSettings();
      setShippingPrice(String(data.shipping_price));
      setPhone(data.phone);
      setEmail(data.email);
      setAddress(data.address);
      setHours(data.hours);
      setSocialTiktok(data.social_tiktok);
      setSocialYoutube(data.social_youtube);
      setSocialFacebook(data.social_facebook);
      setSocialInstagram(data.social_instagram);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load store settings");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSave = async () => {
    const parsedShipping = Number(shippingPrice);
    if (!Number.isFinite(parsedShipping) || parsedShipping < 0) {
      setFormError("Shipping price must be a valid non-negative number");
      return;
    }
    if (!email.trim()) {
      setFormError("Email is required");
      return;
    }

    setFormError("");
    setSaving(true);

    try {
      const payload: UpdateStoreSettingsData = {
        shipping_price: parsedShipping,
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        hours: hours.trim(),
        social_tiktok: socialTiktok.trim(),
        social_youtube: socialYoutube.trim(),
        social_facebook: socialFacebook.trim(),
        social_instagram: socialInstagram.trim(),
      };

      await adminSettingsService.updateSettings(payload);
      await queryClient.invalidateQueries({ queryKey: storeSettingsKeys.all });
      toast.success("Store settings saved");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save settings",
      );
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Store Settings</h1>
        <p className="text-muted-foreground">
          Manage shipping, contact details, and social links shown on the
          storefront
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Truck className="h-5 w-5" />
            Shipping
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="shipping-price">Flat shipping fee (PKR)</Label>
            <Input
              id="shipping-price"
              type="number"
              min={0}
              step={1}
              value={shippingPrice}
              onChange={(e) => {
                setShippingPrice(e.target.value);
                if (formError) setFormError("");
              }}
              placeholder="250"
            />
            <p className="text-muted-foreground text-xs">
              Used in cart, checkout, and shipping policy pages
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Phone className="h-5 w-5" />
            Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0310-0021434"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (formError) setFormError("");
              }}
              placeholder="admin@example.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address">Address</Label>
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              placeholder="Street, city, country"
              className="border-input bg-background placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:outline-none focus-visible:ring-0"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hours" className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              Business hours
            </Label>
            <Input
              id="hours"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="Mon–Sat: 02:00 PM to 09:00 PM"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Share2 className="h-5 w-5" />
            Social media
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="social-instagram">Instagram URL</Label>
            <Input
              id="social-instagram"
              value={socialInstagram}
              onChange={(e) => setSocialInstagram(e.target.value)}
              placeholder="https://www.instagram.com/..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="social-tiktok">TikTok URL</Label>
            <Input
              id="social-tiktok"
              value={socialTiktok}
              onChange={(e) => setSocialTiktok(e.target.value)}
              placeholder="https://www.tiktok.com/@..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="social-facebook">Facebook URL</Label>
            <Input
              id="social-facebook"
              value={socialFacebook}
              onChange={(e) => setSocialFacebook(e.target.value)}
              placeholder="https://www.facebook.com/..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="social-youtube">YouTube URL</Label>
            <Input
              id="social-youtube"
              value={socialYoutube}
              onChange={(e) => setSocialYoutube(e.target.value)}
              placeholder="https://www.youtube.com/@..."
            />
          </div>
        </CardContent>
      </Card>

      {formError && (
        <p className="text-destructive text-sm">{formError}</p>
      )}

      <div className="flex justify-end">
        <Button onClick={() => void handleSave()} disabled={saving}>
          {saving ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </div>
  );
}

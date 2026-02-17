import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Send, MessageSquare, CheckCircle } from "lucide-react";
import { z } from "zod";

const ticketSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
});

export default function Support() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.user_metadata?.display_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = ticketSchema.safeParse({ name, email, message });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("support_tickets").insert({
      user_id: user?.id || null,
      name: result.data.name,
      email: result.data.email,
      message: result.data.message,
    });

    setSubmitting(false);

    if (error) {
      toast.error("Failed to submit. Please try again.");
      return;
    }

    setSubmitted(true);
    toast.success("Your message has been sent!");
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 p-4">
        <Card className="glass-card text-center">
          <CardContent className="py-12">
            <CheckCircle className="mx-auto h-16 w-16 text-success mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Message Sent</h2>
            <p className="text-muted-foreground mb-6">
              We've received your message and will get back to you within 24-48 hours.
            </p>
            <Button variant="outline" onClick={() => { setSubmitted(false); setMessage(""); }}>
              Send Another Message
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Contact & Support</h1>
        <p className="text-muted-foreground mt-1">Have a question, bug report, or feature request? Let us know.</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Send a Message
          </CardTitle>
          <CardDescription>We typically respond within 24-48 hours.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" maxLength={100} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" maxLength={255} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your issue or feedback..." rows={5} maxLength={2000} required />
              <p className="text-xs text-muted-foreground text-right">{message.length}/2000</p>
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              <Send className="mr-2 h-4 w-4" />
              {submitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

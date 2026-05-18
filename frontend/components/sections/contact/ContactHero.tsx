"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Mail, Phone, MessageSquare, Send, HelpCircle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function ContactHero() {
  const router = useRouter();
  const { success, error } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        success('Message sent successfully!', 'We will get back to you within 24-48 hours.');
        setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
      } else {
        const errorData = await response.json();
        error('Failed to send message', errorData.error || 'Please try again later.');
      }
    } catch (err) {
      error('Network error', 'Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative w-full px-4 sm:px-6 overflow-hidden py-16 md:px-12 lg:px-20">
      {/* GRID BACKGROUND */}
      <div className="absolute inset-0 -z-10 opacity-[0.05]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, black 1px, transparent 1px),
              linear-gradient(to bottom, black 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px"
          }}
        />
      </div>

      <div className="grid items-start gap-8 sm:gap-12 mx-auto max-w-7xl lg:grid-cols-2">
        {/* LEFT CONTENT - Hero Section */}
        <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center px-3 py-1 text-xs border rounded-full text-muted-foreground">
            Get in Touch
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading leading-[1.1] tracking-tight">
            Contact
            <br />
            <span className="text-primary">
              ZikoRetire
            </span>
          </h1>
          <p className="mt-2 max-w-lg text-base sm:text-lg lg:text-xl text-muted-foreground">
            Have questions about retirement planning? Need help with your pension projections? 
            Our team is here to support you on your journey to financial security.
          </p>
          
          {/* Contact Information */}
          <div className="space-y-4 pt-6">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">tapotandane@gmail.com</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">+265 999 123 456</span>
            </div>
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Send us a message</span>
            </div>
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">FAQ & Support</span>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground pt-4">
            Response time: 24-48 hours • School Project • Demo Purposes
          </p>
        </div>

        {/* RIGHT CONTENT - FORM */}
        <div className="space-y-6">
          {/* MAIN CARD */}
          <div className="relative p-6 sm:p-8 border shadow-2xl bg-card border-border/50 rounded-2xl backdrop-blur">
            {/* HEADER */}
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold mb-2">Send us a Message</h2>
              <p className="text-sm text-muted-foreground">
                Fill out the form below and we'll get back to you soon.
              </p>
            </div>

            {/* FORM */}
            <form id="contact-form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <select 
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Partnership">Partnership</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full hover:shadow-lg hover:scale-[1.02] transition-all duration-200" 
                size="lg" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </form>

          </div>
        </div>
      </div>
    </section>
  );
}

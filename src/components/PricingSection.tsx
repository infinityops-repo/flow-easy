import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const pricingPlans = [
  {
    title: "Free",
    price: "$0",
    features: ["5 workflows/month", "Basic templates", "Community support"],
    priceId: "free_tier"
  },
  {
    title: "Pro",
    price: "$12",
    features: ["Unlimited workflows", "Premium templates", "Priority support", "Custom integrations"],
    priceId: "price_pro" // You'll need to replace this with your actual Stripe price ID
  },
  {
    title: "Enterprise",
    price: "Custom",
    features: ["Custom solutions", "Dedicated support", "SLA guarantee", "Advanced security"],
    priceId: "price_enterprise" // You'll need to replace this with your actual Stripe price ID
  },
];

export const PricingSection = () => {
  const { toast } = useToast();

  const handleSubscribe = async (priceId: string, planTitle: string) => {
    if (priceId === 'free_tier') {
      toast({
        title: "Free Plan Selected",
        description: "You can start using the free plan right away!",
      });
      return;
    }

    try {
      // This will be implemented when Stripe is fully integrated
      toast({
        title: "Coming Soon",
        description: `${planTitle} subscription will be available soon!`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again later.",
      });
    }
  };

  return (
    <section className="w-full py-16 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Simple, Transparent Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <Card key={index} className="relative glass-card">
              <CardHeader>
                <CardTitle className="text-xl font-bold">{plan.title}</CardTitle>
                <p className="text-3xl font-bold">{plan.price}</p>
                {plan.title === "Pro" && (
                  <span className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                    Popular
                  </span>
                )}
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full"
                  variant={plan.title === "Pro" ? "default" : "outline"}
                  onClick={() => handleSubscribe(plan.priceId, plan.title)}
                >
                  {plan.title === "Enterprise" ? "Contact Sales" : "Subscribe Now"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
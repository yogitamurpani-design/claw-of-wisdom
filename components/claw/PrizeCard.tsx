"use client";

import { Badge } from "@/components/ui/8bit/badge";
import { Button } from "@/components/ui/8bit/button";
import { Card, CardContent } from "@/components/ui/8bit/card";
import { toast } from "@/components/ui/8bit/toast";
import { GIFTS, PixelGift, PixelStar, VibeIcon, type Gift } from "@/components/claw/sprites";
import { CATEGORIES, type Category } from "@/lib/quotes";
import { cn } from "@/lib/utils";

export type Prize = { id: number; text: string; category: Category; gift: Gift };

export async function copyQuote(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast("QUOTE COPIED!");
  } catch {
    toast("COPY FAILED. SELECT THE TEXT INSTEAD.");
  }
}

type PrizeCardProps = { prize: Prize | null };

export function PrizeCard({ prize }: PrizeCardProps) {
  if (!prize) {
    return (
      <Card font="normal" className="bg-card">
        <CardContent className="flex min-h-72 flex-col items-center justify-center gap-5 py-10 text-center">
          <div className="anim-bob">
            <PixelGift gift={GIFTS[0]} scale={6} />
          </div>
          <p className="retro text-[10px] leading-relaxed">NO PRIZE YET</p>
          <p className="max-w-64 text-lg text-muted-foreground">
            Insert a coin, grab a gift and your quote will pop out here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const cat = CATEGORIES.find((c) => c.id === prize.category)!;

  return (
    <div key={prize.id} className="prize-in">
      <Card font="normal" className={cn(cat.bg)}>
        <CardContent className="relative flex flex-col gap-6 px-6 py-8 sm:px-8">
          {/* sparkles */}
          <span aria-hidden="true" className="sparkle absolute top-4 left-6"><PixelStar /></span>
          <span aria-hidden="true" className="sparkle absolute right-24 bottom-6" style={{ animationDelay: "120ms" }}><PixelStar /></span>

          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-3">
              <p className="retro text-xs">YOU WON!</p>
              <Badge className="flex items-center gap-1.5 bg-card text-[8px]">
                <VibeIcon type={prize.category} /> {cat.label.toUpperCase()}
              </Badge>
            </div>
            <PixelGift gift={prize.gift} scale={5} />
          </div>

          <blockquote className="text-3xl leading-tight text-balance sm:text-4xl">
            “{prize.text}”
          </blockquote>

          <div className="flex flex-wrap gap-4">
            <Button onClick={() => copyQuote(prize.text)} className="text-[9px]">
              COPY QUOTE
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

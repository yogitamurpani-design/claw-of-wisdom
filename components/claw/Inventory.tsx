"use client";

import { Badge } from "@/components/ui/8bit/badge";
import { Button } from "@/components/ui/8bit/button";
import { ScrollArea } from "@/components/ui/8bit/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/8bit/sheet";
import { copyQuote, type Prize } from "@/components/claw/PrizeCard";
import { GIFTS, PixelGift, VibeIcon } from "@/components/claw/sprites";
import { CATEGORIES } from "@/lib/quotes";

export function Inventory({ items }: { items: Prize[] }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="bg-lilac px-2 text-[8px]">
          BAG [{items.length}]
        </Button>
      </SheetTrigger>
      <SheetContent font="normal" className="flex w-full flex-col gap-0 bg-background sm:max-w-md">
        <SheetHeader className="border-b-4 border-ink">
          <SheetTitle className="retro text-sm">YOUR BAG</SheetTitle>
          <SheetDescription className="text-base">
            Every quote you&apos;ve won this session.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
              <PixelGift gift={GIFTS[4]} scale={5} />
              <p className="retro text-[9px] leading-relaxed">BAG IS EMPTY</p>
              <p className="text-muted-foreground">Win a gift to start your collection.</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-6 p-6">
              {items.map((item) => {
                const cat = CATEGORIES.find((c) => c.id === item.category)!;
                return (
                  <li key={item.id} className="pixel-box flex gap-4 bg-card p-4">
                    <PixelGift gift={item.gift} scale={3} className="shrink-0" />
                    <div className="flex min-w-0 flex-col gap-3">
                      <Badge className={`${cat.bg} flex items-center gap-1.5 self-start text-[7px]`}>
                        <VibeIcon type={item.category} /> {cat.label.toUpperCase()}
                      </Badge>
                      <p className="text-lg leading-snug">“{item.text}”</p>
                      <Button
                        variant="outline"
                        onClick={() => copyQuote(item.text)}
                        className="self-start bg-card px-2 text-[8px]"
                      >
                        COPY
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

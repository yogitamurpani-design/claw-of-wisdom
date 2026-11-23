"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/8bit/popover";
import { PixelCoin } from "@/components/claw/sprites";

/** "?" button next to CREDITS that explains how credits work. */
export function CreditsInfo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="What are credits?"
          className="retro grid size-6 place-items-center rounded-full border-2 border-butter bg-ink text-[10px] text-butter transition-transform duration-100 active:translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bubblegum"
        >
          ?
        </button>
      </PopoverTrigger>
      <PopoverContent font="normal" align="start" className="w-72 p-4">
        <div className="flex flex-col gap-3">
          <p className="retro flex items-center gap-2 text-[10px] leading-relaxed">
            <PixelCoin scale={2} /> WHAT ARE CREDITS?
          </p>
          <ul className="flex flex-col gap-2 text-lg leading-snug">
            <li>
              <span className="text-bubblegum">▸</span> 1 credit = 1 play. Every <b>DROP</b> uses one.
            </li>
            <li>
              <span className="text-bubblegum">▸</span> Press <b>INSERT COIN</b> to get 3 credits (you can hold up to 9).
            </li>
            <li>
              <span className="text-bubblegum">▸</span> Coins are pretend. It&apos;s completely free.
            </li>
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
}

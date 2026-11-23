import { ClawMachine } from "@/components/claw/ClawMachine";
import { GIFTS, PixelGift } from "@/components/claw/sprites";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-12 px-4 py-10 sm:px-8 sm:py-14">
      <header className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <div className="anim-bob hidden sm:block" aria-hidden="true">
            <PixelGift gift={GIFTS[1]} scale={5} />
          </div>
          <div className="flex flex-col">
            <h1 className="retro text-2xl leading-tight sm:text-4xl">
              CLAW <span className="text-bubblegum">OF</span> WISDOM
            </h1>
          </div>
        </div>
        <p className="max-w-2xl text-xl leading-snug text-muted-foreground">
          Insert a coin, pick a vibe and steer the claw. Every gift box hides a quote: a push of
          motivation, a little life advice or something silly.
        </p>      </header>
      <main>
        <ClawMachine />
      </main>
      <footer className="retro mt-auto text-center text-[8px] text-muted-foreground">
        © CLAW OF WISDOM · NO REAL COINS WERE HARMED
      </footer>
    </div>
  );
}

import { NeonCard } from "../ui/NeonCard";
import { classes } from "../../design/tokens";
import { Backgrounds, Tiles } from "../../assets/placeholders";
import { useTranslations } from "next-intl";

export function DemoContainer() {
  const t = useTranslations("demo");
  return (
    <NeonCard>
      <div className="relative overflow-hidden rounded">
        <img src={Backgrounds.grid} alt="grid" className="absolute inset-0 w-full h-full object-cover opacity-40" style={{ filter: "drop-shadow(0 0 6px var(--neon-cyan))" }} />
        <img src={Backgrounds.glow} alt="glow" className="absolute inset-0 w-full h-full object-cover opacity-30" style={{ filter: "drop-shadow(0 0 10px var(--neon-purple))" }} />
        <div className="relative p-4">
          <h3 className={classes.accent}>{t("placeholder")}</h3>
          <div className="grid grid-cols-6 gap-3 mt-4">
            <img src={Tiles.btc} alt="btc" className="w-10 h-10" style={{ filter: "drop-shadow(0 0 6px var(--neon-cyan))" }} />
            <img src={Tiles.eth} alt="eth" className="w-10 h-10" style={{ filter: "drop-shadow(0 0 6px var(--neon-purple))" }} />
            <img src={Tiles.bnb} alt="bnb" className="w-10 h-10" style={{ filter: "drop-shadow(0 0 6px var(--neon-cyan))" }} />
            <img src={Tiles.fly} alt="fly" className="w-10 h-10" style={{ filter: "drop-shadow(0 0 6px var(--neon-purple))" }} />
            <img src={Tiles.empty} alt="empty" className="w-10 h-10" style={{ filter: "drop-shadow(0 0 6px var(--neon-cyan))" }} />
            <img src={Tiles.unknown} alt="unknown" className="w-10 h-10" style={{ filter: "drop-shadow(0 0 6px var(--neon-purple))" }} />
          </div>
        </div>
      </div>
    </NeonCard>
  );
}

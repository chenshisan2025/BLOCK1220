import { NeonCard } from "../src/components/ui/NeonCard";
import { NeonButton } from "../src/components/ui/NeonButton";
import { classes } from "../src/design/tokens";
import { NeonIcon } from "../src/components/ui/NeonIcon";
import { LoaderCircle, Ban, Zap, TriangleAlert } from "lucide-react";

export default function Page() {
  return (
    <main className="p-6 space-y-6">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NeonCard>
          <div className="flex items-center gap-2">
            <NeonIcon icon={LoaderCircle} />
            <h2 className={classes.accent}>Loading</h2>
          </div>
          <p>正在加载资源</p>
        </NeonCard>
        <NeonCard>
          <div className="flex items-center gap-2">
            <NeonIcon icon={Ban} />
            <h2 className={classes.accent}>Empty</h2>
          </div>
          <p>暂无数据</p>
        </NeonCard>
        <NeonCard>
          <div className="flex items-center gap-2">
            <NeonIcon icon={TriangleAlert} />
            <h2 className={classes.accent}>Error</h2>
          </div>
          <p className={classes.warning}>发生错误</p>
        </NeonCard>
        <NeonCard>
          <div className="flex items-center gap-2">
            <NeonIcon icon={Zap} />
            <h2 className={classes.accent}>Degraded</h2>
          </div>
          <p>服务降级运行</p>
        </NeonCard>
      </section>
      <div>
        <NeonButton>开始</NeonButton>
      </div>
    </main>
  );
}

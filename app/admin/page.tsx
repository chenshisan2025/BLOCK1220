import { NeonCard } from "../../src/components/ui/NeonCard";
import { NeonButton } from "../../src/components/ui/NeonButton";
import { NeonIcon } from "../../src/components/ui/NeonIcon";
import { ShieldAlert } from "lucide-react";
import { classes } from "../../src/design/tokens";

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <NeonCard>
        <div className="flex items-center gap-2">
          <NeonIcon icon={ShieldAlert} />
          <h1 className={classes.accent}>Admin</h1>
        </div>
        <p>管理员入口占位</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <NeonCard><h3 className={classes.accent}>Loading</h3><p>加载中</p></NeonCard>
          <NeonCard><h3 className={classes.accent}>Empty</h3><p>暂无数据</p></NeonCard>
          <NeonCard><h3 className={classes.accent}>Error</h3><p className={classes.warning}>发生错误</p></NeonCard>
          <NeonCard><h3 className={classes.accent}>Degraded</h3><p>服务降级</p></NeonCard>
        </div>
        <div className="mt-4"><NeonButton>进入控制台</NeonButton></div>
      </NeonCard>
    </div>
  );
}

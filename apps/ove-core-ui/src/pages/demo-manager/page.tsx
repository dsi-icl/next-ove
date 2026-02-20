import { env } from "../../env";

const DemoManager = () => {
  if (env.DEMO_MANAGER_URL === undefined)
    return <div>Demo Manager not configured</div>;
  return <iframe src={env.DEMO_MANAGER_URL} title="Demo Manager" className="size-full m-0 p-0 min-h-[90vh]" />;
};

export default DemoManager;

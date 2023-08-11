import { Logger } from "@ove/ove-logging";

export default () => {
  const logger = Logger("ove-core-ui")
  logger.info("Hello world!");
  return <main>
    <h1>Welcome to OVE</h1>
  </main>
}
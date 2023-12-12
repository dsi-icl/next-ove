import { type MutableRefObject, type ReactNode, useEffect } from "react";

import styles from "./page.module.scss";

type ResizeContainerProps = {
  children: ReactNode
  container: {
    ref: MutableRefObject<HTMLDivElement | null>,
    width: number,
    height: number,
    update: (contentRect?: { width: number, height: number }) => void
  }
}

const ResizeContainer = ({
  children,
  container
}: ResizeContainerProps) => {
  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      container.update(entries[0].contentRect);
    });

    if (container.ref.current === null) return;
    observer.observe(container.ref.current!);

    return () => {
      if (container.ref.current === null) return;
      observer.unobserve(container.ref.current!);
    };
  }, []);

  return <div className={styles["resize-container"]} ref={container.ref}>
    <div style={{
      width: container.width,
      height: container.height
    }}>
      {children}
    </div>
  </div>;
};

export default ResizeContainer;

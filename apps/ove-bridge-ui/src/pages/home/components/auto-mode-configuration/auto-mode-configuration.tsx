import React, {
  FormEvent,
  forwardRef,
  useCallback,
  useEffect,
  useState
} from "react";

import styles from "./auto-mode-configuration.module.scss";

export type AutoModeConfigurationProps = {
  closeDialog: () => void
}

const AutoModeConfiguration = forwardRef<HTMLDialogElement, AutoModeConfigurationProps>(({ closeDialog }, ref) => {
  const [wakeTime, setWakeTime] = useState<string | null>(null);
  const [sleepTime, setSleepTime] = useState<string | null>(null);
  const [daysSelected, setDaysSelected] = useState([false, false, false, false, false, false, false]);

  useEffect(() => {
    window.electron.getAutoSchedule().then(autoSchedule => {
      setWakeTime(autoSchedule.wake);
      setSleepTime(autoSchedule.sleep);
      setDaysSelected(autoSchedule.schedule);
    });
  }, []);
  const handleOnSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const startTime = formData.get("start-time");
    const endTime = formData.get("end-time");

    window.electron.setAutoSchedule({ wake: startTime?.toString() ?? null, sleep: endTime?.toString() ?? null, schedule: daysSelected }).then(() => closeDialog());
  };

  const getClass = useCallback((i: number) => daysSelected[i] ? styles.active : undefined, [daysSelected]);
  const updateArr = (arr: boolean[], i: number) => {
    if (i === 0) return [!arr[i], ...arr.slice(1)];
    if (i === arr.length - 1) return [...arr.slice(0, arr.length - 1), !arr[arr.length - 1]];
    return [...arr.slice(0, i), !arr[i], ...arr.slice(i + 1)];
  };

  return <dialog onClick={() => closeDialog()} ref={ref}
                 className={styles.dialog}>
    <div className={styles.hidden} onClick={e => e.stopPropagation()}>
      <h2>Configure Automatic
        Device Schedule</h2>
      <form className={styles.form} onSubmit={handleOnSubmit}>
        <label htmlFor="start-time">Wake Time</label>
        <div className={styles.time}>
          <input id="start-time" name="start-time" type="time"
                 defaultValue={wakeTime ?? undefined} />
          <button type="button" onClick={() => setWakeTime(null)}>Clear</button>
        </div>
        <label htmlFor="end-time">Sleep Time</label>
        <div className={styles.time}>
          <input id="end-time" name="end-time" type="time"
                 defaultValue={sleepTime ?? undefined} />
          <button type="button" onClick={() => setSleepTime(null)}>Clear
          </button>
        </div>
        <div className={styles["day-container"]}>
          <button type="button" className={`${styles.day} ${getClass(0)}`}
                  onClick={() => setDaysSelected(cur => updateArr(cur, 0))}>Sun
          </button>
          <button type="button" className={`${styles.day} ${getClass(1)}`}
                  onClick={() => setDaysSelected(cur => updateArr(cur, 1))}>Mon
          </button>
          <button type="button" className={`${styles.day} ${getClass(2)}`}
                  onClick={() => setDaysSelected(cur => updateArr(cur, 2))}>Tue
          </button>
          <button type="button" className={`${styles.day} ${getClass(3)}`}
                  onClick={() => setDaysSelected(cur => updateArr(cur, 3))}>Wed
          </button>
          <button type="button" className={`${styles.day} ${getClass(4)}`}
                  onClick={() => setDaysSelected(cur => updateArr(cur, 4))}>Thu
          </button>
          <button type="button" className={`${styles.day} ${getClass(5)}`}
                  onClick={() => setDaysSelected(cur => updateArr(cur, 5))}>Fri
          </button>
          <button type="button" className={`${styles.day} ${getClass(6)}`}
                  onClick={() => setDaysSelected(cur => updateArr(cur, 6))}>Sat
          </button>
        </div>
        <button className={styles.submit} type="submit">Save</button>
      </form>
    </div>
  </dialog>;
});

export default AutoModeConfiguration;
import { useForm } from "react-hook-form";

import styles from "./auto-mode-configuration.module.scss";
import { useEffect } from "react";

export type AutoModeConfigurationProps = {
  closeDialog: () => void
}

type Form = {
  start: string | undefined
  end: string | undefined
  days: boolean[]
}

const defaultDaySelection = [false, false, false, false, false, false, false];

const AutoModeConfiguration = ({ closeDialog }: AutoModeConfigurationProps) => {
  const { register, setValue, handleSubmit } = useForm<Form>();

  useEffect(() => {
    window.electron.getAutoSchedule().then(autoSchedule => {
      setValue("start" as const, autoSchedule?.wake ?? undefined);
      setValue("end" as const, autoSchedule?.sleep ?? undefined);
      setValue("days" as const, autoSchedule?.schedule ?? defaultDaySelection);
    });
  }, []);

  const onSubmit = ({ start, end, days }: Form) => {
    window.electron.setAutoSchedule({
      wake: start ?? null,
      sleep: end ?? null,
      schedule: days
    }).then(() => closeDialog());
  };

  return <>
    <h2>Configure Automatic Device Schedule</h2>
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <fieldset className={styles.time}>
        <legend>Wake Time</legend>
        <input {...register("start")} type="time" />
        <button type="button" onClick={() => setValue("start", undefined)}>Clear
        </button>
      </fieldset>
      <fieldset className={styles.time}>
        <legend>Sleep Time</legend>
        <input {...register("end")} type="time" />
        <button type="button" onClick={() => setValue("end", undefined)}>Clear
        </button>
      </fieldset>
      <fieldset className={styles["day-container"]}>
        <legend>Days of Operation</legend>
        <div>
          <label htmlFor="days.0">Sun</label>
          <input {...register("days.0")} type="checkbox" />
        </div>
        <div>
          <label htmlFor="days.1">Mon</label>
          <input {...register("days.1")} type="checkbox" />
        </div>
        <div>
          <label htmlFor="days.2">Tue</label>
          <input {...register("days.2")} type="checkbox" />
        </div>
        <div>
          <label htmlFor="days.3">Wed</label>
          <input {...register("days.3")} type="checkbox" />
        </div>
        <div>
          <label htmlFor="days.4">Thu</label>
          <input {...register("days.4")} type="checkbox" />
        </div>
        <div>
          <label htmlFor="days.5">Fri</label>
          <input {...register("days.5")} type="checkbox" />
        </div>
        <div>
          <label htmlFor="days.6">Sat</label>
          <input {...register("days.6")} type="checkbox" />
        </div>
      </fieldset>
      <button className={styles.submit} type="submit">Save</button>
    </form>
  </>;
};

export default AutoModeConfiguration;

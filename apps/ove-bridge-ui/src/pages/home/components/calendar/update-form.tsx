import { FormEvent, forwardRef } from "react";

import styles from "./update-form.module.scss";

export type UpdateFormProps = {
  updateCalendar: (accessToken: string) => void
  closeDialog: () => void
}

const UpdateForm =
  forwardRef<HTMLDialogElement, UpdateFormProps>(
    ({ updateCalendar, closeDialog },
      ref
    ) => {
      const handleOnSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const accessToken = formData.get("access-token");
        if (accessToken === null || accessToken === "") return false;
        updateCalendar(accessToken.toString());
        closeDialog();
      };

      return <dialog ref={ref} onClick={closeDialog}>
        <div onClick={e => void e.stopPropagation()}>
          <form onSubmit={handleOnSubmit} className={styles.form}>
            <label htmlFor="access-token">Access Token</label>
            <input id="access-token" name="access-token" type="text" />
          </form>
        </div>
      </dialog>;
    });

export default UpdateForm;

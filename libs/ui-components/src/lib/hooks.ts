import { toast } from "sonner";
import { useEffect } from "react";
import { Json } from "@ove/ove-utils";
import type { FieldErrors } from "react-hook-form";

export const useFormErrorHandling = (errors: FieldErrors) => {
  useEffect(() => {
    Object.values(errors).forEach(error =>
      toast.error(Json.stringify(error?.message)));
  }, [errors]);
};

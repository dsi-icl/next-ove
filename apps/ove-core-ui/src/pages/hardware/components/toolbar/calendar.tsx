import React from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@ove/ui-base-components";
import { api } from "../../../../utils/api";
import { Calendar as CalendarIcon } from "lucide-react";
import { CalendarView, useCalendar } from "@ove/ui-base-components";

const Calendar = ({ bridgeId }: { bridgeId: string }) => {
  const getCalendar = api.bridge.getCalendar.useQuery({ bridgeId });
  const { calendar, lastUpdated } = useCalendar(getCalendar.data?.response);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <CalendarIcon className="mr-2 size-4" />
          View Calendar
        </Button>
      </DialogTrigger>
      <DialogContent
        className="w-[65vw] max-w-[unset]"
        aria-description="calendar content"
      >
        <DialogHeader className="h-fit">
          <DialogTitle>Observatory Calendar</DialogTitle>
          <DialogDescription>View usage of the observatory</DialogDescription>
        </DialogHeader>
        <div className="flex h-[40vh] w-full flex-col items-center">
          <CalendarView calendar={calendar ?? []} />
          <div className="flex w-full py-4">
            <h4>Last Updated:</h4>
            <p className="ml-auto">{lastUpdated}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Calendar;

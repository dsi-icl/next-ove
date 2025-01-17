import React from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@ove/ui-base-components";
import { api } from "../../../../utils/api";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar as CalendarDisplay, useCalendar } from "@ove/ui-components";

const Calendar = ({ bridgeId }: { bridgeId: string }) => {
  const getCalendar = api.bridge.getCalendar.useQuery({ bridgeId });
  const { calendar, lastUpdated } = useCalendar(getCalendar.data?.response);

  return <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline">
        <CalendarIcon className="mr-2 h-4 w-4" />
        View Calendar
      </Button>
    </DialogTrigger>
    <DialogContent className="max-w-[unset] w-[65vw]"
                   aria-description="calendar content">
      <DialogHeader className="h-fit">
        <DialogTitle>Observatory Calendar</DialogTitle>
        <DialogDescription>View usage of the observatory</DialogDescription>
      </DialogHeader>
      <div className="w-full h-[40vh] flex flex-col items-center">
        <CalendarDisplay calendar={calendar} />
        <div className="w-full flex pt-4 pb-4">
          <h4>Last Updated:</h4>
          <p className="ml-auto">{lastUpdated}</p>
        </div>
      </div>
    </DialogContent>
  </Dialog>;
};

export default Calendar;

import React from "react";
import {
  Button,
  CalendarView,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  useCalendar,
} from "@ove/ui-base-components";
import { api } from "../../../../utils/api";
import { Calendar as CalendarIcon } from "lucide-react";

const Calendar = ({ bridgeId }: { bridgeId: string }) => {
  const getCalendar = api.bridge.getCalendar.useQuery({ bridgeId });
  const { calendar, lastUpdated } = useCalendar(getCalendar.data?.response);

  return calendar !== undefined ? (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <CalendarIcon className="mr-2 size-4" />
          View Calendar
        </Button>
      </DialogTrigger>
      <DialogContent
        className="w-[90vw] h-[90vh] max-w-[unset] flex flex-col"
        aria-description="calendar content"
      >
        <DialogHeader>
          <DialogTitle>Observatory Calendar</DialogTitle>
          <DialogDescription>View usage of the observatory</DialogDescription>
        </DialogHeader>
        <div className="flex h-[calc(90vh-16rem)] mt-8 w-full flex-col items-center">
          <CalendarView calendar={calendar ?? []} />
          <div className="flex w-full py-4 mt-auto">
            <h4 className="font-bold">Last Updated:</h4>
            <p className="ml-auto font-medium">{lastUpdated}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  ) : null;
};

export default Calendar;

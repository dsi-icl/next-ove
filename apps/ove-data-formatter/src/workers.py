import multiprocessing
from datetime import timezone, datetime
from enum import Enum
import signal
import uuid
from typing import Any, Callable


class TaskStatus(Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


Task = Callable[..., None]


def worker_main(
        worker_id: int,
        task_queue: multiprocessing.Queue,
        task_state: dict[str, dict[str, str | datetime]],
) -> None:
    signal.signal(signal.SIGINT, signal.SIG_IGN)

    print(f"Worker {worker_id} started")

    while True:
        task_id, task, args = task_queue.get()
        task_state[task_id] = {**task_state[task_id], "state": TaskStatus.PROCESSING.value}

        try:
            task(*args)
            task_state[task_id] = {**task_state[task_id], "state": TaskStatus.COMPLETED.value}
        except Exception as exc:
            task_state[task_id] = {**task_state[task_id], "state": TaskStatus.FAILED.value, "error": str(exc)}
        finally:
            task_state[task_id] = {**task_state[task_id], "completed_at": datetime.now(timezone.utc)}


class WorkerPool:
    def __init__(self, num_workers: int = 3) -> None:
        manager = multiprocessing.Manager()

        self.task_queue: multiprocessing.Queue = (
            multiprocessing.Queue()
        )
        self.task_state: dict[str, dict[str, datetime | str]] = manager.dict()
        self.processes: list[multiprocessing.Process] = []

        for i in range(num_workers):
            process = multiprocessing.Process(
                target=worker_main,
                args=(
                    i + 1,
                    self.task_queue,
                    self.task_state,
                ),
                daemon=True,
            )
            self.processes.append(process)

    def start(self) -> None:
        for process in self.processes:
            process.start()

    def enqueue(self, *args: Any, task_type: str, filename: str, task: Task) -> str:
        task_id = str(uuid.uuid4())

        self.task_state[task_id] = {
            "state": TaskStatus.PENDING.value,
            "created_at": datetime.now(timezone.utc),
            "type": task_type,
            "file": filename,
            "error": "",
        }

        self.task_queue.put((task_id, task, args))
        return task_id

    def get_status(self, task_id: str) -> dict[str, str] | None:
        return self.task_state.get(task_id)

    def get_all_statuses(self) -> dict[str, dict[str, str]]:
        return dict(self.task_state)


worker_pool: WorkerPool | None = None


def get_worker_pool() -> WorkerPool | None:
    return worker_pool


def set_worker_pool(worker_pool_: WorkerPool):
    global worker_pool
    worker_pool = worker_pool_

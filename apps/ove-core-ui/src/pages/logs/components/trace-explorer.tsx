import { assert } from "@ove/ove-utils";
import { api } from "../../../utils/api";
import { Card, CardHeader, CardContent } from "@ove/ui-base-components";

interface Span {
  span_id: string;
  parent_span_id: string | null;
  service: string;
  name: string;
  start_time: string;
  end_time: string;
  children: Span[];
}

function buildTree(spans: Omit<Span, "children">[]) {
  const map = new Map<string, Span>();

  spans.forEach((s) => map.set(s.span_id, { ...s, children: [] }));

  const roots: Span[] = [];

  map.forEach((span) => {
    if (span.parent_span_id && map.has(span.parent_span_id)) {
      assert(map.get(span.parent_span_id)).children.push(span);
    } else {
      roots.push(span);
    }
  });

  const sortTree = (nodes: Span[]) => {
    nodes.sort(
      (a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
    );
    nodes.forEach((n) => sortTree(n.children));
  };

  sortTree(roots);

  return roots;
}

const TraceExplorer = ({ traceId }: { traceId: string | undefined }) => {
  const { data } =
    api.logs.traceWithLogs.useQuery(
      { traceId: traceId ?? "" },
      { enabled: !!traceId }
    );

  if (!traceId || !data) return null;

  const spans = data.spans;
  const logs = data.logs;

  const rootStart = Math.min(
    ...spans.map((s: any) =>
      new Date(s.start_time).getTime()
    )
  );

  const totalDuration =
    Math.max(
      ...spans.map(
        (s: any) =>
          new Date(s.end_time).getTime()
      )
    ) - rootStart;

  const tree = buildTree(spans);

  const renderSpan = (span: any, depth = 0) => {
    const startOffset =
      new Date(span.start_time).getTime() -
      rootStart;

    const width =
      new Date(span.end_time).getTime() -
      new Date(span.start_time).getTime();

    return (
      <div key={span.span_id}>
        <div className="flex items-center text-xs">
          <div
            className="w-48 truncate"
            style={{ marginLeft: depth * 16 }}
          >
            {span.name}
          </div>

          <div className="flex-1 relative h-6 bg-muted rounded">
            <div
              className="absolute h-6 bg-blue-500 rounded"
              style={{
                left: `${
                  (startOffset / totalDuration) *
                  100
                }%`,
                width: `${
                  (width / totalDuration) *
                  100
                }%`,
              }}
            />
          </div>
        </div>

        {span.children.map((c: any) =>
          renderSpan(c, depth + 1)
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>Trace Explorer</CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          {tree.map((s: any) =>
            renderSpan(s)
          )}
        </div>

        <div className="border-t pt-4">
          <div className="font-medium mb-2">
            Correlated Logs
          </div>
          <div className="space-y-2 text-xs">
            {logs.map((l: any) => (
              <div
                key={l.timestamp + l.message}
                className="border p-2 rounded"
              >
                <div className="text-muted-foreground">
                  {l.timestamp} [{l.level}]
                </div>
                <div>{l.message}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TraceExplorer;

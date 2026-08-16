import { ChatInterface } from "./ChatInterface";

interface GraphChatDrawerProps {
  analysisId: string;
  onClose: () => void;
}

// Side drawer that overlays the GraphView canvas so the user can ask
// questions about the live graph without losing sight of it. The graph
// stays fully interactive on the left (pan, zoom, drag nodes, filter);
// the chat takes ~400px on the right.
export function GraphChatDrawer({ analysisId, onClose }: GraphChatDrawerProps) {
  return (
    <div
      data-testid="graph-chat-drawer"
      className="absolute top-0 right-0 h-full z-30 flex flex-col"
      style={{
        width: 420,
        background: "#020409",
        borderLeft: "1px solid rgba(244,246,250,0.14)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between flex-shrink-0"
        style={{
          padding: "10px 16px",
          borderBottom: "1px solid rgba(244,246,250,0.14)",
          background: "#070B14",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: "#8FB4FF",
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Ask the Graph
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#8A93A6",
              marginTop: 2,
            }}
          >
            Natural-language queries grounded in the live graph
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat drawer"
          style={{
            color: "#7C8AA0",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 20,
            lineHeight: 1,
            padding: "2px 6px",
          }}
        >
          ×
        </button>
      </div>

      {/* Body — reuse the existing ChatInterface */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <ChatInterface analysisId={analysisId} />
      </div>
    </div>
  );
}

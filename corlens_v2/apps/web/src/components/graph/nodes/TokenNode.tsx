import { Handle, type NodeProps, Position } from "reactflow";
import type { GraphNode, TokenNodeData } from "../../../lib/core-types.js";
import { NODE_COLORS } from "../../../lib/core-types.js";
import { formatNumber } from "../../../lib/utils";
import { RiskBadge } from "../RiskBadge";

type TokenNodeProps = NodeProps<GraphNode & { data: TokenNodeData }>;

export default function TokenNode({ data, selected }: TokenNodeProps) {
  const { data: nodeData, riskFlags, label } = data;
  const borderColor = NODE_COLORS.token;

  return (
    <div
      style={{
        border: `1.5px solid ${selected ? "var(--page-accent-400)" : `${borderColor}80`}`,
        background: "#0B0F1C",
        maxWidth: 160,
        minWidth: 120,
        fontSize: 11,
        color: "#E4E7F0",
        position: "relative",
        boxShadow: selected ? "0 0 12px rgba(110,163,255,0.5)" : "none",
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: borderColor }} />

      <RiskBadge riskFlags={riskFlags} />

      {/* Header */}
      <div
        style={{
          background: `${borderColor}20`,
          borderBottom: `1px solid ${borderColor}30`,
          padding: "4px 8px",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <span style={{ fontSize: 9, color: "#f59e0b", fontWeight: 700, letterSpacing: 1 }}>
          TOKEN
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: "6px 8px", display: "flex", flexDirection: "column", gap: 3 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#F4F6FA",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {nodeData.currency || label}
        </div>

        {nodeData.totalSupply && (
          <div style={{ color: "#8A93A6", fontSize: 10 }}>
            Supply: <span style={{ color: "#E4E7F0" }}>{formatNumber(nodeData.totalSupply)}</span>
          </div>
        )}

        {typeof nodeData.trustLineCount === "number" && (
          <div style={{ color: "#8A93A6", fontSize: 10 }}>
            Trust lines:{" "}
            <span style={{ color: "#E4E7F0" }}>{formatNumber(nodeData.trustLineCount)}</span>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} style={{ background: borderColor }} />
    </div>
  );
}

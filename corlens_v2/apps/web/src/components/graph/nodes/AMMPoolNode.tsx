import { Handle, type NodeProps, Position } from "reactflow";
import type { AMMPoolNodeData, GraphNode } from "../../../lib/core-types.js";
import { NODE_COLORS } from "../../../lib/core-types.js";
import { RiskBadge } from "../RiskBadge";

type AMMPoolNodeProps = NodeProps<GraphNode & { data: AMMPoolNodeData }>;

function assetLabel(asset: { currency: string; issuer?: string }): string {
  return asset.currency === "XRP" ? "XRP" : asset.currency;
}

function formatReserve(val: string): string {
  const n = Number.parseFloat(val);
  if (Number.isNaN(n)) return val;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(2);
}

export default function AMMPoolNode({ data, selected }: AMMPoolNodeProps) {
  const { data: nodeData, riskFlags } = data;
  const borderColor = NODE_COLORS.ammPool;
  const pairName = `${assetLabel(nodeData.asset1)} / ${assetLabel(nodeData.asset2)}`;

  return (
    <div
      style={{
        border: `1.5px solid ${selected ? "var(--page-accent-400)" : `${borderColor}80`}`,
        background: "#0B0F1C",
        minWidth: 150,
        maxWidth: 180,
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
        }}
      >
        <span style={{ fontSize: 9, color: "#3b82f6", fontWeight: 700, letterSpacing: 1 }}>
          AMM POOL
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: "6px 8px", display: "flex", flexDirection: "column", gap: 3 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#F4F6FA" }}>{pairName}</div>

        <div style={{ color: "#8A93A6", fontSize: 10 }}>
          {assetLabel(nodeData.asset1)}:{" "}
          <span style={{ color: "#E4E7F0" }}>{formatReserve(nodeData.reserve1)}</span>
        </div>
        <div style={{ color: "#8A93A6", fontSize: 10 }}>
          {assetLabel(nodeData.asset2)}:{" "}
          <span style={{ color: "#E4E7F0" }}>{formatReserve(nodeData.reserve2)}</span>
        </div>

        {typeof nodeData.lpHolderCount === "number" && (
          <div style={{ color: "#8A93A6", fontSize: 10 }}>
            LPs: <span style={{ color: "#3b82f6" }}>{nodeData.lpHolderCount}</span>
          </div>
        )}

        {typeof nodeData.tradingFee === "number" && (
          <div style={{ color: "#7C8AA0", fontSize: 9 }}>
            Fee: {(nodeData.tradingFee / 1000).toFixed(2)}%
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} style={{ background: borderColor }} />
    </div>
  );
}

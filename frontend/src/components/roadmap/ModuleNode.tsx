import React from "react";
import { Handle, Position } from "@xyflow/react";

interface ModuleNodeData {
  title: string;
  summary?: string;
  order: number;
}

export const ModuleNode: React.FC<{ data: ModuleNodeData }> = ({ data }) => {
  return (
    <div className="module-node shadow-sm rounded-md border bg-white px-3 py-2">
      <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
        Module {data.order + 1}
      </div>
      <div className="font-semibold text-sm">{data.title}</div>
      {data.summary && (
        <div className="text-[11px] text-gray-600 mt-1 line-clamp-2">
          {data.summary}
        </div>
      )}
      {/* Optional handles for future connections */}
      <Handle type="target" position={Position.Left} style={{ visibility: "hidden" }} />
      <Handle type="source" position={Position.Right} style={{ visibility: "hidden" }} />
    </div>
  );
};
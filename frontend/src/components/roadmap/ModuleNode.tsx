import React from "react";
import { Handle, Position } from "@xyflow/react";

interface ModuleNodeData {
  title: string;
  summary?: string;
  order: number;
}

export const ModuleNode: React.FC<{ data: ModuleNodeData }> = ({ data }) => {
  return (
    <div className="module-node border rounded-md bg-white px-3 py-2 shadow-sm hover:shadow transition cursor-pointer">
      <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">
        Module {data.order >= 0 ? data.order + 1 : "-"}
      </div>
      <div className="font-semibold text-sm leading-snug">{data.title}</div>
      {data.summary && (
        <div className="text-[11px] text-gray-600 mt-1 line-clamp-2">
          {data.summary}
        </div>
      )}
      <Handle type="target" position={Position.Left} style={{ visibility: "hidden" }} />
      <Handle type="source" position={Position.Right} style={{ visibility: "hidden" }} />
    </div>
  );
};
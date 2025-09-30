import React from "react";
import { Handle, Position } from "@xyflow/react";

interface TaskNodeData {
  title: string;
  objective?: string;
  difficulty: string;
  estimatedMinutes: number;
  status: "not_started" | "in_progress" | "completed";
}

const difficultyColor: Record<string,string> = {
  beginner: "bg-emerald-100 text-emerald-700",
  intermediate: "bg-amber-100 text-amber-700",
  advanced: "bg-rose-100 text-rose-700"
};

const statusRing: Record<string,string> = {
  not_started: "ring-gray-300",
  in_progress: "ring-sky-400",
  completed: "ring-emerald-500"
};

export const TaskNode: React.FC<{ data: TaskNodeData }> = ({ data }) => {
  return (
    <div
      className={`task-node border rounded-md bg-white px-3 py-2 ring-2 ${statusRing[data.status]} transition-colors`}
    >
      <div className="flex justify-between items-start gap-2">
        <h4 className="font-medium text-sm leading-tight">{data.title}</h4>
        <span className={`text-[10px] px-1.5 py-0.5 rounded ${difficultyColor[data.difficulty]}`}>
          {data.difficulty[0].toUpperCase()}
        </span>
      </div>
      {data.objective && (
        <p className="mt-1 text-[11px] text-gray-600 line-clamp-3">{data.objective}</p>
      )}
      <div className="mt-1 flex items-center justify-between">
        <span className="text-[10px] text-gray-500">
          {Math.round(data.estimatedMinutes / 60 * 10)/10}h
        </span>
        <StatusBadge status={data.status} />
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

const StatusBadge: React.FC<{status: TaskNodeData["status"]}> = ({ status }) => {
  const map: Record<string,string> = {
    not_started: "gray",
    in_progress: "sky",
    completed: "emerald"
  };
  return (
    <span className={`text-[10px] capitalize text-${map[status]}-600`}>
      {status.replace("_"," ")}
    </span>
  );
};
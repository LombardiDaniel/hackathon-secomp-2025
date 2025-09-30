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

const difficultyShadow: Record<string,string> = {
  beginner: "shadow-lg",
  intermediate: "shadow-lg", 
  advanced: "shadow-lg"
};

const difficultyShadowStyle: Record<string, React.CSSProperties> = {
  beginner: { boxShadow: "0 10px 15px -3px rgba(16, 185, 129, 0.3), 0 4px 6px -2px rgba(16, 185, 129, 0.1)" },
  intermediate: { boxShadow: "0 10px 15px -3px rgba(245, 158, 11, 0.3), 0 4px 6px -2px rgba(245, 158, 11, 0.1)" },
  advanced: { boxShadow: "0 10px 15px -3px rgba(239, 68, 68, 0.3), 0 4px 6px -2px rgba(239, 68, 68, 0.1)" }
};

const statusRing: Record<string,string> = {
  not_started: "ring-gray-300",
  in_progress: "ring-sky-400",
  completed: "ring-emerald-500"
};

export const TaskNode: React.FC<{ data: TaskNodeData }> = ({ data }) => {
  return (
    <div
      className={`task-node border rounded-md px-3 py-2 ring-2 ${statusRing[data.status]} ${difficultyShadow[data.difficulty]} transition-colors cursor-pointer`}
      style={difficultyShadowStyle[data.difficulty]}
    >
      <div className="flex justify-between items-start gap-2">
        <h4 className="font-medium text-sm leading-tight line-clamp-2">{data.title}</h4>
        <span className={`text-[10px] px-1.5 py-0.5 rounded ${difficultyColor[data.difficulty]}`}>
          {data.difficulty[0].toUpperCase()}
        </span>
      </div>
      {data.objective && (
        <p className="mt-1 text-[11px] text-gray-600 line-clamp-3">
          {data.objective}
        </p>
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
  const label = status.replace("_"," ");
  const map: Record<string,string> = {
    not_started: "text-gray-500",
    in_progress: "text-sky-600",
    completed: "text-emerald-600"
  };
  return (
    <span className={`text-[10px] font-medium capitalize ${map[status]}`}>
      {label}
    </span>
  );
};
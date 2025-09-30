import React from "react";
import type { Roadmap, RoadmapNode, RoadmapModule } from "../../types/roadmap";

interface SidebarProps {
  roadmap: Roadmap;
  selectedNode: any | null;
  onClose?: () => void;
  isVisible: boolean;
  progress: Record<string, "not_started" | "in_progress" | "completed">;
  onProgressChange: (nodeId: string, status: "not_started" | "in_progress" | "completed") => void;
}

const formatDifficulty = (difficulty: string) => {
  const colors = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-yellow-100 text-yellow-800", 
    advanced: "bg-red-100 text-red-800"
  };
  return colors[difficulty as keyof typeof colors] || "bg-gray-100 text-gray-800";
};

const formatTime = (minutes: number) => {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
};

const getStatusColor = (status: string) => {
  const colors = {
    not_started: "bg-gray-100 text-gray-800 border-gray-300",
    in_progress: "bg-blue-100 text-blue-800 border-blue-300",
    completed: "bg-green-100 text-green-800 border-green-300"
  };
  return colors[status as keyof typeof colors] || colors.not_started;
};

const getStatusLabel = (status: string) => {
  const labels = {
    not_started: "Não Iniciado",
    in_progress: "Em Progresso", 
    completed: "Concluído"
  };
  return labels[status as keyof typeof labels] || "Não Iniciado";
};

export const Sidebar: React.FC<SidebarProps> = ({ 
  roadmap, 
  selectedNode, 
  onClose, 
  isVisible, 
  progress,
  onProgressChange 
}) => {
  if (!isVisible) {
    return null;
  }

  if (!selectedNode) {
    return (
      <aside className="w-80 border-l bg-white p-4 overflow-y-auto animate-in slide-in-from-right">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Detalhes</h2>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
              ✕
            </button>
          )}
        </div>
        <div className="text-center text-gray-500 mt-8">
          <div className="text-lg mb-2">📍</div>
          <p>Clique em um nó para ver seus detalhes</p>
        </div>
      </aside>
    );
  }

  // Check if it's a module node
  if (selectedNode.id.startsWith("module:")) {
    const moduleId = selectedNode.id.slice("module:".length);
    const module = roadmap.modules.find(m => m.id === moduleId);
    const moduleNodes = roadmap.nodes.filter(n => n.moduleId === moduleId);
    
    if (!module) return null;

    const completedTasks = moduleNodes.filter(node => progress[node.id] === "completed").length;
    const inProgressTasks = moduleNodes.filter(node => progress[node.id] === "in_progress").length;

    return (
      <aside className="w-80 border-l bg-white p-4 overflow-y-auto animate-in slide-in-from-right">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Detalhes do Módulo</h2>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
              ✕
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-lg">{module.title}</h3>
            {module.summary && (
              <p className="text-sm text-gray-600 mt-1">{module.summary}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Ordem:</span>
              <div className="font-medium">{module.order + 1}</div>
            </div>
            <div>
              <span className="text-gray-500">Tarefas:</span>
              <div className="font-medium">{moduleNodes.length}</div>
            </div>
          </div>

          <div className="bg-gray-50 rounded p-3">
            <div className="text-sm text-gray-600 mb-2">Progresso do Módulo</div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Concluídas: {completedTasks}</span>
                <span>Em progresso: {inProgressTasks}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(completedTasks / moduleNodes.length) * 100}%` }}
                />
              </div>
              <div className="text-xs text-gray-500">
                {Math.round((completedTasks / moduleNodes.length) * 100)}% concluído
              </div>
            </div>
          </div>

          <div>
            <span className="text-gray-500 text-sm">Tempo estimado total:</span>
            <div className="font-medium">
              {formatTime(moduleNodes.reduce((sum, node) => sum + node.estimatedMinutes, 0))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Tarefas do Módulo:</h4>
            <div className="space-y-2">
              {moduleNodes.map(node => {
                const status = progress[node.id] || "not_started";
                return (
                  <div key={node.id} className="border rounded p-2 text-sm">
                    <div className="font-medium">{node.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded text-xs ${formatDifficulty(node.difficulty)}`}>
                        {node.difficulty}
                      </span>
                      <span className="text-gray-500">{formatTime(node.estimatedMinutes)}</span>
                      <span className={`px-2 py-1 rounded text-sm border ${getStatusColor(status)}`}>
                        {getStatusLabel(status)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // It's a task node
  const nodeData = roadmap.nodes.find(n => n.id === selectedNode.id);
  const module = roadmap.modules.find(m => m.id === nodeData?.moduleId);
  const prerequisites = nodeData?.prereqNodeIds?.map(id => 
    roadmap.nodes.find(n => n.id === id)
  ).filter(Boolean) || [];

  if (!nodeData) return null;

  const currentStatus = progress[nodeData.id] || "not_started";
  
  // Check if all prerequisites are completed
  const prerequisitesCompleted = prerequisites.every(prereq => 
    progress[prereq!.id] === "completed"
  );
  
  // Check if task can be completed (all prereqs must be done)
  const canComplete = prerequisitesCompleted || prerequisites.length === 0;

  return (
    <aside className="w-140 h-full border-l bg-white p-4 overflow-y-auto animate-in slide-in-from-right">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Detalhes da Tarefa</h2>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            ✕
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-lg">{nodeData.title}</h3>
          {nodeData.objective && (
            <p className="text-sm text-gray-600 mt-1">{nodeData.objective}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm ${formatDifficulty(nodeData.difficulty)}`}>
            {nodeData.difficulty}
          </span>
          <span className="text-sm text-gray-600">{formatTime(nodeData.estimatedMinutes)}</span>
        </div>

        {/* Prerequisites warning */}
        {!canComplete && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <div className="flex items-center gap-2 text-yellow-800">
              <span>⚠️</span>
              <span className="text-sm font-medium">Pré-requisitos pendentes</span>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              Complete todos os pré-requisitos antes de marcar esta tarefa como concluída.
            </p>
          </div>
        )}

        {/* Status Control */}
        <div className="bg-gray-50 rounded p-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status da Tarefa
          </label>
          <div className="space-y-2">
            {(["not_started", "in_progress", "completed"] as const).map((status) => {
              const isDisabled = status === "completed" && !canComplete;
              return (
                <label key={status} className={`flex items-center ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={currentStatus === status}
                    onChange={() => !isDisabled && onProgressChange(nodeData.id, status)}
                    disabled={isDisabled}
                    className="mr-2"
                  />
                  <span className={`px-2 py-1 rounded text-sm border ${getStatusColor(status)}`}>
                    {getStatusLabel(status)}
                    {isDisabled && " (Bloqueado)"}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {module && (
          <div>
            <span className="text-gray-500 text-sm">Módulo:</span>
            <div className="font-medium">{module.title}</div>
          </div>
        )}

        {prerequisites.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Pré-requisitos:</h4>
            <div className="space-y-1">
              {prerequisites.map(prereq => {
                const prereqStatus = progress[prereq!.id] || "not_started";
                const isCompleted = prereqStatus === "completed";
                return (
                  <div key={prereq!.id} className={`text-sm rounded p-2 flex justify-between items-center ${
                    isCompleted ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                  }`}>
                    <span className="flex items-center gap-2">
                      {isCompleted ? '✅' : '🔒'}
                      {prereq!.title}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(prereqStatus)}`}>
                      {getStatusLabel(prereqStatus)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {nodeData.contentMarkdown && (
          <div>
            <h4 className="font-medium mb-2">Conteúdo:</h4>
            <div className="text-sm bg-gray-50 rounded p-3 whitespace-pre-wrap">
              {nodeData.contentMarkdown}
            </div>
          </div>
        )}

        {nodeData.resources && nodeData.resources.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Recursos:</h4>
            <div className="space-y-2">
              {nodeData.resources.map((resource, index) => (
                <div key={index} className="border rounded p-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{resource.title}</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {resource.type}
                    </span>
                  </div>
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-xs break-all"
                  >
                    {resource.url}
                  </a>
                  {resource.cost && (
                    <div className="text-xs text-gray-500 mt-1">Custo: {resource.cost}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
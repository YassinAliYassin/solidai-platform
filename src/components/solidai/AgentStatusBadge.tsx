import React from 'react';

type AgentStatus = 'online' | 'offline' | 'busy';

type AgentStatusBadgeProps = {
  status: AgentStatus;
  agentName?: string;
  showLabel?: boolean;
};

const statusConfig = {
  online: { color: 'bg-green-500', label: 'Online' },
  offline: { color: 'bg-gray-400', label: 'Offline' },
  busy: { color: 'bg-yellow-500', label: 'Busy' },
};

const AgentStatusBadge: React.FC<AgentStatusBadgeProps> = ({
  status,
  agentName,
  showLabel = true,
}) => {
  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${config.color}`} />
      {showLabel && (
        <span className="text-sm text-gray-600">
          {agentName ? `${agentName}: ${config.label}` : config.label}
        </span>
      )}
    </div>
  );
};

export default AgentStatusBadge;

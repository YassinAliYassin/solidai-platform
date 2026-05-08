import React from 'react';

type AgentOption = {
  id: string;
  name: string;
};

type QuickAgentSwitcherProps = {
  agents: AgentOption[];
  selectedAgentId: string;
  onSelect: (agentId: string) => void;
  loading?: boolean;
};

const QuickAgentSwitcher: React.FC<QuickAgentSwitcherProps> = ({
  agents,
  selectedAgentId,
  onSelect,
  loading = false,
}) => {
  return (
    <div className="relative">
      <select
        className="block w-48 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={selectedAgentId}
        onChange={(e) => onSelect(e.target.value)}
        disabled={loading}
      >
        <option value="" disabled>
          Switch agent...
        </option>
        {agents.map((agent) => (
          <option key={agent.id} value={agent.id}>
            {agent.name}
          </option>
        ))}
      </select>
      {loading && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent" />
        </div>
      )}
    </div>
  );
};

export default QuickAgentSwitcher;

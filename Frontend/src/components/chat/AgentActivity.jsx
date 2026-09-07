/**
 * AgentActivity — collapsible activity section.
 *
 * Shows friendly tool labels (never raw tool names or JSON).
 * Active steps show spinner; completed steps show checkmark.
 */

import { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle, Loader } from "lucide-react";

export default function AgentActivity({ activities, isActive }) {
  const [expanded, setExpanded] = useState(true);

  if (!activities || activities.length === 0) return null;

  return (
    <div className="agent-activity" aria-live="polite" aria-label="Agent activity">
      <button
        className="agent-activity-toggle"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
      >
        <span className="agent-activity-label">
          {isActive ? (
            <Loader size={12} className="spin-icon" />
          ) : (
            <CheckCircle size={12} className="activity-done-icon" />
          )}
          Agent activity
        </span>
        {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {expanded && (
        <ul className="agent-activity-list" aria-label="Steps taken">
          {activities.map((step, i) => (
            <li key={i} className={`agent-activity-step ${step.done ? "step-done" : "step-active"}`}>
              {step.done ? (
                <CheckCircle size={11} className="activity-check" aria-hidden="true" />
              ) : (
                <Loader size={11} className="spin-icon activity-spinner" aria-hidden="true" />
              )}
              <span>{step.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

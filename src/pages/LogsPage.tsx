// src/pages/LogsPage.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";

interface Log {
  id: number;
  screenshot_url: string;
  webcam_url: string;
  web_log: string;
  timestamp: string;
  employee_id: string;
}

const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    axios.get("http://localhost:3000/logs").then(res => {
      setLogs(res.data);
    });
  }, []);

  return (
    <div>
      <h1>Employee Logs</h1>
      {logs.map(log => (
        <div key={log.id}>
          <p><strong>{log.employee_id}</strong> @ {new Date(log.timestamp).toLocaleString()}</p>
          <p>WebLog: {log.web_log}</p>
          {log.screenshot_url && <img src={`http://localhost:3000${log.screenshot_url}`} alt="screen" width={300} />}
          {log.webcam_url && <img src={`http://localhost:3000${log.webcam_url}`} alt="cam" width={200} />}
          <hr />
        </div>
      ))}
    </div>
  );
};

export default LogsPage;

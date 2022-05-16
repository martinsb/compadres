import React, { useEffect, useState, useRef, useCallback } from "react";
import { ProjectList } from "./components/ProjectList";
import { TodoServiceProvider } from "./context/TodoServiceContext";
import TodoService from "./service/todoService";

import { Todos } from "./Todos";

function App() {
  const [userName, setUserName] = useState("");
  const [connected, setConnected] = useState(false);
  const [projects, setProjects] = useState<
    { name: string; selected: boolean }[]
  >([]);

  const serviceRef = useRef<TodoService | undefined>(undefined);

  useEffect(() => {
    setConnected(false);
    if (!userName) {
      return;
    }
    const service = new TodoService({ name: userName });
    service.on("project-list", (projects) => {
      console.log("got project list", projects);
      setConnected(true);
      setProjects(projects.map((name) => ({ name, selected: false })));
    });
    service.on("error", (e) => {
      console.log("error", e);
    });
    service.connect();
    serviceRef.current = service;
    return () => {
      service.disconnect();
    };
  }, [userName, setUserName, setConnected]);

  const nameInputRef = useRef<HTMLInputElement>(null);

  const selectProject = useCallback(
    (name: string, selected: boolean) => {
      if (selected) {
        serviceRef.current?.open(name);
      } else {
        serviceRef.current?.close(name);
      }
      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.name === name ? { ...project, selected } : project
        )
      );
    },
    [setProjects]
  );

  return (
    <>
      {!connected && (
        <>
          <input ref={nameInputRef} type="text" defaultValue={userName} />
          <button
            onClick={() => {
              setUserName(nameInputRef.current?.value || "");
            }}
          >
            Join
          </button>
        </>
      )}
      {connected && (
        <TodoServiceProvider service={serviceRef.current!}>
          <ProjectList projects={projects} onSelectionChange={selectProject} />
          {projects.filter(({selected}) => selected).map(({name}) => (
            <Todos key={name} projectName={name} />
          ))}
        </TodoServiceProvider>
      )}
    </>
  );
}

export default App;

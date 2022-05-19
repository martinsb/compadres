import React, { useEffect, useState, useRef, useCallback } from "react";
import styled from "styled-components";
import { Join } from "./components/Join";
import { ProjectList } from "./components/ProjectList";
import { TodoServiceProvider } from "./context/TodoServiceContext";
import TodoService from "./service/todoService";

import { Todos } from "./Todos";

const Main = styled.div`
  display: flex;
  flex-direction: row;
  margin: var(--spacing);
`;

const ListContainer = styled.div`
  width: 300px;
`;

const NoProjects = styled.article`
  margin-top: 0;
`;

function App() {
  const [userName, setUserName] = useState("");
  const [connected, setConnected] = useState(false);
  const [projects, setProjects] = useState<
    { name: string; selected: boolean }[]
  >([]);
  const [errorMessage, setErrorMessage] = useState("");

  const serviceRef = useRef<TodoService | undefined>(undefined);

  useEffect(() => {
    setErrorMessage("");
    setConnected(false);
    if (!userName) {
      return;
    }
    const service = new TodoService({ name: userName });
    service.on("project-list", (projects) => {
      setConnected(true);
      setProjects(projects.map((name) => ({ name, selected: false })));
    });
    service.on("error", (e) => {
      if (e.code === "name-taken") {
        setErrorMessage("This name has already been taken");
      } else {
        console.log("error", e);
      }
    });
    service.connect();
    serviceRef.current = service;
    return () => {
      service.disconnect();
    };
  }, [userName, setUserName, setConnected]);

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

  const selectedProjects = projects.filter(({ selected }) => selected);

  return (
    <>
      {!connected && <Join onLogin={setUserName} errorMessage={errorMessage} />}
      {connected && (
        <TodoServiceProvider service={serviceRef.current!}>
          <Main>
            <ListContainer>
              <div>Choose your project(s)</div>
              <ProjectList
                projects={projects}
                onSelectionChange={selectProject}
              />
            </ListContainer>
            {!!selectedProjects.length && (
              <div>
                {selectedProjects.map(({ name }) => (
                  <Todos key={name} projectName={name} />
                ))}
              </div>
            )}
            {!selectedProjects.length && (
              <NoProjects>
                Please choose one or more projects from the sidebar on the left
              </NoProjects>
            )}
          </Main>
        </TodoServiceProvider>
      )}
    </>
  );
}

export default App;

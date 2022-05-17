import React, { createContext } from "react";
import TodoService from "../service/todoService";

interface ITodoServiceContext {
  service: TodoService;
}

export const TodoServiceContext = createContext<ITodoServiceContext>({
  service: new TodoService({ name: "" }), //we need to provide something here, otherwise we'd have `service` as an optional field
});

export const TodoServiceProvider: React.FC<{
  service: TodoService;
  children: React.ReactNode;
}> = ({ service, children }) => {
  return (
    <TodoServiceContext.Provider value={{ service }}>
      {children}
    </TodoServiceContext.Provider>
  );
};
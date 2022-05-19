import React, { useRef, useCallback, useEffect } from "react";
import { TodoList, TodoListRef } from "./components/TodoList";
import styled from "styled-components";

import useTodos from "./hooks/useTodos";

const Header = styled.h3`
  margin-bottom: 0;
`;

export const Todos: React.FC<{projectName: string}> = ({projectName}) => {
  const { items, toggle, add, updateTitle } = useTodos(projectName);
  const listRef = useRef<TodoListRef | null>(null);

  const adding = useRef(false);

  useEffect(() => {
    if (adding.current && items.length > 0) {
      listRef.current?.editTitle(items[items.length - 1].id);
    }
    adding.current = false;
  }, [items]);

  const addAndEdit = useCallback(() => {
    adding.current = true;
    add();
  }, [add]);

  return (
    <>
      <Header>{projectName}</Header>
      <TodoList
        items={items}
        onItemToggle={toggle}
        onTitleChange={updateTitle}
        onAddItem={addAndEdit}
        ref={listRef}
      />
      <button onClick={addAndEdit}>Add</button>
    </>
  );
};

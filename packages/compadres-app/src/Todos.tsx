import React, { useRef, useCallback, useEffect } from "react";
import { TodoList, TodoListRef } from "./components/TodoList";

import useTodos from "./hooks/useTodos";

export const Todos: React.FC = () => {
  const { items, toggle, add, updateTitle } = useTodos();
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
      <TodoList
        items={items}
        onItemToggle={toggle}
        onTitleChange={updateTitle}
        ref={listRef}
      />
      <button onClick={addAndEdit}>Add</button>
    </>
  );
};

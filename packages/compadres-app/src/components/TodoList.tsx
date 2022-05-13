import {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  ForwardRefRenderFunction,
  useLayoutEffect,
} from "react";
import { Item } from "../types";

export interface TodoListRef {
  editTitle: (itemId: string) => void;
}

interface TodoListProps {
  items: ReadonlyArray<Item>;
  onItemToggle: (itemId: string) => void;
  onTitleChange: (itemId: string, title: string) => void;
}

const List: ForwardRefRenderFunction<TodoListRef, TodoListProps> = (
  { items, onItemToggle, onTitleChange },
  ref
) => {
  const [focusedItemId, setFocusedItemId] = useState<string | undefined>(
    undefined
  );
  useImperativeHandle(ref, () => {
    return {
      editTitle: setFocusedItemId,
    };
  });

  const focusedInputRef = useRef<HTMLInputElement | null>(null);
  useLayoutEffect(() => {
    if (focusedItemId) {
      focusedInputRef.current?.select();
    }
  }, [focusedItemId]);

  return (
    <ul>
      {items.map(({ id, title, done }, index) => {
        const editing = id === focusedItemId;
        return (
          <li key={id}>
            <input
              type="checkbox"
              checked={done}
              onChange={() => onItemToggle(id)}
            />
            {editing && (
              <input
                type="text"
                ref={focusedInputRef}
                value={title}
                onChange={(e) => onTitleChange(id, e.target.value)}
              />
            )}
            {!editing && <span onClick={() => setFocusedItemId(id)}>{title}</span>}
          </li>
        );
      })}
    </ul>
  );
};

export const TodoList = forwardRef(List);

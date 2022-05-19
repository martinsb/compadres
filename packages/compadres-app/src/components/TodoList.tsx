import {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  ForwardRefRenderFunction,
  useLayoutEffect,
} from "react";
import styled from "styled-components";
import { Item } from "compadres-common";

const ListElement = styled.ul`
  padding-left: 0;
`;

const ItemElement = styled.li`
  display: flex;
  align-items: center;
`;

const TitleInput = styled.input`
  padding: 0 !important;
  margin-bottom: 0 !important;
  height: auto !important;
  border: none;
  outline: none;

  :focus {
    --box-shadow: none !important;
  }
`;

const CheckboxInput = styled.input`
  flex-grow: 0;
  flex-shrink: 0;
`;

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
    <ListElement>
      {items.map(({ id, title, done }, index) => {
        const editing = id === focusedItemId;
        return (
          <ItemElement key={id}>
            <CheckboxInput
              type="checkbox"
              checked={done}
              onChange={() => onItemToggle(id)}
            />
            {editing && (
              <TitleInput
                type="text"
                ref={focusedInputRef}
                value={title}
                onChange={(e) => onTitleChange(id, e.target.value)}
              />
            )}
            {!editing && <span onClick={() => setFocusedItemId(id)}>{title}</span>}
          </ItemElement>
        );
      })}
    </ListElement>
  );
};

export const TodoList = forwardRef(List);
